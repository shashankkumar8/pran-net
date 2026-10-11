# 3-minute demo (rehearse; keep under 3:00)
Pre-flight: seed `severe` sample OR live data fresh; token ready; SNS subscription confirmed; second window with AWS console tabs (DynamoDB, EventBridge, CloudWatch, SNS).
- 0:00-0:20 Problem: AQI apps show a number; coordinators must decide *today*, and nothing records what they decided or what the data said. Show the live Amplify URL.
- 0:20-1:00 Advisory: decisive station, category, observed vs retrieved time, freshness badge, stations-considered table. Switch activity to Sports: decision gets stricter.
- 1:00-1:20 Simulator: same evidence, four activities. Point at the "measured, not forecast" label and the model-scenario label on the indoor tool.
- 1:20-1:55 Record a decision (try overriding with no reason: rejected). Record with a reason, **refresh the page**, reload ledger: record persists with its evidence snapshot.
- 1:55-2:30 AWS proof: DynamoDB ledger item (advisory_snapshot), EventBridge schedules (hourly ingest, 15-min escalation), CloudWatch ingest log/metric, SNS email received for an unreviewed severe advisory.
- 2:30-3:00 Honesty: seed `stale` and show NO_ADVICE; state limits (station is not personal exposure, policy defaults, sample vs live).
Never say "live" while sample data is shown; the red banner must be visible if it is sample.
