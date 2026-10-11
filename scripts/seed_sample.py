"""Write clearly-labelled SAMPLE observations (never live). Usage: OBSERVATIONS_TABLE=... python seed_sample.py [severe|disagree|stale|moderate]"""
import os, sys, time
from decimal import Decimal
from datetime import datetime, timezone
import boto3
scen = sys.argv[1] if len(sys.argv) > 1 else "severe"
lat, lon = float(os.environ.get("SCHOOL_LAT", "28.6139")), float(os.environ.get("SCHOOL_LON", "77.2090"))
cats = {"severe": ["Very Poor", "Very Poor", "Poor"], "disagree": ["Severe", "Moderate", "Satisfactory"],
        "stale": ["Very Poor", "Very Poor", "Very Poor"], "moderate": ["Moderate", "Moderate", "Satisfactory"]}[scen]
age = 5 * 3600 if scen == "stale" else 600
now = int(time.time()) - age
t = boto3.resource("dynamodb").Table(os.environ["OBSERVATIONS_TABLE"])
for i, c in enumerate(cats):
    iso = datetime.fromtimestamp(now, timezone.utc).isoformat()
    t.put_item(Item={"station_id": f"sample-{i+1}", "observed_at": iso, "station_name": f"SAMPLE station {i+1} (not a real monitor)",
        "city": "Sample", "lat": Decimal(str(round(lat + 0.01 * (i + 1), 4))), "lon": Decimal(str(round(lon + 0.01 * (i + 1), 4))),
        "pollutants": {}, "aqi": None, "aqi_category": c, "source": "sample", "data_status": "sample",
        "observed_at_epoch": now, "retrieved_at": datetime.now(timezone.utc).isoformat(), "expires_at": now + 6 * 3600})
print(f"Seeded 3 SAMPLE observations ({scen}). They are labelled sample everywhere.")
