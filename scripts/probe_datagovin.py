"""Probe an official data.gov.in resource without assuming its schema.
Set DATA_GOV_KEY and DATA_GOV_RESOURCE_ID after verifying the official dataset page.
"""
import json, os, urllib.parse, urllib.request, urllib.error
key=os.environ.get("DATA_GOV_KEY"); resource=os.environ.get("DATA_GOV_RESOURCE_ID")
if not key or not resource: raise SystemExit("Set DATA_GOV_KEY and DATA_GOV_RESOURCE_ID after verifying the resource.")
url=f"https://api.data.gov.in/resource/{resource}?"+urllib.parse.urlencode({"api-key":key,"format":"json","limit":5})
try:
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"SchoolAirLedgerProbe/1.0"}),timeout=20) as r: payload=json.load(r)
except urllib.error.HTTPError as e: raise SystemExit(f"HTTP {e.code}: {e.read(1000).decode('utf-8','replace')}")
except urllib.error.URLError as e: raise SystemExit(f"Network error: {e}")
print("Top-level keys:",list(payload) if isinstance(payload,dict) else type(payload).__name__)
records=payload.get("records",[]) if isinstance(payload,dict) else []
print("Record count:",len(records))
if records: print("First record keys:",list(records[0])); print(json.dumps(records[0],indent=2)[:3000])
