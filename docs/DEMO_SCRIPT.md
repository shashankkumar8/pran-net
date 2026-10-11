# PRAN-NET — 2:45 Technical Demonstration Script

**Target Duration:** Exactly 2 minutes 45 seconds (165 seconds)  
**Safety Margin:** 15 seconds below the 3-minute hackathon deadline  
**Tone:** Engineering-first, scientifically honest, verifiable  
**Rule:** Only demonstrate functionality verified to execute reliably. Disclose all data limitations candidly.

---

## Pre-Flight Setup Checklist (Before Recording)
- [ ] Backend dev server running on `http://127.0.0.1:8000/` (`python dev_server.py`) or live AWS API URL configured.
- [ ] Frontend dev server running on `http://localhost:5173/` (`npm run dev`).
- [ ] Browser window maximized, DevTools console open and clear (0 errors).
- [ ] Header token preloaded: `demo-token`.

---

## Timeline & Narration Breakdown

### 0:00–0:20 — Problem & Product Overview
**Visual:** Open `http://localhost:5173/` (Air Quality Overview). Show prominent AQI hero badge and city selector.  
**Spoken Narration:**  
> *"Every winter across northern India, millions of citizens see AQI apps reporting 'Severe' or 'Hazardous'—yet municipal officers, logistics dispatchers, and school administrators have no coordinated decision framework or audit trail. PRAN-NET bridges this gap. It is an institutional environmental intelligence platform designed to transform raw atmospheric telemetry into authenticated, accountable operational mitigations."*

---

### 0:20–0:45 — Environmental Intelligence & Data Provenance
**Visual:** Point cursor to live PM2.5 (µg/m³), PM10, $\text{NO}_2$, and diurnal projection curve. Toggle city selector to **Lucknow** or **Patna** to show instant telemetry and coordinate updates. Point to the **Data Attribution** card.  
**Spoken Narration:**  
> *"On the Overview, PRAN-NET retrieves real-time atmospheric data powered by the European Copernicus CAMS chemical transport model and ECMWF weather feeds via Open-Meteo. Notice our engineering commitment to scientific integrity: we explicitly label this as **'LIVE MODEL DATA'**, refusing to misrepresent atmospheric model estimates as physical ground-truth sensors. When official CPCB ground stations or NASA FIRMS satellite feeds are unconfigured, we display 'Needs Configuration' rather than fabricating fake readings."*

---

### 0:45–1:10 — Investigation & Atmospheric Physics
**Visual:** Click **Geographic Air Quality Map** (`vayu`); pan Leaflet map; toggle station nodes and CAMS model grid cells. Then click **Pollution Source Analysis** (`whybad`) and show the $\text{PM}_{2.5}/\text{PM}_{10}$ ratio math card. Click **Wind & Weather** (`downwind`) to show surface wind vectors.  
**Spoken Narration:**  
> *"In our investigation phase, coordinators explore spatial patterns on our fullscreen Leaflet GIS canvas. In Pollution Source Analysis, PRAN-NET evaluates the diagnostic PM2.5-to-PM10 mass ratio: a high ratio signifies fine combustion aerosol from vehicular exhaust or biomass burning, whereas a low ratio indicates coarse mineral road dust. Combined with real-time ECMWF surface wind vectors, coordinators understand whether pollutants are trapping locally under boundary-layer inversions or transporting downwind."*

---

### 1:10–1:35 — Action Planning & Exposure Science
**Visual:** Click **Sector Action Plans** (`sectors`). Flip through **Municipal Operations**, **Gig Workers & Logistics**, **Schools & Campuses**, and **Agriculture**. Point to the **Worker Inhaled Dose Estimator**.  
**Spoken Narration:**  
> *"Instead of generic advice, PRAN-NET delivers calibrated action plans across four sectors. For outdoor delivery workers, we implement a minute-ventilation exposure calculator: by multiplying ambient PM2.5 concentration by physical breathing rate and shift duration, dispatchers compute estimated inhaled particulate dose to rotate shifts before hazardous thresholds are reached. In campuses, advisories distinguish indoor classroom purification from strenuous outdoor sports."*

---

### 1:35–2:05 — Human Decision & Audited Transaction
**Visual:** Click **Action Review** (`review`). Walk through demonstration incident `INC-2026-DEL-0842` (labeled as demo scenario). Show Stage 2 Timeline and Stage 3 Hypotheses. In Stage 5, select decision **Followed**, type note: `"Relocated outdoor athletics to indoor gymnasium and activated HEPA filtration"`, and click **Submit Mitigation Action**. Show green confirmation banner with saved UUID.  
**Spoken Narration:**  
> *"Now for our core innovation: Action Review—a 7-stage Human-in-the-Loop decision engine. Here we inspect demonstration incident INC-2026-DEL-0842. The system checks a 4-node evidence timeline and ranks competing hypotheses. If a coordinator attempts to override an advisory, our API strictly enforces an audited justification of at least 10 characters. Submitting the action invokes our API Gateway and Lambda backend, writing transactionally to our DynamoDB ledger with client-side idempotency to guarantee zero double-counting."*

---

### 2:05–2:30 — Audit Retrieval & Persistence Proof
**Visual:** Click **Action History** (`ledger`). Show newly recorded decision at the top of the table. Press **F5 (Refresh)** to prove persistence after page reload. Show JSON export.  
**Spoken Narration:**  
> *"In Action History, our newly submitted mitigation decision is immediately retrievable from DynamoDB, complete with its unique UUID, timestamp, reviewer credentials, and immutable advisory snapshot. Refreshing the browser confirms persistent storage. Our backend architecture—specified in AWS SAM with Lambda, API Gateway, DynamoDB tables, and SNS escalations—guarantees append-only auditability. In local demonstration mode, this persistence is verified via an in-process DynamoDB emulator, while the cloud SAM template is validated and ready for deployment."*

---

### 2:30–2:45 — Impact & Differentiation
**Visual:** Toggle theme to **Airglass Porcelain Light**, switch language to **Urdu** (`اردو`) to demonstrate instant RTL alignment, then return to English.  
**Spoken Narration:**  
> *"PRAN-NET closes the loop that consumer weather apps leave wide open: OBSERVE atmospheric feeds, INVESTIGATE source hypotheses, ACT via sector playbooks, and VERIFY decisions through an immutable audit ledger. With dual Obsidian and Porcelain themes, 13 Indian languages, and responsive mobile architecture, PRAN-NET makes air intelligence actionable and accountable. Thank you."*

---

## Emergency Contingencies
- **If network is offline:** Open-Meteo falls back safely to sample mode with red warning banner `"DATA SOURCE MODE: SAMPLE"`. Narration explicitly notes sample fallback.
- **If AWS cloud deployment is live:** Replace local endpoint reference at 2:05 with live AWS API Gateway URL and DynamoDB console verification.
