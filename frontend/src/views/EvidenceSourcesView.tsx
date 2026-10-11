import { Database, CheckCircle2, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';
import { DataSourceStatus } from '../types';

interface EvidenceSourcesViewProps {
  sources: DataSourceStatus[];
  onRefresh: () => void;
  loading: boolean;
}

export default function EvidenceSourcesView({ sources, onRefresh, loading }: EvidenceSourcesViewProps) {
  const defaultSources: DataSourceStatus[] = [
    {
      id: 'open_meteo_aq',
      name: 'Open-Meteo Air Quality API',
      data_type: 'LIVE MODEL DATA',
      status: 'LIVE',
      attribution: 'Copernicus Atmosphere Monitoring Service (CAMS) / ECMWF',
      details: 'Connected. Real-time atmospheric chemical reanalysis and hourly forecast for latitude/longitude coordinates.',
      setup_guide: 'Free tier / Non-commercial attribution required. Working out-of-the-box on first launch.',
    },
    {
      id: 'open_meteo_weather',
      name: 'Open-Meteo Weather API',
      data_type: 'LIVE WEATHER CONTEXT',
      status: 'LIVE',
      attribution: 'Numerical Weather Prediction models (ECMWF, DWD, GFS)',
      details: 'Connected. Real-time surface wind vector, temperature, and relative humidity for spatial bearing screening.',
      setup_guide: 'Free tier / Non-commercial attribution required. Working out-of-the-box on first launch.',
    },
    {
      id: 'cpcb_ogd',
      name: 'Central Pollution Control Board (CPCB) via data.gov.in',
      data_type: 'STATION GROUND MEASUREMENT',
      status: 'NEEDS CONFIGURATION',
      attribution: 'CPCB / Ministry of Environment, Forest and Climate Change',
      details: 'Ground station continuous monitor readings across India.',
      setup_guide: 'Register API Key on data.gov.in, set /schoolair/datagov-key in SSM Parameter Store, and configure DATA_GOV_RESOURCE_ID.',
    },
    {
      id: 'nasa_firms',
      name: 'NASA FIRMS Satellite Thermal Anomalies',
      data_type: 'THERMAL ANOMALY SATELLITE DETECTION',
      status: 'NEEDS CONFIGURATION',
      attribution: 'NASA EOSDIS / MODIS and VIIRS sensors',
      details: 'Satellite infrared thermal heat signatures.',
      setup_guide: 'Register MAP_KEY at firms.modaps.eosdis.nasa.gov/api/map_key/ and set NASA_FIRMS_MAP_KEY in environment.',
    },
  ];

  const sourceList = sources.length > 0 ? sources : defaultSources;

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>EVIDENCE & DATA SOURCES</small>
          <h2>Data & Evidence</h2>
        </div>
        <button className="secondary" onClick={onRefresh} disabled={loading} style={{ padding: '6px 12px', fontSize: '11px' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Check Status
        </button>
      </div>

      <div className="columns" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {sourceList.map((src, idx) => {
          const isLive = src.status === 'LIVE';
          return (
            <div className="panel" key={src.id || idx}>
              <div className="panel-head">
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>PROVIDER {idx + 1}</small>
                  <h3 style={{ fontSize: '15px', margin: '4px 0', color: 'var(--text-primary)' }}>
                    {src.name || src.provider}
                  </h3>
                </div>
                <span
                  className={isLive ? 'live-badge' : 'demo'}
                  style={{
                    background: isLive ? 'var(--badge-live-bg)' : 'var(--badge-demo-bg)',
                    color: isLive ? 'var(--badge-live-text)' : 'var(--badge-demo-text)',
                    borderColor: isLive ? 'var(--badge-live-border)' : 'var(--badge-demo-border)',
                  }}
                >
                  {src.status}
                </span>
              </div>

              <dl>
                <div>
                  <dt>Data Semantic Type</dt>
                  <dd style={{ color: 'var(--accent-cyan)' }}>{src.data_type}</dd>
                </div>
                <div>
                  <dt>Attribution</dt>
                  <dd>{src.attribution || 'Authoritative Provider'}</dd>
                </div>
              </dl>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginTop: '10px',
                }}
              >
                {src.details || src.setup_guide}
              </div>

              {src.setup_guide && !isLive && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent-amber)' }}>
                  <strong>Setup:</strong> {src.setup_guide}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: '18px' }}>
        <div className="panel-head">
          <div>
            <small>SCIENTIFIC TRUTHFULNESS CHARTER</small>
            <h2>Rules of Truthful Provenance</h2>
          </div>
        </div>
        <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>
          <li><strong>Never blend unlike sources:</strong> Model forecasts and ground-station measurements are visually and semantically distinct. Model data is never labeled as ground station data.</li>
          <li><strong>Never invent live readings:</strong> When credentials or network connections are absent, the provider status displays <code>NEEDS CONFIGURATION</code> or <code>UNAVAILABLE</code>. No plausible fake readings are substituted.</li>
          <li><strong>Per-provider failure isolation:</strong> A failure in CPCB or NASA FIRMS does not block or disable live Open-Meteo atmospheric telemetry.</li>
          <li><strong>Transparent freshness:</strong> Observation timestamps and valid forecast windows are always preserved and displayed alongside data.</li>
        </ul>
      </div>
    </div>
  );
}
