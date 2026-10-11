"""Conservative, deterministic decision support. Not medical or legal advice."""
from math import isfinite, radians, sin, cos, asin, sqrt
RULES_VERSION = "0.3.0"
ACTIVITIES = {
    "outdoor_assembly": "Outdoor assembly",
    "sports": "Sports / physical education",
    "routine_outdoor": "Routine outdoor activity",
    "indoor_class": "Indoor classroom activity",
}
# Policy default (editable, not an official threshold): strenuous activity is judged one category stricter.
ACTIVITY_OFFSET = {"outdoor_assembly": 0, "routine_outdoor": 0, "sports": 1}
KNOWN_CATEGORIES = {"good": 0, "satisfactory": 1, "moderate": 2, "poor": 3, "very poor": 4, "severe": 5, "hazardous": 6, "unhealthy": 3}


def assess_freshness(observation, now_epoch, max_age_minutes=180):
    for key in ("observed_at_epoch", "source", "station_id"):
        if observation.get(key) in (None, ""):
            return {"status": "invalid", "reason": "Required observation metadata is missing."}
    try:
        age = (float(now_epoch) - float(observation["observed_at_epoch"])) / 60
    except (TypeError, ValueError):
        return {"status": "invalid", "reason": "Observation timestamp is invalid."}
    if not isfinite(age) or age < 0:
        return {"status": "invalid", "reason": "Observation timestamp is invalid or in the future."}
    if age > max_age_minutes:
        return {"status": "stale", "reason": "Observation exceeds configured freshness window."}
    return {"status": "fresh", "age_minutes": round(age, 1), "reason": "Within configured freshness window."}


def build_advisory(observation, activity, now_epoch, max_age_minutes=180, stations_disagree=False):
    freshness = assess_freshness(observation, now_epoch, max_age_minutes)
    base = {"activity": activity, "rules_version": RULES_VERSION, "evidence": observation,
            "freshness": freshness, "stations_disagree": bool(stations_disagree),
            "limitations": ["Station readings are not personal or indoor exposure measurements.",
                            "This prototype is not medical advice or a legal directive.",
                            "Confirm current guidance from the relevant authority."]}
    if activity not in ACTIVITIES:
        return {**base, "status": "invalid", "recommendation": None, "decision_code": "NO_ADVICE", "reason": "Unsupported activity."}
    if freshness["status"] != "fresh":
        return {**base, "status": freshness["status"], "recommendation": None,
                "decision_code": "NO_ADVICE", "reason": freshness["reason"] + " Verify current conditions before deciding."}
    category = observation.get("aqi_category")
    if not category or str(category).strip().lower() not in KNOWN_CATEGORIES:
        return {**base, "status": "insufficient_data", "recommendation": None, "decision_code": "NO_ADVICE",
                "reason": "Missing or unrecognized source-provided AQI category; no activity advice generated."}
    rank = KNOWN_CATEGORIES[str(category).strip().lower()]
    if activity == "indoor_class":
        return {**base, "status": "usable", "decision_code": "PROCEED", "aqi_category": category,
                "recommendation": "Indoor activity: the station reading is context only. Outdoor air is not classroom air; follow routine procedures.",
                "reason": "Indoor activity has no outdoor exposure rule in this policy table."}
    rank = min(rank + ACTIVITY_OFFSET.get(activity, 0), 6)
    if stations_disagree and rank < 4:
        code = "VERIFY_FIRST"
        recommendation = "Nearby stations differ materially. Verify the latest official readings before deciding."
    elif rank >= 4:
        code = "MOVE_INDOORS"
        recommendation = "Review the activity against current official guidance; consider moving outdoor activity indoors or rescheduling."
    elif rank >= 3:
        code = "MODIFY"
        recommendation = "Review current official guidance and consider reducing, relocating, or rescheduling outdoor activity."
    elif rank == 2:
        code = "PROCEED_AND_MONITOR"
        recommendation = "Follow school procedures and re-check current conditions before and during the activity."
    else:
        code = "PROCEED"
        recommendation = "Follow routine school procedures and continue monitoring current conditions."
    return {**base, "status": "usable", "recommendation": recommendation, "decision_code": code,
            "aqi_category": category,
            "reason": "Deterministic prompt based on the source-provided category; this is not an official threshold or order."}


