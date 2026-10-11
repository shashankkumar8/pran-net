"""PRAN-NET Local Development Server.
Simulates AWS API Gateway HTTP API v2 + Lambda environment locally on http://localhost:8000.
Allows full end-to-end local testing without deploying to AWS.
"""
import os
import sys
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from decimal import Decimal
from datetime import datetime, timezone

# Set local development environment variables
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "local-dev-key")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "local-dev-secret")
os.environ.setdefault("OBSERVATIONS_TABLE", "local_obs")
os.environ.setdefault("LEDGER_TABLE", "local_ledger")
os.environ.setdefault("COORDINATOR_TOKEN_PARAMETER", "/schoolair/coordinator-token")
os.environ.setdefault("SCHOOL_ID", "delhi-core")
os.environ.setdefault("SCHOOL_NAME", "Delhi-NCR Central Core")
os.environ.setdefault("SCHOOL_LAT", "28.6139")
os.environ.setdefault("SCHOOL_LON", "77.2090")
os.environ.setdefault("ALLOWED_ORIGIN", "*")

# Initialize Moto mock environment for local tables
import boto3
from moto import mock_aws

mock = mock_aws()
mock.start()

# Setup local DynamoDB tables and SSM parameter
ddb = boto3.resource("dynamodb")
ddb.create_table(
    TableName="local_obs",
    BillingMode="PAY_PER_REQUEST",
    AttributeDefinitions=[
        {"AttributeName": "station_id", "AttributeType": "S"},
        {"AttributeName": "observed_at", "AttributeType": "S"}
    ],
    KeySchema=[
        {"AttributeName": "station_id", "KeyType": "HASH"},
        {"AttributeName": "observed_at", "KeyType": "RANGE"}
    ]
)
ddb.create_table(
    TableName="local_ledger",
    BillingMode="PAY_PER_REQUEST",
    AttributeDefinitions=[
        {"AttributeName": "pk", "AttributeType": "S"},
        {"AttributeName": "sk", "AttributeType": "S"}
    ],
    KeySchema=[
        {"AttributeName": "pk", "KeyType": "HASH"},
        {"AttributeName": "sk", "KeyType": "RANGE"}
    ]
)

ssm = boto3.client("ssm")
ssm.put_parameter(
    Name="/schoolair/coordinator-token",
    Value="demo-token",
    Type="SecureString"
)

# Seed initial station observations
obs_table = ddb.Table("local_obs")
now_epoch = int(time.time())
now_iso = datetime.fromtimestamp(now_epoch, timezone.utc).isoformat()
stations = [
    {"id": "s1", "name": "Anand Vihar (DPCC)", "cat": "Severe", "lat": "28.6469", "lon": "77.3160"},
    {"id": "s2", "name": "Patparganj (DPCC)", "cat": "Very Poor", "lat": "28.6237", "lon": "77.2872"},
    {"id": "s3", "name": "Vivek Vihar (DPCC)", "cat": "Very Poor", "lat": "28.6723", "lon": "77.3152"},
]
for st in stations:
    obs_table.put_item(Item={
        "station_id": st["id"],
        "observed_at": now_iso,
        "station_name": st["name"],
        "lat": Decimal(st["lat"]),
        "lon": Decimal(st["lon"]),
        "aqi_category": st["cat"],
        "source": "Local Seed / CPCB Model",
        "data_status": "sample",
        "observed_at_epoch": now_epoch
    })

import app

class LambdaRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type,x-coordinator-token,idempotency-key")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def _handle(self, method):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else None

        # Build AWS API Gateway v2 event payload
        parsed_path = self.path.split("?")[0]
        query_str = self.path.split("?")[1] if "?" in self.path else ""
        query_params = {}
        if query_str:
            for pair in query_str.split("&"):
                if "=" in pair:
                    k, v = pair.split("=", 1)
                    query_params[k] = v

        headers = {k.lower(): v for k, v in self.headers.items()}

        event = {
            "requestContext": {
                "http": {
                    "method": method,
                    "path": parsed_path,
                }
            },
            "rawPath": parsed_path,
            "queryStringParameters": query_params if query_params else None,
            "headers": headers,
            "body": body
        }

        lambda_resp = app.handler(event, None)
        status_code = lambda_resp.get("statusCode", 200)
        resp_headers = lambda_resp.get("headers", {})
        resp_body = lambda_resp.get("body", "{}").encode("utf-8")

        self.send_response(status_code)
        for h_k, h_v in resp_headers.items():
            self.send_header(h_k, h_v)
        # Ensure CORS header
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)

    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]} {args[1]}\n")

def run(port=8000):
    server = HTTPServer(("127.0.0.1", port), LambdaRequestHandler)
    print(f"\n=======================================================")
    print(f" PRAN-NET Local API Server Running on http://127.0.0.1:{port}")
    print(f" Simulating API Gateway + Lambda + DynamoDB + SSM")
    print(f" Coordinator token: demo-token")
    print(f"=======================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down local server...")
        mock.stop()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run(port)
