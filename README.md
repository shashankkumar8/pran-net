# PRAN-NET — Pran Operational Mitigation Network
**PRAN Air Intelligence: Evidence-to-Action Atmospheric Decision Support, Multilingual Access & Persistent Action Ledger**

---

## 1. Overview
PRAN-NET is an air intelligence, operational mitigation, and decision-support platform engineered for municipal ward officers, gig logistics fleet dispatchers, school administrators, and public health coordinators.

- **Truthful Data Provenance:** Integrates live Open-Meteo Air Quality and Weather models with clear scientific attribution to Copernicus Atmosphere Monitoring Service (CAMS), strictly distinguishing model data from CPCB continuous ground stations.
- **Multilingual India-First Access:** Full native-script internationalization across 13 Indian languages (Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Gujarati, Punjabi, Malayalam, Odia, Assamese, Urdu with dynamic RTL layout, and English).
- **Deterministic Rules (Zero LLM in Safety Path):** Evaluates worst fresh category among reporting monitors, flags sensor disagreement ($\ge 2$ category delta), and strictly refuses recommendations on stale data ($>180$ minutes old).
- **Multi-Sector Mitigation Workspaces:** Tailored operational plans for Municipal Operations (dust suppression), Gig Logistics (shift limits), and Campuses (sports/assembly adjustments).
- **Persistent Action Ledger:** Transactional, server-anchored audit history capturing human coordinator decisions alongside the immutable evidence snapshot evaluated at that exact moment.
- **Installable PWA & Android App:** Progressive Web App (PWA) with offline app shell caching and Capacitor native Android build configuration (`in.prannet.airquality`).

---

## 2. 9 Operational Modules (Renamed User-Facing Headings)

| Module ID | Renamed Plain-Language Heading | Operational Scope |
|---|---|---|
| `overview` | **Air Quality Overview** | Real-time AQI summary, Indian city selector, interactive pollutant cards (PM2.5, PM10, NO₂, O₃, SO₂, CO), 24h trajectory chart, Leaflet map preview, weather, and health guidance. |
| `vayu` | **Geographic Air Quality Map** | Fullscreen interactive Leaflet map rendering OpenStreetMap tiles, CAMS model grid cells, reporting nodes, category filtering, and accessible table alternative. |
| `whybad` | **Pollution Source Analysis** | PM2.5/PM10 size ratio diagnostics, secondary aerosol classification, multi-pollutant table, and competing hypotheses matrix. |
| `downwind` | **Wind & Weather** | Real-time surface wind vector, compass bearing, upwind screening, and honest `NEEDS CONFIGURATION` status for NASA FIRMS satellite active-fire anomalies. |
| `sectors` | **Sector Action Plans** | Contextual workspaces for Municipal Operations, Gig Logistics & Fleet Safety, and Campuses with direct mitigation proposal triggers. |
| `review` | **Action Review** | Human-in-the-loop review buffer enforcing decision postures, rationale validation (overrides require $\ge 10$ characters), and coordinator verification credentials. |
| `ledger` | **Action History** | Permanent, append-only DynamoDB ledger records with expandable raw evidence JSON and JSON export. |
| `sources` | **Data & Evidence** | Provider health registry, semantics, licensing, update intervals, and setup guides. |
| `methodology` | **Methods & Guidance** | CPCB NAQI breakpoints, physical indoor mass-balance formulas, and scientific limitations. |

---

## 3. Multilingual Support (13 Indian Languages)
Configured in `frontend/src/i18n.ts`:
1. English (`en`)
2. हिन्दी — Hindi (`hi`)
3. বাংলা — Bengali (`bn`)
4. मराठी — Marathi (`mr`)
5. தமிழ் — Tamil (`ta`)
6. తెలుగు — Telugu (`te`)
7. ಕನ್ನಡ — Kannada (`kn`)
8. ગુજરાતી — Gujarati (`gu`)
9. ਪੰਜਾਬੀ — Punjabi (`pa`)
10. മലയാളം — Malayalam (`ml`)
11. ଓଡ଼ିଆ — Odia (`or`)
12. অসমীয়া — Assamese (`as`)
13. اردو — Urdu (`ur`, dynamic `dir="rtl"` layout support)

---

## 4. Visual Audit Screenshot Gallery
Complete visual verification screenshots are cataloged in [`docs/audit_screenshots/`](docs/audit_screenshots/):
1. `01_overview_dark.png`: Air Quality Overview (Obsidian Atmosphere dark theme).
2. `02_overview_light.png`: Air Quality Overview (Airglass Porcelain light theme).
3. `03_geographic_map.png`: Geographic Air Quality Map (Interactive Leaflet map).
4. `04_pollution_analysis.png`: Pollution Source Analysis (Ratio diagnostics & hypotheses).
5. `05_wind_weather.png`: Wind & Weather (Live wind vector & NASA FIRMS config notice).
6. `06_sector_plans.png`: Sector Action Plans (Workspaces & action triggers).
7. `07_action_review.png`: Action Review (Human authorization queue).
8. `08_action_history.png`: Action History (Append-only ledger interface).
9. `09_data_evidence.png`: Data & Evidence (Provider health registry).
10. `10_methods_guidance.png`: Methods & Guidance (Breakpoints & indoor formula).
11. `11_hindi_interface.png`: Hindi Devanagari interface and native script dropdown.
12. `12_urdu_rtl.png`: Urdu interface with full Right-to-Left (RTL) layout.
13. `13_mobile_390px.png`: Mobile layout tested at 390px × 844px viewport.

---

## 5. Local Development & Quick Start

### Prerequisites
- Node.js LTS (v20+ or v25+) and npm
- Python 3.12 or 3.13 with `pip`
- Git

### Run Full Stack in 2 Commands:
1. **Start Backend API Server (Simulates Lambda + DynamoDB + SSM locally):**
   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements-dev.txt
   python dev_server.py
   ```
   *Runs on `http://127.0.0.1:8000` with live Open-Meteo telemetry proxying and DynamoDB ledger transactions.*

2. **Start Frontend Client (React 19 + TypeScript + Vite + Leaflet + PWA):**
   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```
   *Opens on `http://127.0.0.1:5173`.*

---

## 6. Testing & Build Verification

### Backend Pytest Suite
```powershell
cd backend
python -m pytest -q
# 31 passed in ~35s (rules, validation, DynamoDB transactions, live Open-Meteo network smoke test)
```

### Frontend Automated Tests
```powershell
cd frontend
npm test
# 7 passed in ~290ms (theme tokens, PWA manifest, service worker caching, 13 languages, RTL, 9 headings, math)
```

### Production Build Validation
```powershell
cd frontend
npm run build
# tsc --noEmit && vite build completed cleanly with 0 errors
```

---

## 7. Android Capacitor Build Path

```powershell
cd frontend
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
*Builds debug APK at `frontend/android/app/build/outputs/apk/debug/app-debug.apk` once Gradle 8.14 distribution and Android SDK are configured on the build host.*

---

## 8. Verified Release Package
The clean release archive is built at:
`PRAN_NET_Air_Intelligence_Final_Upgrade_20261011.zip`
- Includes all source files, documentation, and the full 13-screenshot audit gallery.
- Excludes `.git`, `node_modules`, virtual environments, caches, and secrets.
- Verified with `zipfile.testzip()` (0 CRC errors).
