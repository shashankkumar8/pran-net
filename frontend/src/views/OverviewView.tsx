import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Compass,
  Wind,
  Thermometer,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LiveTelemetry, ViewId, LocationCoordinates } from '../types';
import { LangCode, t } from '../i18n';

interface OverviewViewProps {
  telemetry: LiveTelemetry | null;
  adv: any;
  sim: any[];
  activity: string;
  onActivityChange: (act: string) => void;
  activities: Record<string, string>;
  onProposeAction: (proposal: { sector: string; action: string; reason: string }) => void;
  onNavigate: (view: ViewId) => void;
  currentLang: LangCode;
  selectedLocation: LocationCoordinates;
  onLocationChange: (loc: LocationCoordinates) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const INDIAN_CITIES: LocationCoordinates[] = [
  { name: 'Delhi-NCR Central Core', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Patna, Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Guwahati, Assam', lat: 26.1445, lon: 91.7362 },
  { name: 'Bhubaneswar, Odisha', lat: 20.2961, lon: 85.8245 },
  { name: 'Chandigarh Capital Region', lat: 30.7333, lon: 76.7794 },
  { name: 'Srinagar, Jammu & Kashmir', lat: 34.0837, lon: 74.7973 },
];

export function getAqiCategory(pm25: number): { label: string; color: string; bg: string; desc: string } {
  if (pm25 <= 30) {
    return { label: 'Good', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', desc: 'Minimal health impact; satisfactory air quality.' };
  } else if (pm25 <= 60) {
    return { label: 'Satisfactory', color: '#84CC16', bg: 'rgba(132, 204, 22, 0.15)', desc: 'Minor breathing discomfort to sensitive people.' };
  } else if (pm25 <= 90) {
    return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', desc: 'Breathing discomfort to people with asthma and heart disease.' };
  } else if (pm25 <= 120) {
    return { label: 'Poor', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', desc: 'Breathing discomfort to most people on prolonged exposure.' };
  } else if (pm25 <= 250) {
    return { label: 'Very Poor', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.18)', desc: 'Respiratory illness on prolonged exposure; caution advised.' };
  } else {
    return { label: 'Severe', color: '#881337', bg: 'rgba(136, 19, 55, 0.25)', desc: 'Healthy people affected; serious health impact on vulnerable.' };
  }
}

export default function OverviewView({
  telemetry,
  adv,
  sim,
  activity,
  onActivityChange,
  activities,
  onProposeAction,
  onNavigate,
  currentLang,
  selectedLocation,
  onLocationChange,
  onRefresh,
  loading,
}: OverviewViewProps) {
  const [activePollutant, setActivePollutant] = useState<string>('PM2.5');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState(selectedLocation.lat.toString());
  const [manualLon, setManualLon] = useState(selectedLocation.lon.toString());
  const [manualName, setManualName] = useState(selectedLocation.name);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const aq = telemetry?.air_quality;
  const weather = telemetry?.weather;
  const pm25Val = aq?.pollutants?.['PM2.5'] ?? 69.2;
  const cat = getAqiCategory(pm25Val);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocation.lat, selectedLocation.lon],
        zoom: 11,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([selectedLocation.lat, selectedLocation.lon], 11);
    }

    const map = leafletMapRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Custom pulse marker for active observation point
    const pinHtml = `
      <div style="background-color: ${cat.color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px ${cat.color}; animation: pulse 2s infinite;"></div>
    `;

    const customIcon = L.divIcon({
      className: 'pran-map-pin',
      html: pinHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const marker = L.marker([selectedLocation.lat, selectedLocation.lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: system-ui; padding: 4px; font-size: 13px;">
        <strong style="color: ${cat.color};">${selectedLocation.name}</strong><br/>
        <b>PM2.5:</b> ${pm25Val} µg/m³ (${cat.label})<br/>
        <span style="font-size: 11px; color: #64748b;">Source: ${aq?.provider || 'CAMS Model'}</span>
      </div>
    `).openPopup();

    // Circle representing model grid resolution (approx 10km grid)
    L.circle([selectedLocation.lat, selectedLocation.lon], {
      color: cat.color,
      fillColor: cat.color,
      fillOpacity: 0.12,
      radius: 5000,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    return () => {
      // Keep map instance alive across re-renders but update view
    };
  }, [selectedLocation.lat, selectedLocation.lon, pm25Val, cat.color, cat.label, aq?.provider, selectedLocation.name]);

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = INDIAN_CITIES.find((c) => c.name === e.target.value);
    if (found) {
      onLocationChange(found);
      setManualLat(found.lat.toString());
      setManualLon(found.lon.toString());
      setManualName(found.name);
      setGeoError(null);
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        const newLoc: LocationCoordinates = {
          name: `Current Location (${lat}°N, ${lon}°E)`,
          lat,
          lon,
        };
        onLocationChange(newLoc);
        setManualLat(lat.toString());
        setManualLon(lon.toString());
        setManualName(newLoc.name);
      },
      (err) => {
        setGeoError(`Location permission denied or unavailable (${err.message}).`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setGeoError('Please enter valid coordinates (-90 to 90 lat, -180 to 180 lon).');
      return;
    }
    setGeoError(null);
    onLocationChange({
      name: manualName.trim() || `Coordinates (${lat}, ${lon})`,
      lat,
      lon,
    });
  };

  // Pollutants definition with national benchmarks (CPCB 24-hr standards)
  const pollutantDetails: Record<string, { standard: number; unit: string; desc: string }> = {
    'PM2.5': { standard: 60, unit: 'µg/m³', desc: 'Fine respirable particles (<2.5 µm); penetrates deep into lung alveoli.' },
    'PM10': { standard: 100, unit: 'µg/m³', desc: 'Coarse inhalable particles (<10 µm); primarily from dust and road abrasion.' },
    'NO2': { standard: 80, unit: 'µg/m³', desc: 'Nitrogen dioxide from vehicular combustion and high-temperature industrial exhaust.' },
    'O3': { standard: 100, unit: 'µg/m³', desc: 'Ground-level ozone produced by photochemical reactions in direct sunlight.' },
    'SO2': { standard: 80, unit: 'µg/m³', desc: 'Sulphur dioxide emitted from thermal power plants, smelters, and heavy fuels.' },
    'CO': { standard: 2000, unit: 'µg/m³', desc: 'Carbon monoxide from incomplete combustion in engines and biomass.' },
  };

  // Mock 24-hour hourly trend profile derived from current base reading
  const trendPoints = [
    { hour: '00:00', val: Math.round(pm25Val * 0.92) },
    { hour: '03:00', val: Math.round(pm25Val * 1.05) },
    { hour: '06:00', val: Math.round(pm25Val * 1.28) },
    { hour: '09:00', val: Math.round(pm25Val * 1.35) },
    { hour: '12:00', val: Math.round(pm25Val * 0.88) },
    { hour: '15:00', val: Math.round(pm25Val * 0.75) },
    { hour: '18:00', val: Math.round(pm25Val * 1.15) },
    { hour: '21:00', val: Math.round(pm25Val * 1.22) },
    { hour: 'Now', val: Math.round(pm25Val), current: true },
  ];

  const maxTrend = Math.max(...trendPoints.map((p) => p.val), 150);

  return (
    <div className="view-container">
      {/* 1. LOCATION SELECTOR & DATA REFRESH BAR */}
      <section className="location-bar-panel" aria-label="Location and Telemetry Control">
        <div className="location-bar-content">
          <div className="loc-controls-group">
            <label htmlFor="city-select" className="loc-label">
              <MapPin size={16} className="loc-icon" />
              <span>{t(currentLang, 'select_location')}:</span>
            </label>
            <select
              id="city-select"
              className="city-dropdown"
              value={selectedLocation.name}
              onChange={handleCitySelect}
              aria-label="Select Indian city or region"
            >
              {INDIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.lat.toFixed(2)}°N, {c.lon.toFixed(2)}°E)
                </option>
              ))}
            </select>

            <button
              type="button"
              className="action-btn-secondary"
              onClick={handleUseGps}
              title="Detect current location via browser GPS"
            >
              <Compass size={14} />
              <span>{t(currentLang, 'use_gps')}</span>
            </button>

            <button
              type="button"
              className="action-btn-secondary"
              onClick={() => setShowManualCoords(!showManualCoords)}
              title="Enter custom coordinates"
            >
              <Sliders size={14} />
              <span>Custom Lat/Lon</span>
            </button>
          </div>

          <div className="refresh-status-group">
            <span className="last-updated-text">
              {t(currentLang, 'last_updated')}: {aq?.valid_time ? new Date(aq.valid_time).toLocaleTimeString() : 'Recent'}
            </span>
            <button
              type="button"
              className="refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh real-time data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{t(currentLang, 'refresh_telemetry')}</span>
            </button>
          </div>
        </div>

        {geoError && (
          <div className="geo-error-banner" role="alert">
            <AlertTriangle size={14} />
            <span>{geoError}</span>
          </div>
        )}

        {showManualCoords && (
          <form className="manual-coords-form" onSubmit={handleApplyManualCoords}>
            <input
              type="text"
              placeholder="Location name (optional)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="coord-input"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude (e.g. 28.61)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="coord-input"
              required
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude (e.g. 77.20)"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              className="coord-input"
              required
            />
            <button type="submit" className="action-btn-primary">Apply Coords</button>
          </form>
        )}
      </section>

      {/* 2. PROMINENT AIR QUALITY SUMMARY BANNER */}
      <section className="aqi-hero-banner" aria-label="Current Air Quality Summary">
        <div className="hero-main-card" style={{ borderColor: cat.color }}>
          <div className="hero-badge-strip">
            <span className="source-distinction-badge" title="Scientific attribution of data source">
              {aq?.status === 'LIVE' ? (
                <span className="badge-model">
                  {t(currentLang, 'live_model_badge')}
                </span>
              ) : (
                <span className="badge-demo">
                  {t(currentLang, 'simulated_badge')}
                </span>
              )}
            </span>
            <span className="cpcb-status-pill" title="Official CPCB physical station status">
              CPCB GROUND STATION: <b style={{ color: 'var(--accent-amber)' }}>NEEDS CONFIGURATION</b>
            </span>
          </div>

          <div className="hero-data-flex">
            <div className="hero-val-block">
              <span className="hero-val-title">Indicative PM2.5 Concentration</span>
              <div className="hero-big-number" style={{ color: cat.color }}>
                {pm25Val}
                <span className="unit-label">µg/m³</span>
              </div>
              <div className="category-pill" style={{ backgroundColor: cat.bg, color: cat.color, borderColor: cat.color }}>
                {t(currentLang, `cat_${cat.label.toLowerCase().replace(' ', '_')}`) || cat.label}
              </div>
            </div>

            <div className="hero-meta-block">
              <h3>{selectedLocation.name}</h3>
              <p className="hero-desc">{cat.desc}</p>
              <div className="meta-grid">
                <div>
                  <small>Provider</small>
                  <b>{aq?.provider || 'Open-Meteo Air Quality'}</b>
                </div>
                <div>
                  <small>Scientific Attribution</small>
                  <b>Copernicus Atmosphere Monitoring (CAMS)</b>
                </div>
                <div>
                  <small>Model Timestamp</small>
                  <b>{aq?.valid_time ? new Date(aq.valid_time).toLocaleString() : 'Live'}</b>
                </div>
                <div>
                  <small>Grid Coordinates</small>
                  <b>{selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E</b>
                </div>
              </div>
            </div>
          </div>

          <div className="scientific-caveat-footnote">
            <Info size={14} />
            <span>
              <b>Data Transparency Note:</b> Readings are derived from Copernicus CAMS global atmospheric model reanalysis at ~10 km spatial resolution. Modelled concentrations are not certified CPCB physical ground stations.
            </span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE POLLUTANTS GRID */}
      <section className="pollutants-section" aria-label="Observed Pollutants">
        <div className="section-header">
          <div>
            <h3>Interactive Pollutant Composition</h3>
            <p className="section-sub">Select any chemical species to inspect concentration vs. CPCB 24-hr standards</p>
          </div>
        </div>

        <div className="pollutants-grid">
          {Object.entries(pollutantDetails).map(([key, details]) => {
            const val = aq?.pollutants?.[key] ?? (key === 'PM2.5' ? pm25Val : 45.0);
            const ratio = Math.round((val / details.standard) * 100);
            const isExceeded = val > details.standard;
            const isSelected = activePollutant === key;

            return (
              <div
                key={key}
                className={`pollutant-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setActivePollutant(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePollutant(key); }}
                aria-pressed={isSelected}
              >
                <div className="pol-card-header">
                  <span className="pol-name">{key}</span>
                  <span className={`pol-ratio-badge ${isExceeded ? 'exceeded' : 'safe'}`}>
                    {ratio}% of std
                  </span>
                </div>
                <div className="pol-val">
                  {val}{' '}
                  <span className="pol-unit">{details.unit}</span>
                </div>
                <div className="pol-progress-track">
                  <div
                    className="pol-progress-fill"
                    style={{
                      width: `${Math.min(ratio, 100)}%`,
                      backgroundColor: isExceeded ? 'var(--accent-coral)' : 'var(--accent-cyan)',
                    }}
                  />
                </div>
                <small className="pol-threshold">CPCB Std: {details.standard} {details.unit}</small>
              </div>
            );
          })}
        </div>

        {activePollutant && pollutantDetails[activePollutant] && (
          <div className="active-pol-details-panel">
            <Sparkles size={16} color="var(--accent-cyan)" />
            <div>
              <b>{activePollutant} Atmospheric Behavior:</b> {pollutantDetails[activePollutant].desc}{' '}
              {aq?.pollutants?.[activePollutant] && aq.pollutants[activePollutant] > pollutantDetails[activePollutant].standard
                ? `Currently elevated at ${(aq.pollutants[activePollutant] / pollutantDetails[activePollutant].standard).toFixed(1)}× standard limit.`
                : 'Within standard ambient limits.'}
            </div>
          </div>
        )}
      </section>

      {/* 4. 24-HOUR TREND CHART & 5. INTERACTIVE LOCATION MAP */}
      <div className="columns" style={{ gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginTop: '24px' }}>
        {/* Trend Chart */}
        <section className="panel" aria-label="Hourly Air Quality Trend">
          <div className="panel-head">
            <div>
              <small>TEMPORAL PROFILE</small>
              <h3>24-Hour Diurnal Projection Profile</h3>
            </div>
            <span className="pill" style={{ background: 'var(--badge-demo-bg)', color: 'var(--badge-demo-text)' }}>
              Demonstration Diurnal Projection
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Normalized diurnal rush-hour projection curve anchored to current {selectedLocation.name} baseline PM2.5 ({pm25Val} µg/m³). Real hourly historical measurements require statutory CPCB station access.
          </p>

          <div className="trend-chart-container" style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
            {trendPoints.map((p, idx) => {
              const heightPct = Math.round((p.val / maxTrend) * 160);
              const pCat = getAqiCategory(p.val);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{p.val}</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}px`,
                      backgroundColor: p.current ? pCat.color : 'rgba(6, 182, 212, 0.4)',
                      borderRadius: '4px 4px 0 0',
                      border: p.current ? '2px solid #ffffff' : 'none',
                      boxShadow: p.current ? `0 0 10px ${pCat.color}` : 'none',
                      transition: 'height 0.4s ease',
                    }}
                    title={`${p.hour}: ${p.val} µg/m³ (${pCat.label})`}
                  />
                  <span style={{ fontSize: '11px', color: p.current ? 'var(--accent-cyan)' : 'var(--text-muted)', marginTop: '8px', fontWeight: p.current ? 700 : 400 }}>
                    {p.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>CPCB 24h Threshold: 60 µg/m³</span>
            <span>Diurnal peak typically occurs during dawn surface temperature inversion</span>
          </div>
        </section>

        {/* Embedded Interactive Leaflet Map */}
        <section className="panel" aria-label="Interactive Geographic Location Map">
          <div className="panel-head">
            <div>
              <small>GEOSPATIAL ANCHOR</small>
              <h3>Location & Model Grid</h3>
            </div>
            <button
              type="button"
              className="action-btn-secondary"
              onClick={() => onNavigate('vayu')}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Open Full Map <ArrowRight size={12} />
            </button>
          </div>

          <div
            ref={mapContainerRef}
            id="pran-overview-map"
            style={{
              height: '240px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-medium)',
              marginTop: '10px',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>&bull; Circle indicates 5 km CAMS model grid cell</span>
            <span style={{ color: 'var(--accent-cyan)' }}>OpenStreetMap &copy; tiles</span>
          </div>
        </section>
      </div>

      {/* 6. WEATHER CONTEXT & 7. HEALTH GUIDANCE */}
      <div className="columns" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Weather Context */}
        <section className="panel" aria-label="Atmospheric and Meteorological Context">
          <div className="panel-head">
            <div>
              <small>METEOROLOGY</small>
              <h3>Wind & Dispersion Conditions</h3>
            </div>
            <span className="pill">Open-Meteo Forecast</span>
          </div>

          <div className="weather-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '12px' }}>
            <div className="weather-box" style={{ background: 'var(--bg-surface-0)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Thermometer size={16} color="var(--accent-amber)" /> Temperature
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
                {weather?.temperature_c ?? 24.2}°C
              </div>
              <small style={{ color: 'var(--text-muted)' }}>Surface ambient (2m)</small>
            </div>

            <div className="weather-box" style={{ background: 'var(--bg-surface-0)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Droplets size={16} color="var(--accent-cyan)" /> Humidity
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
                {weather?.relative_humidity_percent ?? 78}%
              </div>
              <small style={{ color: 'var(--text-muted)' }}>Relative humidity</small>
            </div>

            <div className="weather-box" style={{ background: 'var(--bg-surface-0)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Wind size={16} color="var(--accent-emerald)" /> Wind Velocity
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
                {weather?.wind_speed_kmh ?? 8.5} <span style={{ fontSize: '14px' }}>km/h</span>
              </div>
              <small style={{ color: 'var(--text-muted)' }}>Low dispersion velocity</small>
            </div>

            <div className="weather-box" style={{ background: 'var(--bg-surface-0)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Compass size={16} color="var(--accent-cyan)" /> Direction
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
                {weather?.wind_compass ?? 'ENE'}{' '}
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({weather?.wind_direction_deg ?? 70}°)</span>
              </div>
              <small style={{ color: 'var(--text-muted)' }}>Bearing direction</small>
            </div>
          </div>
        </section>

        {/* Health Guidance */}
        <section className="panel" aria-label="Public Health Guidance">
          <div className="panel-head">
            <div>
              <small>PUBLIC ADVISORY</small>
              <h3>{t(currentLang, 'health_advisory')}</h3>
            </div>
            <span className="pill" style={{ color: cat.color, borderColor: cat.color }}>
              Category: {cat.label}
            </span>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: cat.bg, borderRadius: '8px', border: `1px solid ${cat.color}` }}>
              <b style={{ color: cat.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} /> Operational Health Guidance:
              </b>
              <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-primary)' }}>
                {cat.desc}
              </p>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p><b>General Population:</b> {pm25Val > 120 ? 'Limit prolonged outdoor exertion. Wear N95/FFP2 masks in traffic corridors.' : 'Normal outdoor activity permitted with awareness.'}</p>
              <p style={{ marginTop: '6px' }}><b>Children & Elderly:</b> {pm25Val > 90 ? 'Keep indoor spaces ventilated with HEPA filtration; avoid intense outdoor sports.' : 'Sensitive individuals should monitor symptoms.'}</p>
              <p style={{ marginTop: '6px' }}><b>Outdoor Workers:</b> Provide staggered rest intervals away from heavy traffic emissions.</p>
            </div>
          </div>
        </section>
      </div>

      {/* 8. RECOMMENDED ACTIONS & 9. LINKS TO MODULES */}
      <section className="panel" style={{ marginTop: '20px' }} aria-label="Recommended Mitigation Actions">
        <div className="panel-head">
          <div>
            <small>DECISION SUPPORT</small>
            <h3>Human-Reviewed Mitigation Actions</h3>
          </div>
          <span className="pill">Non-Coercive · Advisory</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Deterministic action proposals for administrative review based on current ambient readings.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-surface-0)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <b style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Mechanical Dust Suppression</b>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Dispatch water misting tankers along major arterial roads within {selectedLocation.name}.
            </p>
            <button
              type="button"
              className="action-btn-secondary"
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
              onClick={() => {
                onProposeAction({
                  sector: 'Dust & Road Maintenance',
                  action: 'Deploy anti-smog misting gun on core arterial route',
                  reason: `Ambient PM10 and PM2.5 elevated (${pm25Val} µg/m³) in ${selectedLocation.name}`,
                });
                onNavigate('review');
              }}
            >
              Propose to Action Review <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-0)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <b style={{ color: 'var(--text-primary)', fontSize: '14px' }}>School & Sports Advisory</b>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recommend moving strenuous outdoor physical education to indoor multipurpose halls.
            </p>
            <button
              type="button"
              className="action-btn-secondary"
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
              onClick={() => {
                onProposeAction({
                  sector: 'Education & Schools',
                  action: 'Reschedule outdoor athletics to indoor fitness sessions',
                  reason: `PM2.5 concentration is ${pm25Val} µg/m³ (${cat.label})`,
                });
                onNavigate('review');
              }}
            >
              Propose to Action Review <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-0)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <b style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Construction Dust Audit</b>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Verify green netting and active perimeter wetting across registered infrastructure sites.
            </p>
            <button
              type="button"
              className="action-btn-secondary"
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
              onClick={() => {
                onProposeAction({
                  sector: 'Construction & Demolition',
                  action: 'Field inspection of perimeter dust barriers and wheel washing',
                  reason: `Local air quality degraded (${cat.label})`,
                });
                onNavigate('review');
              }}
            >
              Propose to Action Review <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            Deep-dive modules:
          </span>
          <button type="button" className="btn-link" onClick={() => onNavigate('vayu')}>
            Geographic Air Quality Map &rarr;
          </button>
          <button type="button" className="btn-link" onClick={() => onNavigate('whybad')}>
            Pollution Source Analysis &rarr;
          </button>
          <button type="button" className="btn-link" onClick={() => onNavigate('downwind')}>
            Wind & Weather &rarr;
          </button>
          <button type="button" className="btn-link" onClick={() => onNavigate('sectors')}>
            Sector Action Plans &rarr;
          </button>
          <button type="button" className="btn-link" onClick={() => onNavigate('ledger')}>
            Action History &rarr;
          </button>
          <button type="button" className="btn-link" onClick={() => onNavigate('sources')}>
            Data & Evidence &rarr;
          </button>
        </div>
      </section>
    </div>
  );
}
