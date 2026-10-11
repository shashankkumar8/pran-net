# PRAN-NET — 2:45 Hackathon Demo Script

**Target length:** 2 minutes 45 seconds  
**Format:** screen recording with spoken narration  
**Important:** show the actual running application; do not simulate data or imply that unconfigured integrations are live.

## 0:00–0:20 — The problem and solution

“Air-quality information is often fragmented: people can see pollution numbers, but turning those numbers into coordinated action is difficult. PRAN-NET — the Pran Operational Mitigation Network — brings air-quality evidence, geographic context, and human-reviewed mitigation workflows into one multilingual platform.”

## 0:20–0:55 — Air Quality Overview

Show the dashboard and pollutant cards.

“PRAN-NET presents PM2.5, PM10 and other available pollutant indicators alongside weather context. The interface labels Open-Meteo/CAMS atmospheric data as modelled estimates. It does not misrepresent these estimates as direct CPCB ground-station readings.”

**Recording check:** show a source/provenance label and avoid narrating fixed readings as current unless the screen confirms them.

## 0:55–1:20 — Geographic Air Quality Map

Open the map and zoom or pan.

“The geographic view helps users explore spatial patterns and understand where additional monitoring or review may be needed. Map layers and markers are presented with their available data context.”

## 1:20–1:50 — Analysis and action workflows

Show Pollution Source Analysis, Sector Action Plans, Action Review, and Action History.

“PRAN-NET connects evidence to structured operational proposals for contexts such as municipal operations, logistics, and campuses. Proposed actions remain subject to human review. The action-history workflow is designed to preserve accountability around decisions and their supporting evidence.”

Do not claim persistent cloud storage is live unless you have verified a deployed backend.

## 1:50–2:15 — Accessibility and transparency

Switch language and, if time permits, show the light/dark theme or mobile layout.

“The interface supports 13 languages, including Urdu right-to-left layout, responsive screens, and an installable Progressive Web App experience. Data & Evidence and Methods & Guidance make source status, limitations, and methodology easier to inspect.”

## 2:15–2:35 — Architecture

Show the README architecture section or a simple architecture slide.

“The frontend uses React, TypeScript, and Vite, with a Python backend. The project includes an AWS SAM serverless architecture for Lambda, API Gateway, DynamoDB, and SNS. These AWS resources are prepared in configuration; a successful live AWS deployment is not yet verified.”

## 2:35–2:45 — Close

“PRAN-NET aims to make air-quality evidence more understandable, transparent, and actionable while keeping decisions accountable to human reviewers. Thank you.”

---

## Final recording checklist

- [ ] Browser is maximized; close unrelated tabs and notifications.
- [ ] Use the actual application, not a slide deck alone.
- [ ] Wait for loading and remove accidental cursor movement.
- [ ] Do not show API keys, environment files, personal information, or credentials.
- [ ] Do not call modelled values official CPCB readings.
- [ ] Do not claim CPCB, NASA FIRMS, AWS, or Android APK integrations are live unless verified.
- [ ] Keep the video under 3 minutes.
- [ ] Upload to YouTube as **Unlisted** or **Public** and test the share link in a private/incognito window.