# Architecture
EventBridge (hourly) -> Lambda ingest -> data.gov.in (CPCB) -> DynamoDB observations (TTL)
React on Amplify -> API Gateway HTTP API -> Lambda api -> DynamoDB observations (read) / ledger (append-only)
EventBridge (15 min) -> Lambda escalate -> DynamoDB ledger (alert claim) -> SNS email
SSM Parameter Store: coordinator token, data.gov.in key. CloudWatch: logs + IngestFailure metric.
Ledger keys: pk=SCHOOL#id, sk=ACT#iso#uuid | ALERT#observed_at ; pk=IDEM#key (idempotency, written transactionally with the action).
IAM: api = Put/Get/Query on ledger (no Update/Delete); ingest = Put/BatchWrite observations; escalate = ledger Put/Get/Query/Update + sns:Publish.
