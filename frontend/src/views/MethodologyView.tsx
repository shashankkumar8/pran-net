import { BookOpen, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

export default function MethodologyView() {
  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>METHODOLOGY, STANDARDS & USER HELP</small>
          <h2>Methodology & Scientific Reference</h2>
        </div>
        <label className="pill">Deterministic Rules v0.3.0</label>
      </div>

      {/* Breakpoints Table */}
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div className="panel-head">
          <div>
            <small>INDIA NATIONAL AIR QUALITY INDEX (NAQI)</small>
            <h2>Indicative PM Concentration Breakpoints</h2>
          </div>
          <label className="pill">Hourly Indicative</label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NAQI Category</th>
                <th>PM₂.₅ Range (µg/m³)</th>
                <th>PM₁₀ Range (µg/m³)</th>
                <th>Health Impact Descriptor (CPCB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b style={{ color: 'var(--accent-emerald)' }}>Good</b></td>
                <td>0 – 30</td>
                <td>0 – 50</td>
                <td>Minimal impact</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-emerald)' }}>Satisfactory</b></td>
                <td>31 – 60</td>
                <td>51 – 100</td>
                <td>Minor breathing discomfort to sensitive people</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-amber)' }}>Moderate</b></td>
                <td>61 – 90</td>
                <td>101 – 250</td>
                <td>Breathing discomfort to people with lungs, asthma, and heart diseases</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-coral)' }}>Poor</b></td>
                <td>91 – 120</td>
                <td>251 – 350</td>
                <td>Breathing discomfort to most people on prolonged exposure</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-coral)' }}>Very Poor</b></td>
                <td>121 – 250</td>
                <td>351 – 430</td>
                <td>Respiratory illness on prolonged exposure</td>
              </tr>
              <tr>
                <td><b style={{ color: '#E11D48' }}>Severe</b></td>
                <td>&gt; 250</td>
                <td>&gt; 430</td>
                <td>Affects healthy people and seriously impacts those with existing diseases</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="footnote">
          <strong>Important Caveat:</strong> Official CPCB NAQI requires 24-hour average concentrations. PRAN-NET calculates an indicative category using the latest hourly reading to provide timely decision support.
        </p>
      </div>

      {/* Decision Rules Matrix */}
      <div className="columns">
        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>DECISION LOGIC</small>
          <h3 style={{ margin: '6px 0 12px', fontSize: '16px' }}>Deterministic Advisory Rules</h3>
          <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <li><strong>Worst Fresh Category:</strong> From the nearest 3 reporting stations, the most conservative (highest severity) fresh reading is selected. Values are never averaged.</li>
            <li><strong>Disagreement Flag:</strong> If the nearest fresh stations differ by 2 or more categories, the decision code switches to <code>VERIFY_FIRST</code>.</li>
            <li><strong>Stale Data Refusal:</strong> Observations older than 180 minutes yield <code>NO_ADVICE</code>.</li>
            <li><strong>Strenuous Activity Offset:</strong> High-exertion athletic activities are judged 1 category stricter.</li>
            <li><strong>Zero LLM in Safety Path:</strong> All advisory codes are determined by pure mathematical rules; no generative LLM hallucinations can occur in the advisory calculation.</li>
          </ul>
        </div>

        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>PHYSICAL FORMULAS</small>
          <h3 style={{ margin: '6px 0 12px', fontSize: '16px' }}>Steady-State Indoor Model</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The indoor air scenario uses the classic single-zone mass balance under steady-state equilibrium:
          </p>
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--accent-cyan)',
              textAlign: 'center',
              margin: '10px 0',
            }}
          >
            C_in = (P · ACH · C_out) / (ACH + k_dep + CADR / V)
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '11px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <li><code>P</code>: Penetration factor (default: 0.8)</li>
            <li><code>ACH</code>: Air changes per hour</li>
            <li><code>k_dep</code>: Particle deposition rate (default: 0.24 / hour)</li>
            <li><code>CADR</code>: Clean Air Delivery Rate (m³/h)</li>
            <li><code>V</code>: Room volume (m³)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
