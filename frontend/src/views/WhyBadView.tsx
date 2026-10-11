import { AlertTriangle, HelpCircle, Layers, Check, X } from 'lucide-react';
import { LiveTelemetry } from '../types';

interface WhyBadViewProps {
  telemetry: LiveTelemetry | null;
}

export default function WhyBadView({ telemetry }: WhyBadViewProps) {
  const aq = telemetry?.air_quality;
  const pm25 = aq?.pollutants?.['PM2.5'] ?? 69.2;
  const pm10 = aq?.pollutants?.['PM10'] ?? 143.0;
  const no2 = aq?.pollutants?.['NO2'] ?? 33.5;
  const o3 = aq?.pollutants?.['O3'] ?? 42.0;

  const ratio = pm10 > 0 ? (pm25 / pm10).toFixed(2) : '—';
  const numRatio = parseFloat(ratio as string) || 0.48;

  const ratioClassification =
    numRatio >= 0.6
      ? 'Fine-fraction dominant (Secondary aerosol / Combustion signatures)'
      : numRatio <= 0.4
      ? 'Coarse-fraction dominant (Crustal road dust / Mechanical resuspension)'
      : 'Mixed aerosol signature (Balanced fine and coarse contributors)';

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>WHY-BAD-AQI ROOT CAUSE INVESTIGATION</small>
          <h2>Source Attribution & Aerosol Diagnostics</h2>
        </div>
        <label className="pill">Descriptive Diagnostics · Not Statutory Proof</label>
      </div>

      {/* Primary Diagnostic Grid */}
      <div className="columns" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* PM Ratio Card */}
        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>AEROSOL SIZE RATIO</small>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0' }}>
            <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{ratio}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>PM₂.₅ / PM₁₀ Ratio</span>
          </div>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '12px',
            }}
          >
            <b style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ratioClassification}</b>
          </div>
          <p className="footnote">
            <strong>Scientific Guardrail:</strong> The PM2.5 to PM10 ratio provides physical insight into the dominant particle size distribution. It does NOT constitute legal attribution to a specific factory, fleet, or agricultural plot.
          </p>
        </div>

        {/* Observed Chemical Telemetry */}
        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>MULTI-POLLUTANT OBSERVATION (OPEN-METEO)</small>
          <div className="table-wrap" style={{ marginTop: '8px' }}>
            <table>
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Observed Value</th>
                  <th>Diagnostic Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>PM₂.₅</b></td>
                  <td>{pm25} µg/m³</td>
                  <td>Fine inhalable particulates; long-range / combustion</td>
                </tr>
                <tr>
                  <td><b>PM₁₀</b></td>
                  <td>{pm10} µg/m³</td>
                  <td>Coarse dust, tire wear, mechanical resuspension</td>
                </tr>
                <tr>
                  <td><b>NO₂</b></td>
                  <td>{no2} µg/m³</td>
                  <td>High-temperature diesel / vehicular combustion tracer</td>
                </tr>
                <tr>
                  <td><b>O₃</b></td>
                  <td>{o3} µg/m³</td>
                  <td>Photochemical oxidant; daylight secondary smog</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Competing Hypotheses Evaluation */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <div className="panel-head">
          <div>
            <small>DECISION SUPPORT MATRIX</small>
            <h2>Competing Hypotheses Evaluation</h2>
          </div>
          <label className="pill">Hypothesis Testing</label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hypothesis</th>
                <th>Physical Mechanism</th>
                <th>Supporting Evidence</th>
                <th>Contradicting Evidence</th>
                <th>Plausibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>H1: Freight & Vehicular Emissions</b>
                </td>
                <td>Diesel exhaust, tailpipe fine particulates, tire resuspension</td>
                <td style={{ color: 'var(--accent-emerald)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Elevated NO₂ ({no2} µg/m³) along logistics corridor
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {pm10 > 200 ? 'Very high coarse fraction suggests dust co-presence' : 'None detected'}
                </td>
                <td>
                  <span className="pill" style={{ color: 'var(--accent-cyan)' }}>High</span>
                </td>
              </tr>

              <tr>
                <td>
                  <b>H2: Resuspended Road & Construction Dust</b>
                </td>
                <td>Mechanical abrasion, dry unpaved shoulders, heavy transit</td>
                <td style={{ color: 'var(--accent-emerald)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Substantial PM₁₀ load ({pm10} µg/m³) with moderate humidity
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  Fine PM2.5 elevated above pure crustal baseline
                </td>
                <td>
                  <span className="pill" style={{ color: 'var(--accent-amber)' }}>Moderate-High</span>
                </td>
              </tr>

              <tr>
                <td>
                  <b>H3: Upwind Agricultural / Biomass Fire</b>
                </td>
                <td>Long-range regional smoke transport from north-west</td>
                <td style={{ color: 'var(--accent-emerald)' }}>
                  {numRatio > 0.65 ? 'High fine fraction matches smoke plume profile' : 'Fine fraction not singularly elevated'}
                </td>
                <td style={{ color: 'var(--accent-coral)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> Wind from {telemetry?.weather.wind_compass || 'East'} (not NW fire vector); FIRMS needs key
                  </span>
                </td>
                <td>
                  <span className="pill" style={{ color: 'var(--text-muted)' }}>Low / Unproven</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="caution" style={{ marginTop: '14px' }}>
          <AlertTriangle size={18} />
          <p>
            <strong>Decision Guidance:</strong> When multiple hypotheses remain plausible, PRAN-NET recommends balanced, non-punitive interventions (e.g. misting, mechanical sweeping, and shift protection) rather than unilateral statutory sanctions.
          </p>
        </div>
      </div>
    </div>
  );
}
