import os, sys, time, importlib
from decimal import Decimal
from datetime import datetime, timezone
import pytest, boto3
from moto import mock_aws
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

ENV = {"AWS_DEFAULT_REGION": "us-east-1", "AWS_ACCESS_KEY_ID": "x", "AWS_SECRET_ACCESS_KEY": "x", "OBSERVATIONS_TABLE": "obs",
       "LEDGER_TABLE": "led", "COORDINATOR_TOKEN_PARAMETER": "/t", "SCHOOL_LAT": "28.6139", "SCHOOL_LON": "77.2090", "DATA_SOURCE_MODE": "sample"}

@pytest.fixture
def aws(monkeypatch):
    for k, v in ENV.items(): monkeypatch.setenv(k, v)
    with mock_aws():
        d = boto3.resource("dynamodb")
        d.create_table(TableName="obs", BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[{"AttributeName": "station_id", "AttributeType": "S"}, {"AttributeName": "observed_at", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "station_id", "KeyType": "HASH"}, {"AttributeName": "observed_at", "KeyType": "RANGE"}])
        d.create_table(TableName="led", BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}, {"AttributeName": "sk", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}, {"AttributeName": "sk", "KeyType": "RANGE"}])
        boto3.client("ssm").put_parameter(Name="/t", Value="secret-token", Type="SecureString")
        import common; common._token_cache.clear()
        yield d

def seed(cats, age_s=600, status="sample"):
    now = int(time.time()) - age_s
    t = boto3.resource("dynamodb").Table("obs")
    for i, c in enumerate(cats):
        t.put_item(Item={"station_id": f"s{i}", "observed_at": datetime.fromtimestamp(now, timezone.utc).isoformat(), "station_name": f"S{i}",
            "lat": Decimal(str(28.62 + 0.01 * i)), "lon": Decimal(str(77.21 + 0.01 * i)), "aqi_category": c, "source": "sample",
            "data_status": status, "observed_at_epoch": now})

def call(method, path, body=None, headers=None, q=None):
    import json, app
    ev = {"requestContext": {"http": {"method": method}}, "rawPath": path, "headers": headers or {}, "queryStringParameters": q,
          "body": json.dumps(body) if body is not None and not isinstance(body, str) else body}
    r = app.handler(ev); return r["statusCode"], json.loads(r["body"])
