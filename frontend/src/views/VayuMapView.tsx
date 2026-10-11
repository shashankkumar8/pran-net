import { useState } from 'react';
import { Compass, Wind, Filter, MapPin } from 'lucide-react';
import { LiveTelemetry } from '../types';

interface VayuMapViewProps {
  telemetry: LiveTelemetry | null;
  stations: any[];
}

export default function VayuMapView({ telemetry, stations }: VayuMapViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  const weather = telemetry?.weather;
  const windDeg = weather?.wind_direction_deg ?? 80;
  const windSpeed = weather?.wind_speed_kmh ?? 7.1;
  const windCompass = weather?.wind_compass ?? 'ENE';

  const defaultStations = [
    { id: 'st-1', name: 'Anand Vihar (DPCC)', lat: 28.6469, lon: 77.3160, cat: 'Severe', pm25: 282, dist: 2.1, status: 'Active' },
    { id: 'st-2', name: 'Patparganj (DPCC)', lat: 28.6237, lon: 77.2872, cat: 'Very Poor', pm25: 195, dist: 3.4, status: 'Active' },
    { id: 'st-3', name: 'Vivek Vihar (DPCC)', lat: 28.6723, lon: 77.3152, cat: 'Very Poor', pm25: 188, dist: 4.8, status: 'Active' },
    { id: 'st-4', name: 'Lodhi Road (IMD)', lat: 28.5918, lon: 77.2273, cat: 'Moderate', pm25: 68, dist: 5.2, status: 'Active' },
    { id: 'st-5', name: 'Pusa Road (DPCC)', lat: 28.6396, lon: 77.1462, cat: 'Moderate', pm25: 74, dist: 6.9, status: 'Active' },
  ];

  const stationList = stations.length > 0
    ? stations.map((s, idx) => ({
        id: s.station_id || `st-${idx}`,
        name: s.station_name,
        dist: s.distance_km || (2.0 + idx * 1.5),
        cat: s.category || 'Moderate',
        pm25: s.pm25 || 85,
        status: s.freshness || 'Active',
      }))
    : defaultStations;

  const filteredStations = selectedCategory === 'all'
    ? stationList
    : stationList.filter((s) => s.cat.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>GEOGRAPHIC SPATIAL INTELLIGENCE</small>
          <h2>VAYU · Sensor & Sector Map</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <option value="all">All AQI Categories</option>
            <option value="severe">Severe</option>
            <option value="very poor">Very Poor</option>
            <option value="moderate">Moderate</option>
          </select>
        </div>
      </div>

      <div className="columns" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        {/* Interactive Spatial Grid / SVG Radar */}
        <div className="panel" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={15} color="var(--accent-cyan)" /> Centered at Delhi Central (28.61°N, 77.21°E)
            </span>
            <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={14} /> Wind: {windCompass} ({windDeg}°) at {windSpeed} km/h
            </div>
          </div>

          <div
            className="spatial-canvas"
            style={{
              flex: 1,
              position: 'relative',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'radial-gradient(circle at center, var(--bg-surface-1) 0%, var(--bg-surface-0) 80%)',
              overflow: 'hidden',
              minHeight: '340px',
            }}
          >
            {/* Concentric Range Rings */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
              <circle cx="50%" cy="50%" r="28%" fill="none" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <circle cx="50%" cy="50%" r="44%" fill="none" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="var(--border-subtle)" strokeWidth="0.5" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="var(--border-subtle)" strokeWidth="0.5" />
            </svg>

            {/* Live Wind Vector Arrow Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${windDeg}deg)`,
                pointerEvents: 'none',
                transition: 'transform 0.5s ease',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--accent-cyan))',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '-4px',
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '8px solid var(--accent-cyan)',
                  }}
                />
              </div>
            </div>

            {/* Central Node */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                border: '3px solid var(--bg-surface-0)',
                boxShadow: '0 0 12px var(--accent-cyan)',
                zIndex: 10,
              }}
              title="Reference Origin: Delhi-NCR Operations Core"
            />

            {/* Render Station Coordinates on Radar */}
            {filteredStations.map((st, idx) => {
              // Position nodes in mock coordinate space
              const angles = [45, 120, 210, 290, 340];
              const radii = [32, 42, 26, 38, 46];
              const angle = (angles[idx % angles.length] * Math.PI) / 180;
              const radius = radii[idx % radii.length];
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              const isSevere = st.cat.toLowerCase().includes('severe');
              const isVeryPoor = st.cat.toLowerCase().includes('very poor');
              const badgeColor = isSevere
                ? 'var(--accent-coral)'
                : isVeryPoor
                ? 'var(--accent-amber)'
                : 'var(--accent-emerald)';

              const isSelected = activeStationId === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStationId(st.id)}
                  style={{
                    position: 'absolute',
                    top: `${y}%`,
                    left: `${x}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <div
                    style={{
                      width: isSelected ? '18px' : '12px',
                      height: isSelected ? '18px' : '12px',
                      borderRadius: '50%',
                      background: badgeColor,
                      border: isSelected ? '2px solid white' : '2px solid var(--bg-surface-0)',
                      boxShadow: `0 0 8px ${badgeColor}`,
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      background: 'var(--bg-surface-1)',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.name.split(' ')[0]} ({st.dist} km)
                  </span>
                </div>
              );
            })}
          </div>
          <p className="footnote" style={{ marginTop: '8px' }}>
            Map coordinates illustrate relative sensor proximities and wind vectors. Accessible table alternative provided adjacent.
          </p>
        </div>

        {/* Station Directory & Details Table */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>SPATIAL TELEMETRY</small>
              <h2>Monitored Stations</h2>
            </div>
            <label className="pill">{filteredStations.length} reporting</label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Distance</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      background: activeStationId === s.id ? 'var(--accent-cyan-surface)' : 'transparent',
                    }}
                  >
                    <td>
                      <b style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--accent-cyan)" /> {s.name}
                      </b>
                    </td>
                    <td>{s.dist} km</td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          fontSize: '9px',
                          color: s.cat.toLowerCase().includes('severe')
                            ? 'var(--accent-coral)'
                            : s.cat.toLowerCase().includes('very poor')
                            ? 'var(--accent-amber)'
                            : 'var(--accent-emerald)',
                        }}
                      >
                        {s.cat}
                      </span>
                    </td>
                    <td>
                      <button
                        className="secondary"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => setActiveStationId(s.id)}
                      >
                        Focus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeStationId && (
            <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-surface-1)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>STATION INSPECTION</small>
              <h4 style={{ margin: '4px 0', fontSize: '13px' }}>
                {filteredStations.find((s) => s.id === activeStationId)?.name}
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Reporting distance: {filteredStations.find((s) => s.id === activeStationId)?.dist} km · Category: {filteredStations.find((s) => s.id === activeStationId)?.cat}.
                Observational data feeds conservative worst-fresh selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
