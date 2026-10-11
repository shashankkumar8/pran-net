# PRAN-NET Evidence & Data Sources Registry
**Official Providers, Attribution, Endpoints & Access Guidelines**

---

## 1. Open-Meteo Air Quality API
- **Official Documentation:** [https://open-meteo.com/en/docs/air-quality-api](https://open-meteo.com/en/docs/air-quality-api)
- **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Data Semantic Type:** `LIVE MODEL DATA`
- **Attribution / License:** Copernicus Atmosphere Monitoring Service (CAMS) / ECMWF. Non-commercial open access with mandatory provider attribution.
- **Access Requirements:** No personal API key required on baseline endpoints.
- **Variables Queried:** `pm2_5`, `pm10`, `nitrogen_dioxide`, `ozone`, `sulphur_dioxide`, `carbon_monoxide`, `european_aqi`, `us_aqi`.
- **Temporal Resolution:** Hourly atmospheric chemical reanalysis and forecast.
- **Truthful Labeling Requirement:** Must always be labeled `LIVE MODEL DATA` or `LIVE · OPEN-METEO`. Never disguised as a local ground monitoring station.

---

## 2. Open-Meteo Weather API
- **Official Documentation:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Data Semantic Type:** `LIVE WEATHER CONTEXT`
- **Attribution:** Numerical Weather Prediction (NWP) models operated by national meteorological agencies (ECMWF, German Weather Service DWD, NOAA GFS).
- **Access Requirements:** Free tier open access with attribution.
- **Variables Queried:** `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `wind_direction_10m`, `weather_code`.
- **Scientific Role:** Provides contextual meteorological vectors (wind velocity and compass bearing) for spatial upwind screening.

---

## 3. Central Pollution Control Board (CPCB) via data.gov.in
- **Official Catalogue:** [https://www.data.gov.in/catalog/real-time-air-quality-index](https://www.data.gov.in/catalog/real-time-air-quality-index)
- **Dataset Attribution:** Central Pollution Control Board (CPCB) / Ministry of Environment, Forest and Climate Change (MoEFCC).
- **Data Semantic Type:** `STATION GROUND MEASUREMENT`
- **Status in Unconfigured Environment:** `NEEDS CONFIGURATION`
- **Access Requirements:** Registered `api-key` from Open Government Data (OGD) Platform India, plus verified active `resource_id`.
- **Configuration Guide:**
  1. Register for an API key on [data.gov.in](https://data.gov.in).
  2. Locate the current active real-time air quality index resource ID.
  3. Store key as AWS SSM Parameter Store `SecureString` (`/schoolair/datagov-key`).
  4. Set `DATA_GOV_RESOURCE_ID` and `DATA_SOURCE_MODE=live`.
- **Integrity Rule:** If unconfigured, the system reports `NEEDS CONFIGURATION` and refuses to invent simulated ground measurements.

---

## 4. NASA FIRMS Active Fire / Thermal Anomalies
- **Official API Documentation:** [https://firms.modaps.eosdis.nasa.gov/api/](https://firms.modaps.eosdis.nasa.gov/api/)
- **MAP_KEY Registration:** [https://firms.modaps.eosdis.nasa.gov/api/map_key/](https://firms.modaps.eosdis.nasa.gov/api/map_key/)
- **Data Semantic Type:** `THERMAL ANOMALY SATELLITE DETECTION`
- **Status in Unconfigured Environment:** `NEEDS CONFIGURATION`
- **Sensors:** S-NPP VIIRS (VNP14IMGTDL), NOAA-20 VIIRS (VJ114IMGTDL), Aqua/Terra MODIS (MOD14).
- **Configuration Guide:**
  1. Obtain a free NASA MAP_KEY from the official portal.
  2. Configure `NASA_FIRMS_MAP_KEY` on the server.
- **Scientific Guardrail:** A thermal anomaly detection represents an infrared heat signature. It does not prove crop burning or establish statutory liability without ground verification.