def indoor_scenario(c_out, ach=1.2, k_dep=0.24, cadr=0.0, vol=150.0, penetration=0.8):
    """Illustrative steady-state PM2.5 scenario. All parameters are assumptions, not measurements."""
    vals = (c_out, ach, k_dep, cadr, vol, penetration)
    if not all(isinstance(x, (int, float)) and isfinite(x) for x in vals):
        raise ValueError("All scenario inputs must be finite numbers.")
    if not (0 <= c_out <= 1000 and 0 <= ach <= 20 and 0 <= k_dep <= 20 and 0 <= cadr <= 100000 and 20 <= vol <= 10000 and 0 <= penetration <= 1):
        raise ValueError("Scenario input is outside the permitted range.")
    denominator = ach + k_dep + cadr / vol
    if denominator <= 0:
        raise ValueError("At least one removal/air-exchange term must be positive.")
    return {"estimated_steady_state_pm25": round(penetration * ach * c_out / denominator, 1),
            "unit": "same concentration unit as c_out", "label": "MODEL SCENARIO, NOT MEASURED",
            "assumptions": {"outdoor_pm25": c_out, "air_changes_per_hour": ach, "deposition_rate_per_hour": k_dep,
                            "clean_air_delivery_rate_m3_per_hour": cadr, "room_volume_m3": vol, "penetration_fraction": penetration},
            "warning": "Illustrative steady-state model only; not validated for a specific room and never used to generate the activity advisory."}


# ---- CPCB NAQI PM breakpoints (ug/m3) -> category. Verify against the current CPCB NAQI document before relying on them.
PM25_BP = [(30, "Good"), (60, "Satisfactory"), (90, "Moderate"), (120, "Poor"), (250, "Very Poor")]
PM10_BP = [(50, "Good"), (100, "Satisfactory"), (250, "Moderate"), (350, "Poor"), (430, "Very Poor")]

def _cat(v, bp):
    for cap, name in bp:
        if v <= cap:
            return name
    return "Severe"

def category_from_pollutants(p):
    """Worst of PM2.5/PM10 vs NAQI breakpoints. Indicative only: hourly values, whereas NAQI uses 24-h averages."""
    cands = []
    for key, bp in (("PM2.5", PM25_BP), ("PM10", PM10_BP)):
        v = (p or {}).get(key)
        if isinstance(v, (int, float)) and not isinstance(v, bool) and isfinite(v) and 0 <= v <= 2000:
            name = _cat(v, bp)
            cands.append((KNOWN_CATEGORIES[name.lower()], name, key))
    if not cands:
        return None
    _, name, key = max(cands)
    return {"category": name, "basis": key,
            "note": "Indicative: latest hourly value vs CPCB NAQI PM breakpoints; official NAQI uses 24-hour averages."}

def haversine_km(a, b, c, d):
    p = radians(c - a); q = radians(d - b)
    h = sin(p / 2) ** 2 + cos(radians(a)) * cos(radians(c)) * sin(q / 2) ** 2
    return 2 * 6371 * asin(sqrt(h))

def _rank(o):
    c = o.get("aqi_category")
    return KNOWN_CATEGORIES.get(str(c).strip().lower()) if c else None

def build_station_advisory(observations, activity, now_epoch, lat, lon, k=3, max_age_minutes=180):
    """Nearest-k stations; conservative: use the WORST fresh category; flag disagreement of >=2 categories."""
    near = sorted(((haversine_km(lat, lon, o["lat"], o["lon"]), o) for o in observations
                   if isinstance(o.get("lat"), (int, float)) and isinstance(o.get("lon"), (int, float))),
                  key=lambda t: t[0])[:k]
    considered = [{"station_id": o.get("station_id"), "station_name": o.get("station_name"), "distance_km": round(d, 1),
                   "category": o.get("aqi_category"), "freshness": assess_freshness(o, now_epoch, max_age_minutes)["status"],
                   "observed_at": o.get("observed_at"), "data_status": o.get("data_status")} for d, o in near]
    rule = "Worst category among fresh readings from the nearest 3 stations (conservative; no averaging)."
    if not near:
        return {"activity": activity, "rules_version": RULES_VERSION, "status": "insufficient_data", "decision_code": "NO_ADVICE",
                "recommendation": None, "reason": "No recent station observation with coordinates is available.",
                "freshness": {"status": "missing"}, "evidence": None, "stations_disagree": False,
                "stations_considered": [], "selection_rule": rule, "limitations": ["No advice is generated without current evidence."]}
    usable = [(d, o) for d, o in near if assess_freshness(o, now_epoch, max_age_minutes)["status"] == "fresh" and _rank(o) is not None]
    if not usable:
        adv = build_advisory(near[0][1], activity, now_epoch, max_age_minutes)
    else:
        ranks = [_rank(o) for _, o in usable]
        disagree = max(ranks) - min(ranks) >= 2
        d, chosen = max(usable, key=lambda t: (_rank(t[1]), -t[0]))
        adv = build_advisory(chosen, activity, now_epoch, max_age_minutes, disagree)
        adv["chosen_station_distance_km"] = round(d, 1)
    adv["stations_considered"] = considered
    adv["selection_rule"] = rule
    return adv
