"""CPCB / Open Government Data Platform India Provider Adapter.
Official Catalogue: https://www.data.gov.in/catalog/real-time-air-quality-index
Dataset Attribution: Central Pollution Control Board (CPCB) / MoEFCC.
"""
from datetime import datetime, timezone
from common import cfg

def get_cpcb_status() -> dict:
    key_param = cfg("DATA_GOV_KEY_PARAMETER")
    res_id = cfg("DATA_GOV_RESOURCE_ID")
    mode = cfg("DATA_SOURCE_MODE", "sample").lower()

    is_configured = bool(key_param and res_id and mode == "live")

    return {
        "provider": "CPCB via data.gov.in (Open Government Data Platform India)",
        "data_type": "STATION GROUND MEASUREMENT",
        "status": "LIVE" if is_configured else "NEEDS CONFIGURATION",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "details": (
            "Connected to official CPCB real-time API."
            if is_configured
            else "Server requires valid data.gov.in API Key and verified Resource ID. Ground monitoring feed inactive until configured."
        ),
        "setup_guide": "Obtain API key at data.gov.in, set /schoolair/datagov-key in SSM, set DATA_GOV_RESOURCE_ID, and set DATA_SOURCE_MODE=live."
    }
