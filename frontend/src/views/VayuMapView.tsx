import { useState, useEffect, useRef } from 'react';
import { Compass, Wind, Filter, MapPin, Layers, Info, CheckCircle2, AlertTriangle, Eye, Table } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LiveTelemetry } from '../types';

interface VayuMapViewProps {
  telemetry: LiveTelemetry | null;
  stations: any[];
}

interface MapStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cat: string;
  pm25: number;
  dist: number;
  type: 'MODEL_GRID' | 'MONITORING_POINT';
  provider: string;
}

const CAT_COLORS: Record<string, string> = {
  Good: '#10B981',
  Satisfactory: '#84CC16',
  Moderate: '#F59E0B',
  Poor: '#F97316',
  'Very Poor': '#EF4444',
  Severe: '#881337',
};

export default function VayuMapView({ telemetry, stations }: VayuMapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStationId, setActiveStationId] = useState<string | null>('st-1');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const weather = telemetry?.weather;
  const windDeg = weather?.wind_direction_deg ?? 80;
  const windSpeed = weather?.wind_speed_kmh ?? 7.1;
  const windCompass = weather?.wind_compass ?? 'ENE';
  const centerLat = telemetry?.location.lat ?? 28.6139;
  const centerLon = telemetry?.location.lon ?? 77.2090;

  const defaultLocations: MapStation[] = [
    { id: 'st-1', name: 'Delhi-NCR Central Core', lat: 28.6139, lon: 77.2090, cat: 'Moderate', pm25: 69.2, dist: 0.0, type: 'MODEL_GRID', provider: 'CAMS / Open-Meteo' },
    { id: 'st-2', name: 'Anand Vihar East Sector', lat: 28.6469, lon: 77.3160, cat: 'Severe', pm25: 282.0, dist: 11.2, type: 'MONITORING_POINT', provider: 'DPCC (Context Target)' },
    { id: 'st-3', name: 'Patparganj Industrial Cluster', lat: 28.6237, lon: 77.2872, cat: 'Very Poor', pm25: 195.0, dist: 8.4, type: 'MONITORING_POINT', provider: 'DPCC (Context Target)' },
    { id: 'st-4', name: 'Vivek Vihar Boundary', lat: 28.6723, lon: 77.3152, cat: 'Very Poor', pm25: 188.0, dist: 13.8, type: 'MONITORING_POINT', provider: 'DPCC (Context Target)' },
    { id: 'st-5', name: 'Lodhi Road Clean Baseline', lat: 28.5918, lon: 77.2273, cat: 'Moderate', pm25: 68.0, dist: 3.2, type: 'MONITORING_POINT', provider: 'IMD Station Model' },
    { id: 'st-6', name: 'Pusa Agricultural Campus', lat: 28.6396, lon: 77.1462, cat: 'Moderate', pm25: 74.0, dist: 7.1, type: 'MONITORING_POINT', provider: 'DPCC Station Model' },
  ];

  const mapStations: MapStation[] = stations.length > 0
    ? stations.map((s, idx) => ({
        id: s.station_id || `st-${idx}`,
        name: s.station_name,
        lat: centerLat + (idx === 0 ? 0 : (idx % 2 === 0 ? 0.03 : -0.03) * idx),
        lon: centerLon + (idx === 0 ? 0 : (idx % 3 === 0 ? 0.04 : -0.04) * idx),
        cat: s.category || 'Moderate',
        pm25: s.pm25 || 85,
        dist: s.distance_km || (2.0 + idx * 1.5),
        type: 'MONITORING_POINT',
        provider: 'Station Context',
      }))
    : defaultLocations;

  const filteredStations = selectedCategory === 'all'
    ? mapStations
    : mapStations.filter((s) => s.cat.toLowerCase() === selectedCategory.toLowerCase());

  const activeStation = mapStations.find((s) => s.id === activeStationId) || mapStations[0];

  // Leaflet Map Initialization & Marker Synchronization
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 11,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([centerLat, centerLon], 11);
    }

    const map = leafletMapRef.current;

    // Remove existing markers & overlays
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Render stations & model grid overlays
    filteredStations.forEach((st) => {
      const color = CAT_COLORS[st.cat] || '#06B6D4';
      const isSelected = st.id === activeStationId;

      const html = `
        <div style="background-color: ${color}; width: ${isSelected ? 26 : 18}px; height: ${isSelected ? 26 : 18}px; border-radius: 50%; border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.8)'}; box-shadow: 0 0 12px ${color}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
        </div>
      `;

      const icon = L.divIcon({
        className: 'vayu-station-marker',
        html,
        iconSize: [isSelected ? 26 : 18, isSelected ? 26 : 18],
        iconAnchor: [isSelected ? 13 : 9, isSelected ? 13 : 9],
      });

      const marker = L.marker([st.lat, st.lon], { icon }).addTo(map);

      marker.on('click', () => {
        setActiveStationId(st.id);
      });

      marker.bindPopup(`
        <div style="font-family: system-ui; font-size: 13px;">
          <b style="color: ${color};">${st.name}</b><br/>
          <span>PM2.5: ${st.pm25} µg/m³ (${st.cat})</span><br/>
          <span style="font-size: 11px; color: #64748b;">${st.type === 'MODEL_GRID' ? 'CAMS Model Grid' : 'Monitoring Target'}</span>
        </div>
      `);

      // Add grid boundary for model cells
      if (st.type === 'MODEL_GRID') {
        L.circle([st.lat, st.lon], {
          color,
          fillColor: color,
          fillOpacity: 0.1,
          radius: 6000,
          weight: 1.5,
          dashArray: '3, 6',
        }).addTo(map);
      }
    });

  }, [filteredStations, activeStationId, centerLat, centerLon, viewMode]);

  return (
    <div className="view-container">
      {/* Header Bar */}
      <div className="panel-head" style={{ marginBottom: '16px' }}>
        <div>
          <small>GEOSPATIAL AIR INTELLIGENCE</small>
          <h2>Geographic Air Quality Map</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              type="button"
              className={`theme-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              style={{ borderRadius: 0, padding: '6px 12px', fontSize: '12px' }}
            >
              <MapPin size={13} /> Interactive Map
            </button>
            <button
              type="button"
              className={`theme-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              style={{ borderRadius: 0, padding: '6px 12px', fontSize: '12px' }}
            >
              <Table size={13} /> Accessible Table
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              aria-label="Filter by AQI Category"
            >
              <option value="all">All AQI Categories</option>
              <option value="severe">Severe</option>
              <option value="very poor">Very Poor</option>
              <option value="moderate">Moderate</option>
              <option value="good">Good</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="columns" style={{ gridTemplateColumns: '1.25fr 0.75fr', gap: '20px' }}>
          {/* Leaflet Map Panel */}
          <div className="panel" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={15} color="var(--accent-cyan)" /> Centered at {centerLat.toFixed(2)}°N, {centerLon.toFixed(2)}°E
              </span>
              <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wind size={14} /> Wind: {windCompass} ({windDeg}°) at {windSpeed} km/h
              </div>
            </div>

            <div
              ref={mapContainerRef}
              id="vayu-leaflet-map"
              style={{
                flex: 1,
                minHeight: '440px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
              }}
            />

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>AQI Legend:</span>
              {Object.entries(CAT_COLORS).map(([cName, cColor]) => (
                <div key={cName} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cColor }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{cName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Station & Model Detail Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <small>OBSERVATION TARGET</small>
                  <h3>{activeStation.name}</h3>
                </div>
                <span
                  className="pill"
                  style={{
                    backgroundColor: `${CAT_COLORS[activeStation.cat]}20`,
                    borderColor: CAT_COLORS[activeStation.cat],
                    color: CAT_COLORS[activeStation.cat],
                  }}
                >
                  {activeStation.cat}
                </span>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>PM2.5 Reading</span>
                  <b style={{ color: CAT_COLORS[activeStation.cat], fontSize: '16px' }}>
                    {activeStation.pm25} µg/m³
                  </b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Distance from Core</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{activeStation.dist} km</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Coordinates</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{activeStation.lat.toFixed(4)}°N, {activeStation.lon.toFixed(4)}°E</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Data Provenance</span>
                  <b style={{ color: 'var(--accent-cyan)', fontSize: '13px' }}>{activeStation.provider}</b>
                </div>
              </div>
            </div>

            {/* List of stations for quick selection */}
            <div className="panel" style={{ flex: 1, overflowY: 'auto' }}>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                SPATIAL SAMPLING NODES ({filteredStations.length})
              </small>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredStations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStationId(st.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: activeStationId === st.id ? 'var(--bg-surface-2)' : 'var(--bg-surface-0)',
                      border: `1px solid ${activeStationId === st.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{st.dist} km away &bull; {st.provider}</small>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: `${CAT_COLORS[st.cat]}20`,
                        color: CAT_COLORS[st.cat],
                      }}
                    >
                      {st.pm25}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>ACCESSIBLE TABULAR FORMAT</small>
              <h3>Monitoring Target Matrix</h3>
            </div>
          </div>
          <table className="ledger-table" style={{ width: '100%', marginTop: '14px' }}>
            <thead>
              <tr>
                <th>Node Name</th>
                <th>Category</th>
                <th>PM2.5 (µg/m³)</th>
                <th>Distance</th>
                <th>Coordinates</th>
                <th>Provider Classification</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((st) => (
                <tr key={st.id}>
                  <td><b>{st.name}</b></td>
                  <td>
                    <span style={{ color: CAT_COLORS[st.cat], fontWeight: 700 }}>{st.cat}</span>
                  </td>
                  <td>{st.pm25} µg/m³</td>
                  <td>{st.dist} km</td>
                  <td>{st.lat.toFixed(4)}°N, {st.lon.toFixed(4)}°E</td>
                  <td>{st.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
