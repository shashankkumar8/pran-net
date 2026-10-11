# PRAN-NET Project Audit
**Pran Operational Mitigation Network**
*Audit Date: 2026-10-11*
*Baseline Commit: `e505c14`*

---

## 1. Executive Summary & Project Health
The PRAN-NET repository is an evolution of the SchoolAir Ledger foundation. The backend core—a deterministic decision-support engine implemented in Python AWS Lambda with DynamoDB persistence—is structurally sound, passing all 26 unit and integration tests with zero regressions.

The frontend is currently a single-file prototype (`App.tsx`) with critical startup blockers: it crashes immediately if `VITE_API_URL` is unconfigured, has no multi-page navigation, lacks CSS variables or a functional light mode, and has no live provider integrations connected.

## 2. Architecture & Data Flow
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4. Currently monolithic, requiring modularization into a 9-view operational architecture with robust dual themes (Obsidian Atmosphere and Airglass Porcelain).
- **Backend:** AWS Serverless Application Model (SAM) with HTTP API Gateway, Python 3.12/3.13 Lambdas (`ApiFunction`, `IngestFunction`, `EscalateFunction`).
- **Persistence:**
  - `ObservationsTable`: DynamoDB (Partition Key: `station_id`, Sort Key: `observed_at`, TTL enabled).
  - `LedgerTable`: DynamoDB (Partition Key: `pk`, Sort Key: `sk`, Point-in-time recovery, retained on deletion). Transactional writes via `TransactWriteItems` with `IDEM#` idempotency scoping.
- **Security & Authorization:**
  - Coordinator token verified via HMAC against AWS SSM Parameter Store (`/schoolair/coordinator-token`).
  - Strict input bounds and required field sanitization.

## 3. Real vs. Mock Integrations
| Provider | Target Type | Current State in Repository | Truthful Label Required |
|---|---|---|---|
| **Open-Meteo Air Quality** | Model Forecast / Reanalysis | Not implemented | `LIVE MODEL DATA` (Never label as CPCB monitor) |
| **Open-Meteo Weather** | Meteorological Forecast | Not implemented | `LIVE WEATHER CONTEXT` |
| **CPCB / data.gov.in** | Ground Station Observations | Ingest stub exists; unverified schema; default `sample` mode | `NEEDS CONFIGURATION` / `LIVE CPCB` |
| **NASA FIRMS** | Thermal Anomalies | Not implemented | `NEEDS CONFIGURATION` / `THERMAL ANOMALY` |
| **Synthetics / Fixtures** | Sample Scenarios | Seed script present | `SIMULATED DEMO DATA` |

## 4. Discovered Deficiencies & Blockers
1. **Fatal Startup Blocker:** `App.tsx` crashes with a fatal blocking screen when `VITE_API_URL` is empty. The application must gracefully default to an honest offline/demo experience without falsifying live data.
2. **Theme System Inconsistency:** `styles.css` is dark-mode only with hardcoded hex colors, while copy-pasted classes (`.scenario-result`, `.lang-switch`) inject light-mode backgrounds causing visual corruption.
3. **Missing Tooling in Host PATH:** AWS SAM CLI is not in system PATH. Local validation must rely on Python/pytest and linting tools until SAM is installed.
4. **DynamoDB Full Scan Risk:** `latest_observations()` executes an unindexed table scan.

## 5. Phased Roadmap
- **Phase 1 (Active):** Baseline documentation, dependency installation, verification checks.
- **Phase 2 (Active):** Dual-theme design system (Obsidian Dark / Airglass Light), responsive tokens, fallback resilience for missing `VITE_API_URL`.
- **Phase 3:** Multi-page operational navigation shell (9 views).
- **Phase 4:** Live Open-Meteo integration (Air Quality & Weather) with honest provenance labels.
- **Phase 5:** Multi-sector intelligence expansion (Municipal, Logistics, Campus).
- **Phase 6:** Human mitigation workflow & audit ledger persistence.
- **Phase 7:** Automated testing, network smoke tests, and QA reporting.
- **Phase 8:** Final packaging and submission verification.
