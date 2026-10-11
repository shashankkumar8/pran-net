# PRAN-NET — Verified 3-Minute Hackathon Demo Script

**Project:** PRAN-NET — Pran Operational Mitigation Network  
**Target Duration:** Exactly 3 minutes (180 seconds)  
**Core Journey:** OBSERVE → INVESTIGATE → ACT → VERIFY  
**Demonstration Rule:** Only demonstrate functionality verified to execute reliably. All data provenance and limitations are disclosed transparently to judges.

---

## Pre-Flight Setup Checklist (Before Judge Walkthrough)
1. Backend Dev Server running on `http://127.0.0.1:8000/` (`python dev_server.py`).
2. Frontend Vite Dev Server running on `http://localhost:5173/` (`npm run dev`).
3. Browser opened to `http://localhost:5173/` with DevTools open (Network/Console clear).
4. Coordinator Token: `demo-token` (preloaded or entered in header).

---

## 0:00–0:25 — Problem & Overview (Observe)

### Spoken Narration:
> *"Hello judges. Every winter across northern India, air quality apps tell citizens that the air is 'Hazardous'—yet municipal coordinators, school principals, and logistics managers are left with no operational guidance or accountability. Decisions are either delayed or taken arbitrarily without an audit trail.*
>
> *This is PRAN-NET: an institutional environmental intelligence platform designed for decision-makers. Starting on the Air Quality Overview, we see real-time, live environmental metrics for Delhi, powered by Open-Meteo's European Copernicus CAMS model and ECMWF weather feeds. We explicitly label this data as **Live Model Data**, distinguishing model forecasts from physical ground-truth sensors."*

### UI Actions:
- Open `http://localhost:5173/` (Air Quality Overview).
- Point cursor to the **Live AQI** hero badge (NAQI category, PM2.5, PM10).
- Toggle city selector dropdown (e.g., Delhi, Lucknow, Patna) to show instant live data retrieval with latitude/longitude and freshness timestamps.
- Highlight the **Data Source & Attribution** card indicating Open-Meteo CAMS with timestamp.

---

## 0:25–0:55 — Investigate (Geographic Map & Source Analysis)

### Spoken Narration:
> *"Next, the coordinator moves from Observation to Investigation. Opening our Geographic Air Quality Map, we inspect geospatial pollutant distributions on an interactive Leaflet canvas. We can toggle CAMS model grid cells and station nodes.*
>
> *Switching to Pollution Source Analysis, PRAN-NET computes the diagnostic PM2.5-to-PM10 mass ratio. A high ratio indicates fine combustion aerosol—such as vehicular exhaust or biomass burning—whereas a low ratio signals coarse road dust or construction silt. We honestly disclose data limitations: satellite fire detections and official CPCB ground stations require API keys, which are flagged transparently as 'Needs Configuration' rather than fabricating fake readings."*

### UI Actions:
- Click navigation item: **Geographic Air Quality Map** (`vayu`).
- Pan/zoom the Leaflet map; toggle station nodes and model grid overlays.
- Click navigation item: **Pollution Source Analysis** (`whybad`).
- Point to the **PM2.5 / PM10 Ratio Diagnostic Card** (Combustion vs. Mechanical Dust classifier).
- Show the **Data Provenance** badge confirming the calculation source.

---

## 0:55–1:25 — Context & Sectors (Wind, Weather & Operational Plans)

### Spoken Narration:
> *"Decision-makers cannot act without meteorological context. In Wind & Weather, we display live surface wind vector, speed, and atmospheric dispersion conditions retrieved from ECMWF. Under calm winds and low boundary layers, pollutants trap locally.*
>
> *Moving to Sector Action Plans, PRAN-NET translates this intelligence into calibrated protocols across four domains: Municipal Road Operations, Gig Delivery Workers, School Campuses, and Agriculture Residue. In the Outdoor Worker Exposure Estimator, we use a peer-reviewed minute-ventilation formula to calculate inhaled particulate dose, helping dispatchers rotate delivery shifts before safe exposure limits are exceeded."*

