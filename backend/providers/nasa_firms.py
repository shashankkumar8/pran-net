"""NASA FIRMS Active Fire / Thermal Anomalies Adapter.
Official API: https://firms.modaps.eosdis.nasa.gov/api/
Scientific guardrail: Thermal anomalies are heat signatures detected by satellite sensors (VIIRS / MODIS).
They do not prove agricultural burning or identify specific localized air pollution sources without verified ground truth.
"""
from datetime import datetime, timezone
from common import cfg

def get_firms_status() -> dict:
    map_key = cfg("NASA_FIRMS_MAP_KEY")
    is_configured = bool(map_key)

    return {
        "provider": "NASA FIRMS (Fire Information for Resource Management System)",
        "data_type": "THERMAL ANOMALY SATELLITE DETECTION",
        "status": "LIVE" if is_configured else "NEEDS CONFIGURATION",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "details": (
            "Connected to NASA FIRMS API."
            if is_configured
            else "Server requires valid NASA FIRMS MAP_KEY. Thermal anomaly layer inactive until configured."
        ),
        "setup_guide": "Register at https://firms.modaps.eosdis.nasa.gov/api/map_key/ and set NASA_FIRMS_MAP_KEY on the server."
    }
