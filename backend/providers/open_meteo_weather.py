"""Open-Meteo Weather Provider Adapter for PRAN-NET.
Official documentation: https://open-meteo.com/en/docs
Data Source: Numerical Weather Prediction models (ECMWF, DWD, GFS).
Data Type: LIVE WEATHER CONTEXT.
Scientific guardrail: Wind vectors provide directional screening context, not validated plume dispersion.
"""
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone

ENDPOINT = "https://api.open-meteo.com/v1/forecast"

COMPASS_POINTS = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
]

def degrees_to_compass(deg: float) -> str:
    if deg is None:
        return "Unknown"
    val = int((deg / 22.5) + 0.5)
    return COMPASS_POINTS[val % 16]

def fetch_weather(lat: float, lon: float, timeout_sec: int = 8) -> dict:
    retrieved_at = datetime.now(timezone.utc).isoformat()
    params = {
        "latitude": round(lat, 4),
        "longitude": round(lon, 4),
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code",
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
            "provider": "Open-Meteo Weather API",
            "provider_url": "https://open-meteo.com",
            "data_type": "LIVE WEATHER CONTEXT",
            "status": "UNAVAILABLE",
            "retrieved_at": retrieved_at,
            "error": f"Failed to retrieve weather context: {type(exc).__name__}",
            "location": {"lat": lat, "lon": lon},
            "weather": None
        }

    current = payload.get("current") or {}
    cur_units = payload.get("current_units") or {}
    wind_dir = current.get("wind_direction_10m")

    return {
        "provider": "Open-Meteo Weather API",
        "provider_url": "https://open-meteo.com",
        "data_type": "LIVE WEATHER CONTEXT",
        "status": "LIVE",
        "valid_time": current.get("time"),
        "retrieved_at": retrieved_at,
        "location": {
            "lat": payload.get("latitude", lat),
            "lon": payload.get("longitude", lon)
        },
        "temperature_c": current.get("temperature_2m"),
        "relative_humidity_percent": current.get("relative_humidity_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "wind_direction_deg": wind_dir,
        "wind_compass": degrees_to_compass(wind_dir) if wind_dir is not None else "Unknown",
        "weather_code": current.get("weather_code"),
        "units": {
            "temperature": cur_units.get("temperature_2m", "°C"),
            "relative_humidity": cur_units.get("relative_humidity_2m", "%"),
            "wind_speed": cur_units.get("wind_speed_10m", "km/h"),
            "wind_direction": cur_units.get("wind_direction_10m", "°")
        },
        "scientific_caveat": "Wind direction is meteorological context for bearing screening. Not a calibrated atmospheric dispersion model."
    }
