# PRAN-NET — Pran Operational Mitigation Network
**Evidence-to-Action Atmospheric Decision Support & Persistent Action Ledger**

---

## 1. Overview
PRAN-NET is an operational mitigation network and decision-support system designed for municipal ward officers, gig logistics fleet dispatchers, and campus environmental coordinators. Rather than merely presenting raw AQI numbers, PRAN-NET bridges the gap between environmental evidence and operational action:
- **Truthful Data Provenance:** Integrates real-time Open-Meteo Air Quality and Weather models, while distinguishing model forecasts from CPCB continuous ground stations.
- **Deterministic Rules (Zero LLM in Safety Path):** Evaluates worst fresh category among nearest monitors, flags sensor disagreement ($\ge 2$ category delta), and strictly refuses recommendations on stale data ($>180$ minutes old).
- **Multi-Sector Mitigation Workspaces:** Tailored workflows for Municipal Operations (dust suppression), Gig Logistics (shift limits), and Campuses (sports/assembly adjustments).
- **Persistent Action Ledger:** Transactional, server-anchored audit history capturing what a human coordinator decided alongside the exact immutable evidence snapshot evaluated at that moment.

---

## 2. 9 Operational Modules
1. **Overview / Live Intelligence:** Real-time telemetry strip (PM2.5, PM10, NO₂, O₃, wind, temp, humidity), decisive station advisory, cross-activity simulator matrix, and bilingual stakeholder notice generator.
2. **Geographic Intelligence (VAYU):** Spatial coordinate radar with rotating wind vector overlay, distance-indexed monitoring nodes, category filtering, and accessible table alternative.
3. **Source Investigation (WhyBadAQI):** Chemical diagnostics, PM2.5/PM10 size ratio analysis, and competing hypotheses matrix (Vehicular vs. Road Dust vs. Biomass).
4. **DownWind (Atmospheric Screening):** Directional upwind screening based on real-time wind bearing, with honest `NEEDS CONFIGURATION` status for NASA FIRMS satellite active-fire anomalies.
5. **Sector Workspaces:** Contextual workspaces for Municipal Operations, Gig Logistics & Fleet Safety, and Campuses with direct mitigation proposal triggers.
6. **Mitigation Review:** Human-in-the-loop queue enforcing decision postures, rationale validation (overrides require $\ge 10$ characters), and coordinator verification credentials.
7. **Action Ledger:** Append-only DynamoDB ledger records with expandable raw evidence JSON and JSON export.
8. **Evidence & Data Sources:** Provider health registry, semantics, licensing, update intervals, and setup guides.
9. **Methodology & Help:** CPCB NAQI breakpoints, physical indoor mass-balance formulas, and scientific limitations.

---

## 3. Local Development & Setup

### Prerequisites
- Node.js LTS (v20+ or v25+) and npm
- Python 3.12 or 3.13 with `pip`
- Git

### Quick Start (Full Local Stack in 2 Commands)
1. **Start Backend API Server (Simulates API Gateway + Lambda + DynamoDB + SSM):**
   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements-dev.txt
   python dev_server.py
   ```
   *Runs locally on `http://127.0.0.1:8000` with live Open-Meteo telemetry proxying and transactional DynamoDB mocking.*

2. **Start Frontend Client (React 19 + TypeScript + Vite):**
   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```
   *Opens on `http://127.0.0.1:5173`. Works seamlessly connected to local backend or completely offline via built-in resilience fixtures.*

---

## 4. Testing & Verification

### Backend Pytest Suite
```powershell
cd backend
python -m pytest -q
# 31 passed in 34.40s (includes unit rules, input validations, DynamoDB idempotency, and live Open-Meteo network smoke test)
```

### Frontend Automated Tests
```powershell
cd frontend
npm test
# 4 passed in 197ms (theme tokens, anti-flash bootloader, 9-view routes, and mass-balance math)
```

### Production Build Validation
```powershell
cd frontend
npm run build
# tsc --noEmit && vite build completed cleanly in ~2.5s
```

---

## 5. API Reference
- `GET /health`: Basic health check and rules engine version (`v0.3.0`).
- `GET /health/data-sources`: Real-time health status of all 4 provider adapters.
- `GET /telemetry/live`: Real-time atmospheric chemical reanalysis and weather context from Open-Meteo.
- `GET /sectors`: Sector definitions and standard operating procedures.
- `GET /advisory?activity={activity}`: Deterministic station advisory based on worst fresh reading.
- `GET /simulate`: Evaluates the same evidence across all supported activities.
- `POST /scenario`: Physical steady-state mass-balance indoor PM2.5 calculation.
- `GET /actions`: Retrieves up to 50 append-only ledger entries (requires `X-Coordinator-Token`).
- `POST /actions`: Idempotent transactional ledger write (requires `X-Coordinator-Token` and `Idempotency-Key`).
- `GET /metrics`: Returns system-observable action counts and median review times.

---

## 6. AWS Serverless Deployment Guide

When authorized to deploy to AWS:
1. **SSM Parameter Store Secrets:**
   ```powershell
   aws ssm put-parameter --name /schoolair/coordinator-token --type SecureString --value "<YOUR-SECRET-TOKEN>"
   aws ssm put-parameter --name /schoolair/datagov-key --type SecureString --value "<DATA-GOV-KEY>"
   ```
2. **Deploy SAM Stack:**
   ```powershell
   cd backend
   sam build
   sam deploy --guided
   ```
3. **Configure Frontend:**
   Set `VITE_API_URL=<ApiUrl from SAM Output>` in `frontend/.env` and host via AWS Amplify or static CDN.

---

## 7. Truthful Scientific Integrity & Disclaimers
- Station readings and atmospheric models are **not personal or indoor exposure measurements**.
- Hourly NAQI categories are **indicative decision support**; official statutory NAQI uses 24-hour averages.
- Wind bearing screening is **not a validated plume dispersion model**; concentrations in µg/m³ are not fabricated downwind.
- Thermal anomalies from NASA FIRMS are **heat signatures**, not proven agricultural fires without ground truth.
- PRAN-NET does **not execute autonomous statutory sanctions**; all mitigations require human review.
