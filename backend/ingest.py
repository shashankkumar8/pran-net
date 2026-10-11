"""Hourly ingest of CPCB readings via data.gov.in. Fails closed; never writes sample data as live."""
import json, os, re, time, urllib.parse, urllib.request
from datetime import datetime, timezone, timedelta
import boto3
from engine import category_from_pollutants
from common import cfg, table, to_ddb

IST = timezone(timedelta(hours=5, minutes=30))
# Field aliases are ASSUMPTIONS about the feed; verify with scripts/probe_datagovin.py. Unknown shape => rows skipped.
A = {"station": ("station", "station_name"), "city": ("city",), "state": ("state",),
     "lat": ("latitude", "lat"), "lon": ("longitude", "lon", "lng"),
     "pollutant": ("pollutant_id", "pollutant"), "avg": ("avg_value", "pollutant_avg", "avg"),
     "updated": ("last_update", "last_updated")}

def pick(rec, key):
    for k in A[key]:
        if rec.get(k) not in (None, ""):
            return rec[k]
    return None

def num(v):
    try:
        f = float(v)
        return f if f == f and f not in (float("inf"), float("-inf")) else None
    except (TypeError, ValueError):
        return None

def parse_time(s):
    for fmt in ("%d-%m-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y %H:%M"):
        try:
            return datetime.strptime(str(s).strip(), fmt).replace(tzinfo=IST).astimezone(timezone.utc)
        except ValueError:
            continue
    return None

def slug(*parts):
    return re.sub(r"[^a-z0-9]+", "-", "-".join(str(p) for p in parts if p).lower()).strip("-")[:120]

def normalize(records, retrieved_at=None):
    """Group pollutant rows into one observation per station+timestamp. Returns (observations, skipped_count)."""
    retrieved_at = retrieved_at or datetime.now(timezone.utc)
    groups, skipped = {}, 0
    for r in records:
        st, ts = pick(r, "station"), parse_time(pick(r, "updated"))
        lat, lon = num(pick(r, "lat")), num(pick(r, "lon"))
        pol, val = pick(r, "pollutant"), num(pick(r, "avg"))
        if not st or ts is None or lat is None or lon is None or not (-90 <= lat <= 90 and -180 <= lon <= 180):
            skipped += 1; continue
        if ts > retrieved_at + timedelta(minutes=5):
            skipped += 1; continue
        g = groups.setdefault((slug(pick(r, "state"), pick(r, "city"), st), ts), {
            "station_id": slug(pick(r, "state"), pick(r, "city"), st), "station_name": st, "city": pick(r, "city"),
            "lat": lat, "lon": lon, "pollutants": {}, "ts": ts})
        if pol and val is not None and val >= 0:
            g["pollutants"][str(pol).upper().replace("PM2_5", "PM2.5")] = val
    out = []
    for g in groups.values():
        d = category_from_pollutants(g["pollutants"])
        ts = g.pop("ts")
        out.append({**g, "aqi": None, "aqi_category": d["category"] if d else None,
                    "category_basis": d["basis"] if d else None, "category_note": d["note"] if d else "No usable PM2.5/PM10 value.",
                    "source": "CPCB via data.gov.in (Open Government Data Platform India)", "data_status": "live",
                    "observed_at": ts.isoformat(), "observed_at_epoch": int(ts.timestamp()),
                    "retrieved_at": retrieved_at.isoformat(), "expires_at": int(ts.timestamp()) + 7 * 86400})
    return out, skipped

def fetch(resource, key, city, pages=3, page_size=500):
    rows = []
    for p in range(pages):
        q = {"api-key": key, "format": "json", "limit": page_size, "offset": p * page_size}
        if city:
            q["filters[city]"] = city
        req = urllib.request.Request(f"https://api.data.gov.in/resource/{resource}?" + urllib.parse.urlencode(q),
                                     headers={"User-Agent": "SchoolAirLedger/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            payload = json.load(r)
        batch = payload.get("records", []) if isinstance(payload, dict) else []
        rows += batch
        if len(batch) < page_size:
            break
    return rows

def metric(name, value):
    print(json.dumps({"_aws": {"Timestamp": int(time.time() * 1000), "CloudWatchMetrics": [{"Namespace": "SchoolAirLedger",
          "Dimensions": [[]], "Metrics": [{"Name": name, "Unit": "Count"}]}]}, name: value}))

def handler(event=None, context=None):
    if cfg("DATA_SOURCE_MODE", "sample").lower() != "live":
        return {"ok": True, "mode": "sample", "ingested": 0, "message": "Sample mode: ingest disabled. Use scripts/seed_sample.py (data is labelled sample)."}
    try:
        key = boto3.client("ssm").get_parameter(Name=cfg("DATA_GOV_KEY_PARAMETER"), WithDecryption=True)["Parameter"]["Value"]
        rows = fetch(cfg("DATA_GOV_RESOURCE_ID"), key, cfg("CITY_FILTER", "Delhi"))
        obs, skipped = normalize(rows)
        t = table("OBSERVATIONS_TABLE")
        with t.batch_writer(overwrite_by_pkeys=["station_id", "observed_at"]) as b:
            for o in obs:
                b.put_item(Item=to_ddb(o))
        metric("IngestFailure", 0); metric("ObservationsIngested", len(obs))
        print(json.dumps({"ingested": len(obs), "skipped_rows": skipped, "fetched_rows": len(rows)}))
        return {"ok": True, "mode": "live", "ingested": len(obs), "skipped": skipped}
    except Exception as exc:
        metric("IngestFailure", 1)
        print("INGEST_FAILED", type(exc).__name__, str(exc)[:300])
        raise
