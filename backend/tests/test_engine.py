import pytest
from engine import assess_freshness, build_advisory, indoor_scenario, RULES_VERSION

def obs(now):
    return {"station_id":"test", "source":"test", "observed_at_epoch":now-60, "aqi_category":"Poor", "aqi":180, "data_status":"test"}

def test_fresh_advisory_is_explainable():
    now=1800000000; result=build_advisory(obs(now),"outdoor_assembly",now)
    assert result["status"]=="usable" and result["recommendation"]
    assert result["rules_version"]==RULES_VERSION and result["evidence"]
    assert result["decision_code"] == "MODIFY"

def test_stale_data_refuses_recommendation():
    now=1800000000; item=obs(now); item["observed_at_epoch"]=now-5*3600
    result=build_advisory(item,"sports",now)
    assert result["status"]=="stale" and result["recommendation"] is None and result["decision_code"]=="NO_ADVICE"

def test_unknown_category_refuses_advice():
    now=1800000000; item=obs(now); item["aqi_category"]="invented"
    result=build_advisory(item,"sports",now)
    assert result["status"]=="insufficient_data" and result["recommendation"] is None

def test_missing_source_invalid():
    now=1800000000; item=obs(now); del item["source"]
    assert assess_freshness(item,now)["status"]=="invalid"

def test_disagreement_requires_verification():
    now=1800000000
    result=build_advisory(obs(now),"outdoor_assembly",now,stations_disagree=True)
    assert result["decision_code"]=="VERIFY_FIRST"

def test_future_timestamp_invalid():
    now=1800000000; item=obs(now); item["observed_at_epoch"]=now+360
    assert build_advisory(item,"sports",now)["decision_code"]=="NO_ADVICE"

def test_indoor_scenario_is_explicitly_labelled():
    result=indoor_scenario(100, ach=1.2, cadr=300, vol=150)
    assert result["estimated_steady_state_pm25"] >= 0
    assert result["label"]=="MODEL SCENARIO, NOT MEASURED"
    assert "warning" in result

@pytest.mark.parametrize("kwargs", [{"c_out":-1},{"c_out":100,"ach":21},{"c_out":100,"vol":0},{"c_out":100,"ach":0,"cadr":0,"k_dep":0}])
def test_scenario_rejects_invalid_ranges(kwargs):
    with pytest.raises(ValueError): indoor_scenario(**kwargs)
