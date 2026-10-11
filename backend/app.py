import json, time, uuid
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from engine import build_station_advisory, ACTIVITIES, RULES_VERSION, indoor_scenario
from common import cfg, table, school, latest_observations, to_ddb, from_ddb, dumps, coordinator_token_ok

DECISIONS = {"followed", "modified", "overridden", "reviewed"}

def response(status, data):
    return {"statusCode": status, "headers": {"content-type": "application/json",
            "access-control-allow-origin": cfg("ALLOWED_ORIGIN", "http://localhost:5173"),
            "access-control-allow-headers": "content-type,x-coordinator-token,idempotency-key",
            "access-control-allow-methods": "GET,POST,OPTIONS"}, "body": dumps(data)}

def body_of(event):
    try:
        b = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return None, response(400, {"error": "Invalid JSON body."})
    if not isinstance(b, dict):
        return None, response(400, {"error": "JSON body must be an object."})
    return b, None

def parse_iso(s):
    try:
        d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return d if d.tzinfo else None
    except ValueError:
        return None

def handler(event, context=None):
    http = event.get("requestContext", {}).get("http", {})
    method, path = http.get("method", "GET").upper(), event.get("rawPath", "/")
    q, hdr = event.get("queryStringParameters") or {}, {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    s, now = school(), time.time()
    if method == "OPTIONS":
        return response(204, {})
    if method == "GET" and path.endswith("/health"):
        return response(200, {"ok": True, "rules_version": RULES_VERSION, "data_source_mode": cfg("DATA_SOURCE_MODE", "sample")})
    if method == "GET" and path.endswith("/school"):
        return response(200, {k: s[k] for k in ("school_id", "name", "lat", "lon", "escalate_after_min")} | {"activities": ACTIVITIES})
    if method == "GET" and path.endswith("/observations"):
        obs = latest_observations(now)
        return response(200, {"items": obs, "any_sample": any(o.get("data_status") == "sample" for o in obs)})
    if method == "GET" and (path.endswith("/advisory") or path.endswith("/simulate")):
        obs = latest_observations(now)
        sample = any(o.get("data_status") == "sample" for o in obs)
        if path.endswith("/simulate"):
            items = [{"activity": a, "label": l, "advisory": build_station_advisory(obs, a, now, s["lat"], s["lon"])} for a, l in ACTIVITIES.items()]
            return response(200, {"items": items, "rules_version": RULES_VERSION, "any_sample": sample})
        act = q.get("activity", "outdoor_assembly")
        if act not in ACTIVITIES:
            return response(400, {"error": "Unsupported activity."})
        return response(200, build_station_advisory(obs, act, now, s["lat"], s["lon"]) | {"generated_at": datetime.now(timezone.utc).isoformat(), "any_sample": sample})
    if method == "POST" and path.endswith("/scenario"):
        b, err = body_of(event)
        if err: return err
        try:
            return response(200, indoor_scenario(float(b.get("outdoor_pm25")), float(b.get("ach", 1.2)), float(b.get("deposition_rate", 0.24)),
                            float(b.get("cadr", 0)), float(b.get("room_volume", 150)), float(b.get("penetration", 0.8))))
        except (TypeError, ValueError) as exc:
            return response(400, {"error": str(exc)})
    if path.endswith("/actions") or path.endswith("/metrics"):
        if not coordinator_token_ok(hdr.get("x-coordinator-token", "")):
            return response(401, {"error": "Valid coordinator token required."})
        led, pk = table("LEDGER_TABLE"), f"SCHOOL#{s['school_id']}"
        if method == "GET" and path.endswith("/actions"):
            r = led.query(KeyConditionExpression=Key("pk").eq(pk) & Key("sk").begins_with("ACT#"), ScanIndexForward=False, Limit=50)
            return response(200, {"items": from_ddb(r["Items"])})
        if method == "GET" and path.endswith("/metrics"):
            acts = from_ddb(led.query(KeyConditionExpression=Key("pk").eq(pk) & Key("sk").begins_with("ACT#"))["Items"])
            alerts = from_ddb(led.query(KeyConditionExpression=Key("pk").eq(pk) & Key("sk").begins_with("ALERT#"))["Items"])
            d = sorted(a["review_seconds"] for a in acts if isinstance(a.get("review_seconds"), (int, float)))
            by = {}
            for a in acts: by[a["decision"]] = by.get(a["decision"], 0) + 1
            return response(200, {"actions_recorded": len(acts), "by_decision": by, "median_review_seconds_client_reported": d[len(d) // 2] if d else None,
                                  "severe_alerts_detected": len(alerts), "escalation_emails_sent": sum(1 for a in alerts if a.get("notified_at")),
                                  "note": "Counts of recorded actions only; no health or exposure outcomes are measured."})
        if method == "POST" and path.endswith("/actions"):
            b, err = body_of(event)
            if err: return err
            if any(not isinstance(b.get(k), str) or not b[k].strip() for k in ("activity", "decision", "action_taken")):
                return response(400, {"error": "activity, decision and action_taken are required."})
            if b["activity"] not in ACTIVITIES: return response(400, {"error": "Unsupported activity."})
            if b["decision"] not in DECISIONS: return response(400, {"error": "decision must be followed, modified, overridden or reviewed."})
            note = b.get("note", "")
            if not isinstance(note, str) or len(note) > 500: return response(400, {"error": "note must be text of 500 characters or fewer."})
            if len(b["action_taken"]) > 120: return response(400, {"error": "action_taken is too long."})
            idem = hdr.get("idempotency-key")
            if not idem or len(idem) > 200: return response(400, {"error": "Idempotency-Key required (max 200 chars)."})
            shown = parse_iso(b.get("advisory_shown_at")) if b.get("advisory_shown_at") else None
            adv = build_station_advisory(latest_observations(now), b["activity"], now, s["lat"], s["lon"])
            if b["decision"] == "overridden" and adv.get("decision_code") in ("MOVE_INDOORS", "MODIFY", "VERIFY_FIRST") and len(note.strip()) < 10:
                return response(400, {"error": "Overriding an advisory requires a reason of at least 10 characters."})
            created = datetime.now(timezone.utc)
            review = int((created - shown).total_seconds()) if shown and 0 <= (created - shown).total_seconds() <= 86400 else None
            sk = f"ACT#{created.isoformat()}#{uuid.uuid4()}"
            item = {"pk": pk, "sk": sk, "action_id": sk.split("#", 2)[2], "school_id": s["school_id"], "activity": b["activity"], "decision": b["decision"],
                    "action_taken": b["action_taken"].strip(), "note": note.strip(), "created_at": created.isoformat(), "review_seconds": review,
                    "rules_version": RULES_VERSION, "advisory_snapshot": adv, "data_status": (adv.get("evidence") or {}).get("data_status", "none")}
            try:
                led.meta.client.transact_write_items(TransactItems=[
                    {"Put": {"TableName": led.name, "Item": {"pk": f"IDEM#{s['school_id']}#{idem}", "sk": "IDEM", "ref": sk, "ref_pk": pk},
                             "ConditionExpression": "attribute_not_exists(pk)"}},
                    {"Put": {"TableName": led.name, "Item": to_ddb(item)}}])
            except Exception as exc:
                if getattr(exc, "response", {}).get("Error", {}).get("Code") == "TransactionCanceledException":
                    ref = led.get_item(Key={"pk": f"IDEM#{s['school_id']}#{idem}", "sk": "IDEM"}).get("Item")
                    if ref:
                        old = led.get_item(Key={"pk": ref["ref_pk"], "sk": ref["ref"]}).get("Item")
                        return response(200, {"item": from_ddb(old), "duplicate": True})
                return response(500, {"error": "Could not persist action."})
            return response(201, {"item": from_ddb(to_ddb(item)), "duplicate": False})
    return response(404, {"error": "Route not found."})
