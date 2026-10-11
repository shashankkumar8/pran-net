import pytest
from conftest import call
from providers.open_meteo_air_quality import fetch_air_quality
from providers.open_meteo_weather import fetch_weather, degrees_to_compass
from providers.cpcb_ogd import get_cpcb_status
from providers.nasa_firms import get_firms_status

def test_compass_conversion():
    assert degrees_to_compass(0) == "N"
    assert degrees_to_compass(90) == "E"
    assert degrees_to_compass(180) == "S"
    assert degrees_to_compass(270) == "W"
    assert degrees_to_compass(315) == "NW"

def test_cpcb_and_firms_require_configuration(monkeypatch):
    monkeypatch.delenv("DATA_GOV_KEY_PARAMETER", raising=False)
    monkeypatch.delenv("DATA_GOV_RESOURCE_ID", raising=False)
    monkeypatch.delenv("NASA_FIRMS_MAP_KEY", raising=False)

    cpcb = get_cpcb_status()
    assert cpcb["status"] == "NEEDS CONFIGURATION"
    assert "data.gov.in" in cpcb["setup_guide"]

    firms = get_firms_status()
    assert firms["status"] == "NEEDS CONFIGURATION"
    assert "NASA_FIRMS_MAP_KEY" in firms["setup_guide"]

def test_data_sources_endpoint(aws):
    code, res = call("GET", "/health/data-sources")
    assert code == 200
    assert len(res["data_sources"]) == 4
    names = [s.get("name") or s.get("provider", "") for s in res["data_sources"]]
    assert any("Open-Meteo" in str(x) for x in names)

def test_sectors_endpoint(aws):
    code, res = call("GET", "/sectors")
    assert code == 200
    assert len(res["sectors"]) == 3
    sec_ids = [s["id"] for s in res["sectors"]]
    assert "municipal" in sec_ids and "logistics" in sec_ids and "campus" in sec_ids

def test_live_open_meteo_real_network():
    """Real network smoke test against Open-Meteo API."""
    aq = fetch_air_quality(28.6139, 77.2090, timeout_sec=10)
    assert aq["provider"] == "Open-Meteo Air Quality API"
    assert aq["data_type"] == "LIVE MODEL DATA"
    if aq["status"] == "LIVE":
        assert "PM2.5" in aq["pollutants"]
        assert aq["pollutants"]["PM2.5"] >= 0
        assert aq["valid_time"] is not None
        assert aq["indicative_category"] in ("Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe")

    weather = fetch_weather(28.6139, 77.2090, timeout_sec=10)
    assert weather["provider"] == "Open-Meteo Weather API"
    assert weather["data_type"] == "LIVE WEATHER CONTEXT"
    if weather["status"] == "LIVE":
        assert weather["temperature_c"] is not None
        assert weather["wind_speed_kmh"] is not None
        assert weather["wind_compass"] != "Unknown"
