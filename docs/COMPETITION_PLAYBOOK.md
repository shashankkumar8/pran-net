# SchoolAir Ledger — competition polish plan

## One-sentence differentiation

**SchoolAir Ledger is not another AQI dashboard: it makes the evidence, uncertainty, human decision, and decision-time snapshot visible in one school workflow.**

## What judges should see in the first 30 seconds

1. A crisp problem: school staff need to decide, not merely observe a number.
2. Evidence provenance: source, observation time, retrieval time, freshness, and rule version.
3. An honest failure mode: stale, invalid, unknown, or conflicting data produces `NO_ADVICE` / `VERIFY_FIRST`, not a fabricated confident answer.
4. The action ledger: a human's reported decision stored with the evidence snapshot that informed it.

## Judge criteria → proof to show

| Criterion | Proof in demo | Avoid claiming |
|---|---|---|
| Impact | Concrete school-coordinator workflow and bilingual notice draft | Reduced illness, improved health, or adoption without evidence |
| Technical execution | Deterministic engine tests, source timestamps, conservative station comparison, input validation | Live data, AWS deployment, or end-to-end reliability before actually tested |
| AWS use | Live console evidence from resources genuinely deployed: Lambda, API Gateway, DynamoDB, EventBridge, CloudWatch | Listing AWS services that exist only in the template |
| Usability | Activity comparison, explicit freshness/uncertainty, English/Hindi notice, keyboard and narrow-screen check | Claiming accessibility compliance without testing |
| Originality | Evidence-to-action and accountability loop; not just a map/chart | Claiming no competitors or prior art without research |

## Final-day priority order

1. **Data integrity first:** verify the CPCB/data.gov.in resource ID, terms, fields, units, timestamps, coverage and attribution. If this fails, use a clearly labelled synthetic walkthrough; never disguise it as live.
2. **Deploy the minimum AWS path:** API + observations/action tables + secure token + restricted CORS. Confirm action persistence after refresh and inspect the exact DynamoDB item.
3. **Make a failure case visible:** stale timestamp or station disagreement must show why the app refuses confident advice.
4. **Run the entire demo twice:** one clean happy path and one refusal/uncertainty path. Capture a backup screen recording in case of venue/network failure.
5. **Accessibility and polish:** keyboard-only navigation, 375px width, visible focus, legible contrast, no console errors, clear loading/error/empty states.
6. **Submission hygiene:** public repo, setup instructions, AI-tool disclosure per rules, concise write-up, video under three minutes, and deadline verified on the official event page.

## Do not add unless the core path is already verified

- LLM-generated health advice or legal/GRAP directives.
- Forecasting or personalized exposure estimates without validated data and methodology.
- SMS before legal/operational requirements are met.
- NASA fire layers, maps, or extra charts that distract from the core school decision workflow.
- SNS escalation until there is a reliable school configuration model, one-time-send state, and a tested email delivery path.

## Three-minute narrative

- **0:00–0:20:** Problem and product in one sentence.
- **0:20–0:55:** Show source, observed/retrieved times, freshness and rules version.
- **0:55–1:25:** Compare four activities and show a station disagreement or insufficient-evidence state.
- **1:25–1:45:** Adjust the indoor model and explicitly say it is not measured and does not affect the advisory.
- **1:45–2:15:** Draft parent notice, record a human decision, refresh, inspect the stored snapshot.
- **2:15–2:40:** Show AWS resources/logs only if deployed; otherwise show tests and state deployment is pending.
- **2:40–3:00:** One-sentence differentiator, limitations, and next validation step.
