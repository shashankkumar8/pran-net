import time, json
import pytest, boto3
from conftest import seed, call
from engine import category_from_pollutants, build_station_advisory
import ingest, escalate

TOK = {"x-coordinator-token": "secret-token"}
def act(**kw): return {"activity": "sports", "decision": "followed", "action_taken": "Move activity indoors", **kw}

# ---- NAQI derivation
def test_pm_breakpoints():
    assert category_from_pollutants({"PM2.5": 130})["category"] == "Very Poor"
    assert category_from_pollutants({"PM2.5": 20, "PM10": 300})["category"] == "Poor"      # worst pollutant wins
    assert category_from_pollutants({"PM2.5": 300})["category"] == "Severe"
    assert category_from_pollutants({"PM2.5": -5, "PM10": "NA"}) is None
    assert category_from_pollutants({}) is None

# ---- ingest normalization (feed field names are assumptions; fixture mirrors them)
def rec(**kw):
    base = {"state": "Delhi", "city": "Delhi", "station": "Anand Vihar, Delhi - DPCC", "latitude": "28.64", "longitude": "77.31",
            "pollutant_id": "PM2.5", "avg_value": "180", "last_update": "10-10-2026 11:00:00"}
    return {**base, **kw}
def test_ingest_groups_and_derives():
    from datetime import datetime, timezone
    now = datetime(2026, 10, 10, 6, 30, tzinfo=timezone.utc)
    obs, skipped = ingest.normalize([rec(), rec(pollutant_id="PM10", avg_value="200"), rec(avg_value="NA", pollutant_id="NO2")], now)
    assert len(obs) == 1 and skipped == 0 and obs[0]["aqi_category"] == "Very Poor" and obs[0]["data_status"] == "live"
    assert obs[0]["observed_at"].startswith("2026-10-10T05:30")   # 11:00 IST -> 05:30 UTC
def test_ingest_skips_bad_rows():
    from datetime import datetime, timezone
    now = datetime(2026, 10, 10, 6, 30, tzinfo=timezone.utc)
    bad = [rec(latitude=""), rec(last_update="garbage"), rec(last_update="10-10-2026 23:00:00"), rec(station="")]
    obs, skipped = ingest.normalize(bad, now)
    assert obs == [] and skipped == 4
def test_ingest_sample_mode_writes_nothing(aws):
    assert ingest.handler()["ingested"] == 0

# ---- multi-station
def test_worst_fresh_and_disagreement(aws):
    seed(["Severe", "Moderate", "Satisfactory"])
    import common; obs = common.latest_observations(time.time())
    a = build_station_advisory(obs, "outdoor_assembly", time.time(), 28.6139, 77.2090)
    assert a["decision_code"] == "MOVE_INDOORS" and a["stations_disagree"] is True and len(a["stations_considered"]) == 3
def test_stale_gives_no_advice(aws):
    seed(["Very Poor"] * 3, age_s=5 * 3600)
    import common; obs = common.latest_observations(time.time())
    assert build_station_advisory(obs, "sports", time.time(), 28.6, 77.2)["decision_code"] == "NO_ADVICE"
def test_no_data_gives_no_advice(aws):
    assert build_station_advisory([], "sports", time.time(), 28.6, 77.2)["decision_code"] == "NO_ADVICE"
def test_sports_stricter_than_assembly(aws):
    seed(["Poor"] * 3)
    import common; obs = common.latest_observations(time.time())
    a = build_station_advisory(obs, "outdoor_assembly", time.time(), 28.6, 77.2)["decision_code"]
    s = build_station_advisory(obs, "sports", time.time(), 28.6, 77.2)["decision_code"]
    assert (a, s) == ("MODIFY", "MOVE_INDOORS")

# ---- API
def test_advisory_and_simulate(aws):
    seed(["Very Poor"] * 3)
    c, a = call("GET", "/advisory", q={"activity": "sports"}); assert c == 200 and a["decision_code"] == "MOVE_INDOORS" and a["any_sample"]
    c, s = call("GET", "/simulate"); assert c == 200 and len(s["items"]) == 4
    assert call("GET", "/advisory", q={"activity": "skydiving"})[0] == 400
def test_auth_and_validation(aws):
    seed(["Very Poor"] * 3)
    assert call("POST", "/actions", act(), {"idempotency-key": "k"})[0] == 401
    assert call("POST", "/actions", act(), {**TOK, "x-coordinator-token": "wrong", "idempotency-key": "k"})[0] == 401
    assert call("GET", "/actions")[0] == 401
    assert call("POST", "/actions", "{not json", {**TOK, "idempotency-key": "k"})[0] == 400
    assert call("POST", "/actions", act(decision="x"), {**TOK, "idempotency-key": "k"})[0] == 400
    assert call("POST", "/actions", act(note="a" * 501), {**TOK, "idempotency-key": "k"})[0] == 400
    assert call("POST", "/actions", act(), TOK)[0] == 400                      # missing idempotency key
    assert call("POST", "/actions", act(decision="overridden", note="no"), {**TOK, "idempotency-key": "k"})[0] == 400
def test_persistence_snapshot_and_duplicate(aws):
    seed(["Very Poor"] * 3)
    c, r = call("POST", "/actions", act(note="moved PE to hall"), {**TOK, "idempotency-key": "abc"}); assert c == 201
    assert r["item"]["advisory_snapshot"]["decision_code"] == "MOVE_INDOORS" and r["item"]["rules_version"]
    c2, r2 = call("POST", "/actions", act(note="moved PE to hall"), {**TOK, "idempotency-key": "abc"})
    assert c2 == 200 and r2["duplicate"] and r2["item"]["action_id"] == r["item"]["action_id"]
    c, h = call("GET", "/actions", headers=TOK); assert c == 200 and len(h["items"]) == 1          # no double write
    c, m = call("GET", "/metrics", headers=TOK); assert m["actions_recorded"] == 1
def test_scenario_validation(aws):
    assert call("POST", "/scenario", {"outdoor_pm25": 200})[0] == 200
    assert call("POST", "/scenario", {"outdoor_pm25": 5000})[0] == 400
    assert call("POST", "/scenario", {})[0] == 400

# ---- escalation
@pytest.fixture
def sns(aws, monkeypatch):
    arn = boto3.client("sns").create_topic(Name="t")["TopicArn"]; monkeypatch.setenv("ALERT_TOPIC_ARN", arn)
    sent = []
    monkeypatch.setattr(escalate, "_publish", lambda **kw: sent.append(kw))
    return sent
def test_escalation_once_then_not_after_review(aws, sns):
    seed(["Very Poor"] * 3); t0 = time.time()
    assert escalate.handler(now=t0)["reason"] == "within review window"
    assert escalate.handler(now=t0 + 31 * 60)["escalated"] is True
    assert escalate.handler(now=t0 + 60 * 60)["escalated"] is False and len(sns) == 1   # at-most-once
def test_no_escalation_when_reviewed(aws, sns, monkeypatch):
    seed(["Very Poor"] * 3); t0 = time.time(); escalate.handler(now=t0)
    time.sleep(1.1); assert call("POST", "/actions", act(), {**TOK, "idempotency-key": "r1"})[0] == 201
    assert escalate.handler(now=t0 + 40 * 60)["reason"] == "reviewed" and sns == []
def test_no_escalation_when_not_severe(aws, sns):
    seed(["Moderate"] * 3); assert escalate.handler(now=time.time() + 4000)["escalated"] is False and sns == []