### UI Actions:
- Click navigation item: **Wind & Weather** (`downwind`).
- Point out the compass bearing, wind speed (km/h), and atmospheric stability indicator.
- Click navigation item: **Sector Action Plans** (`sectors`).
- Switch through tabs: **Municipal Operations**, **Gig Workers & Logistics**, **Schools & Campuses**, **Agriculture**.
- Highlight the **Worker Inhaled Dose Estimator** with ventilation rate and shift duration inputs.

---

## 1:25–2:15 — Action Workflow (Evidence-to-Action Console)

### Spoken Narration:
> *"Now we enter PRAN-NET's core innovation: Action Review—a 7-stage Human-in-the-Loop decision engine. Here we examine demonstration incident INC-2026-DEL-0842. We clearly label this incident as a controlled demonstration scenario.*
>
> *The console walks us through seven rigorous stages: First, Incident Summary. Second, an anchored 4-node Evidence Timeline. Third, a Competing Source Hypotheses matrix ranking road dust at 84% versus biomass fire at 18% based on contradicting wind vectors. Fourth, the Proposed Mitigation. Fifth, Human-in-the-Loop Authorization: if a coordinator attempts to override an advisory without justification, our system blocks it. A minimum 10-character audited reason is strictly enforced.*
>
> *Sixth, Team Assignment with SLA. And seventh, Before-and-After Outcome Verification. Let's submit this action now."*

### UI Actions:
- Click navigation item: **Action Review** (`review`).
- Scroll through Stage 1 (Incident Summary) and Stage 2 (4-node Evidence Timeline).
- Point to Stage 3 (Competing Hypotheses matrix) and Stage 4 (Proposed Mitigation).
- In Stage 5 (Authorization):
  - Select decision: **Followed** (or select **Overridden** to show validation requirement).
  - Enter action note: `"Relocated outdoor drills and activated classroom HEPA purification"`.
  - Click **Submit Mitigation Action**.
- Observe instantaneous green confirmation banner: `"Action permanently recorded to DynamoDB ledger. ID: ..."`

---

## 2:15–2:40 — Evidence & Verification (Action History & Data Provenance)

### Spoken Narration:
> *"Actions taken must be permanently verifiable. In Action History, our newly recorded decision appears immediately at the top of the ledger, complete with its unique UUID, timestamp, reviewer identity, and immutable advisory snapshot.*
>
> *Even after a hard page refresh or server restart, this record persists via our local DynamoDB ledger table. Coordinators can export the full audit trail as JSON for regulatory reporting.*
>
> *In Data & Evidence, judges can audit our live integration health: Open-Meteo Air Quality and Weather show green LIVE badges, while CPCB OGD and NASA FIRMS show honest 'NEEDS CONFIGURATION' status badges."*

### UI Actions:
- Click navigation item: **Action History** (`ledger`).
- Point to the newly recorded entry with its timestamp, decision badge (`FOLLOWED`), and Action ID.
- Hit browser **Refresh (F5)** to prove persistence after page reload.
- Click **Export JSON Ledger** or inspect the record's advisory snapshot.
- Click navigation item: **Data & Evidence** (`sources`).
- Point to the Provider Health table showing honest distinction between LIVE and NEEDS CONFIGURATION.

---

## 2:40–3:00 — Differentiation & Impact (Wrap-Up)

### Spoken Narration:
> *"In summary, PRAN-NET closes the loop that consumer air quality apps leave wide open: OBSERVE the atmosphere, INVESTIGATE source hypotheses with meteorological physics, ACT through sector-calibrated operational plans, and VERIFY decisions through an immutable, human-in-the-loop audit ledger.*
>
> *The entire system features Obsidian Dark and Porcelain Light themes, full responsive layouts down to 360-pixel mobile screens, and 13 Indian regional languages with automated right-to-left layout for Urdu.*
>
> *Thank you. We are now ready for your questions."*

### UI Actions:
- Switch theme from **Obsidian Dark** to **Airglass Porcelain Light** using the header toggle.
- Switch language dropdown to **Urdu** (`اردو`) to demonstrate instant RTL alignment, then switch back to English.
- Conclude on the clean **Air Quality Overview**.

---

## Fallback & Emergency Contingencies
- **If offline / no network:** Backend falls back automatically to sample mode observations; red banner displays `"DATA SOURCE MODE: SAMPLE"`. Narration explicitly notes sample fallback.
- **If local backend server is stopped:** Frontend continues to run with local demonstration state and clear notifications.
