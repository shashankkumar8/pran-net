# SchoolAir Ledger

Evidence-to-action air-quality decision support for school coordinators (Environmental Hacks 2026, Air track).
It turns station readings into an **explainable per-activity advisory**, then keeps an **append-only ledger** of what the school decided and the exact evidence it saw.

## What is implemented (and tested)
- Deterministic rules engine (`backend/engine.py`): freshness gate, nearest-3-station selection, worst-fresh-category rule, disagreement flag, activity-aware policy, `NO_ADVICE` on stale/missing/invalid data. **No LLM in the safety path.**
- CPCB/data.gov.in ingest adapter (`backend/ingest.py`) with PM2.5/PM10 → NAQI-category derivation. **Unverified against the live feed** until you run `scripts/probe_datagovin.py`.
- API (`backend/app.py`): advisory, simulate, scenario, token-protected actions/metrics, idempotency, input validation.
- Append-only ledger (DynamoDB; API role has no Update/Delete), evidence snapshot + rules version stored per decision.
- Escalation (`backend/escalate.py`): if a `MOVE_INDOORS` advisory is unreviewed for 30 min, **one** SNS email (at-most-once claim).
- React UI: advisory, evidence table, simulator, ledger, measured-outcomes tab, EN/HI notice, labelled indoor model scenario.

Tests: `cd backend && pip install -r requirements-dev.txt && pytest -q` (26 tests, moto-mocked AWS). Frontend: `cd frontend && npm i && npm run build`.
**Not yet verified by me:** live CPCB feed, real AWS deployment, SNS email delivery, mobile layout, accessibility audit.

## Deploy (about 30 min)
1. Verify data: get a data.gov.in key, find the real-time AQI resource id, run `DATA_GOV_KEY=... DATA_GOV_RESOURCE_ID=... python scripts/probe_datagovin.py`. If field names differ from `ingest.py` aliases (`A = {...}`), edit them. If the feed is unusable, use sample mode below.
2. Secrets (never commit):
   `aws ssm put-parameter --name /schoolair/coordinator-token --type SecureString --value "<long-random>"`
   `aws ssm put-parameter --name /schoolair/datagov-key --type SecureString --value "<key>"`
3. `cd backend && sam build && sam deploy --guided` — set `AlertEmail` (confirm the SNS subscription email!), `SchoolLat/SchoolLon/SchoolName`, `DataSourceMode` (`live` or `sample`), `DataGovResourceId`, and `AllowedOrigin` (your Amplify URL once known; redeploy after).
4. Sample mode only: `OBSERVATIONS_TABLE=<output> SCHOOL_LAT=.. SCHOOL_LON=.. python scripts/seed_sample.py severe` (also `disagree`, `stale`, `moderate`). Sample rows are labelled everywhere and never shown as live.
5. Frontend: set `VITE_API_URL=<ApiUrl output>` in `frontend/.env`, push to GitHub, connect in **AWS Amplify Hosting**, add the same env var.
6. Teardown after judging: `sam delete` (ledger table is retained by design; delete it manually if you want it gone).

## Limitations (stated in the UI too)
Station readings are not personal or indoor exposure. Derived categories use hourly values; official NAQI uses 24-h averages. The activity policy table is an editable default, not an official threshold or medical advice. Shared-token auth is demo-grade (production: Cognito). The indoor scenario is illustrative and never feeds the advisory. Review time is client-reported.

## AI-tool disclosure
Built with AI coding assistance (Claude). Add libraries/templates you use here.


## Deployment audit note (v4)

The action API persists the ledger entry and idempotency reference with DynamoDB `TransactWriteItems`; its IAM policy therefore explicitly grants `dynamodb:TransactWriteItems` on the ledger table. Idempotency keys are scoped to the configured school. Re-run `sam validate`, `cfn-lint`, backend tests, and a deployed write/read test after any template changes. A passing mocked test suite alone does not prove deployed IAM permissions or live SNS delivery.

## Further setup and execution guides

- [AWS credentials, SSM secrets, deployment and end-to-end verification](docs/AWS_SETUP.md)
- [Requested coding-agent skills and how to use them safely](docs/AGENT_SKILLS.md)
- [Master execution prompt for a coding agent](docs/MASTER_EXECUTION_PROMPT.md)
- [Implementation verification status](docs/IMPLEMENTATION_STATUS.md)

**Credential safety:** use AWS IAM Identity Center/SSO where available. Never put AWS credentials, the data.gov.in key, or the coordinator token in the React bundle or any `VITE_*` variable. The only frontend environment variable expected here is the public API URL. Read `docs/AWS_SETUP.md` before creating secrets or deploying.
