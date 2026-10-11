import os, json, hmac
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Attr

def cfg(name, default=""):
    return os.environ.get(name, default)

def table(env_name):
    return boto3.resource("dynamodb").Table(cfg(env_name))

def to_ddb(x):
    return json.loads(json.dumps(x, default=str), parse_float=Decimal)

def _plain(o):
    if isinstance(o, Decimal):
        return int(o) if o == o.to_integral_value() else float(o)
    return str(o)

def dumps(x):
    return json.dumps(x, default=_plain)

def from_ddb(x):
    return json.loads(dumps(x))

def school():
    return {"school_id": cfg("SCHOOL_ID", "demo-school"), "name": cfg("SCHOOL_NAME", "Demo school"),
            "lat": float(cfg("SCHOOL_LAT", "28.6139")), "lon": float(cfg("SCHOOL_LON", "77.2090")),
            "escalate_after_min": int(cfg("ESCALATE_AFTER_MIN", "30"))}

def latest_observations(now_epoch, max_age_h=12):
    t, items = table("OBSERVATIONS_TABLE"), []
    kw = {"FilterExpression": Attr("observed_at_epoch").gte(Decimal(int(now_epoch - max_age_h * 3600)))}
    while True:
        r = t.scan(**kw)
        items += r["Items"]
        if "LastEvaluatedKey" not in r:
            break
        kw["ExclusiveStartKey"] = r["LastEvaluatedKey"]
    latest = {}
    for o in map(from_ddb, items):
        sid = o["station_id"]
        if sid not in latest or o["observed_at_epoch"] > latest[sid]["observed_at_epoch"]:
            latest[sid] = o
    return list(latest.values())

_token_cache = {}
def coordinator_token_ok(supplied):
    name = cfg("COORDINATOR_TOKEN_PARAMETER")
    if not name or not supplied:
        return False
    if name not in _token_cache:
        try:
            _token_cache[name] = boto3.client("ssm").get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
        except Exception:
            return False
    return hmac.compare_digest(supplied.encode(), _token_cache[name].encode())
