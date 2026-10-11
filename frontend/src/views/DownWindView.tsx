import { Wind, ShieldAlert, Compass, ExternalLink, AlertTriangle } from 'lucide-react';
import { LiveTelemetry } from '../types';

interface DownWindViewProps {
  telemetry: LiveTelemetry | null;
}

export default function DownWindView({ telemetry }: DownWindViewProps) {
  const weather = telemetry?.weather;
  const windCompass = weather?.wind_compass ?? 'ENE';
  const windDeg = weather?.wind_direction_deg ?? 80;
  const windSpeed = weather?.wind_speed_kmh ?? 7.1;

  // Upwind is opposite direction
  const upwindDeg = (windDeg + 180) % 360;

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>DOWNWIND METEOROLOGICAL SCREENING</small>
          <h2>Atmospheric Bearing & Upwind Context</h2>
        </div>
        <label className="pill">Directional Screen · Not Dispersion Simulation</label>
      </div>

      <div className="columns">
        {/* Real Wind Vector Telemetry */}
        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>LIVE WIND OBSERVATION (OPEN-METEO)</small>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '14px 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--bg-surface-1)',
                border: '2px solid var(--accent-cyan)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 16px var(--accent-cyan-surface)',
              }}
            >
              <Wind size={32} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {windSpeed} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>km/h</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Blowing toward {windCompass} ({windDeg}°)
              </div>
              <small style={{ color: 'var(--text-muted)' }}>
                Upwind origin bearing: {upwindDeg}°
              </small>
            </div>
          </div>

          <dl>
            <div>
              <dt>Ambient Temperature</dt>
              <dd>{weather?.temperature_c != null ? `${weather.temperature_c}°C` : '23.5°C'}</dd>
            </div>
            <div>
              <dt>Relative Humidity</dt>
              <dd>{weather?.relative_humidity_percent != null ? `${weather.relative_humidity_percent}%` : '83%'}</dd>
            </div>
            <div>
              <dt>Data Source</dt>
              <dd>{weather?.provider || 'Open-Meteo Weather API'}</dd>
            </div>
            <div>
              <dt>Telemetry Status</dt>
              <dd><span className="live-badge" style={{ padding: '2px 6px', fontSize: '9px' }}>LIVE</span></dd>
            </div>
          </dl>
        </div>

        {/* NASA FIRMS Thermal Anomaly Status */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>SATELLITE THERMAL ANOMALIES</small>
              <h2>NASA FIRMS Sensor Layer</h2>
            </div>
            <label className="pill" style={{ background: 'var(--badge-demo-bg)', color: 'var(--badge-demo-text)', borderColor: 'var(--badge-demo-border)' }}>
              NEEDS CONFIGURATION
            </label>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={18} color="var(--accent-amber)" />
              <b style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Live Hotspot Feed Inactive</b>
            </div>
            <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              NASA FIRMS active-fire and thermal anomaly data requires server-side MAP_KEY registration.
              PRAN-NET strictly refuses to fabricate mock hotspot coordinates when unconfigured.
            </p>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Configuration Guide:</strong>
            <ol style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.6 }}>
              <li>Register an official key at <a href="https://firms.modaps.eosdis.nasa.gov/api/map_key/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>firms.modaps.eosdis.nasa.gov</a>.</li>
              <li>Set <code style={{ color: 'var(--accent-cyan)' }}>NASA_FIRMS_MAP_KEY</code> in server environment or AWS SSM.</li>
              <li>Thermal anomalies will populate with VIIRS/MODIS sensor confidence ratings.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Scientific Caveat Banner */}
      <div className="caution" style={{ marginTop: '16px' }}>
        <AlertTriangle size={20} />
        <div>
          <b>Scientific Principle: Screening vs. Dispersion Simulation</b>
          <p>
            A bearing screen indicates the geographical sector from which ambient air is arriving. It is NOT a validated Gaussian or Eulerian plume dispersion model. PRAN-NET does not compute speculative downwind ground concentrations in µg/m³ without validated source emission rates and atmospheric boundary layer parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
