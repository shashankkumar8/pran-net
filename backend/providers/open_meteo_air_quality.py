"""Open-Meteo Air Quality Provider Adapter for PRAN-NET.
Official documentation: https://open-meteo.com/en/docs/air-quality-api
License: Open-Meteo free non-commercial / attribution required.
Data Source: Atmospheric model forecasts / Copernicus CAMS.
Strict rule: Model data is labeled LIVE MODEL DATA, never CPCB station measurements.
"""
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from engine import category_from_pollutants

ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality"

def fetch_air_quality(lat: float, lon: float, timeout_sec: int = 8) -> dict:
    retrieved_at = datetime.now(timezone.utc).isoformat()
    params = {
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "current": "pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide,european_aqi,us_aqi",
        "timezone": "auto"
    }
    url = f"{ENDPOINT}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "PRAN-NET/1.0 (Environmental Decision Support)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as r:
            payload = json.load(r)
    except Exception as exc:
        return {
            "provider": "Open-Meteo Air Quality API",
            "provider_url": "https://open-meteo.com",
            "data_type": "LIVE MODEL DATA",
            "status": "UNAVAILABLE",
            "retrieved_at": retrieved_at,
            "error": f"Failed to retrieve model telemetry: {type(exc).__name__}",
            "location": {"lat": lat, "lon": lon},
            "pollutants": None,
            "category": None
        }

    current = payload.get("current") or {}
    cur_units = payload.get("current_units") or {}
    
    pollutants = {}
    if "pm2_5" in current and current["pm2_5"] is not None:
        pollutants["PM2.5"] = float(current["pm2_5"])
    if "pm10" in current and current["pm10"] is not None:
        pollutants["PM10"] = float(current["pm10"])
    if "nitrogen_dioxide" in current and current["nitrogen_dioxide"] is not None:
        pollutants["NO2"] = float(current["nitrogen_dioxide"])
    if "ozone" in current and current["ozone"] is not None:
        pollutants["O3"] = float(current["ozone"])
    if "sulphur_dioxide" in current and current["sulphur_dioxide"] is not None:
        pollutants["SO2"] = float(current["sulphur_dioxide"])
    if "carbon_monoxide" in current and current["carbon_monoxide"] is not None:
        pollutants["CO"] = float(current["carbon_monoxide"])

    cat_derived = category_from_pollutants(pollutants)

    return {
        "provider": "Open-Meteo Air Quality API",
        "provider_url": "https://open-meteo.com",
        "model_attribution": "Copernicus Atmosphere Monitoring Service (CAMS) / ECMWF",
        "data_type": "LIVE MODEL DATA",
        "status": "LIVE",
        "valid_time": current.get("time"),
        "retrieved_at": retrieved_at,
        "location": {
            "lat": payload.get("latitude", lat),
            "lon": payload.get("longitude", lon),
            "elevation": payload.get("elevation", 0)
        },
        "pollutants": pollutants,
        "units": {
            "PM2.5": cur_units.get("pm2_5", "µg/m³"),
            "PM10": cur_units.get("pm10", "µg/m³"),
            "NO2": cur_units.get("nitrogen_dioxide", "µg/m³"),
            "O3": cur_units.get("ozone", "µg/m³"),
            "SO2": cur_units.get("sulphur_dioxide", "µg/m³"),
            "CO": cur_units.get("carbon_monoxide", "µg/m³")
        },
        "european_aqi": current.get("european_aqi"),
        "us_aqi": current.get("us_aqi"),
        "indicative_category": cat_derived.get("category") if cat_derived else "Unavailable",
        "category_basis": cat_derived.get("basis") if cat_derived else None,
        "methodology_note": "Model-derived hourly atmospheric concentration. Evaluated against CPCB NAQI breakpoints for indicative decision support."
    }
