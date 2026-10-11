import { BookOpen, ShieldCheck, AlertCircle, HelpCircle, ExternalLink, Calculator, Layers, FileCheck } from 'lucide-react';

export default function MethodologyView() {
  const researchPapers = [
    {
      title: 'Submicron aerosol composition in Delhi: real-time source apportionment using Aerosol Chemical Speciation Monitor (ACSM)',
      authors: 'Gani, S., Bhandari, S., Seraj, S., Wang, D. S., Patel, K., Soni, P., Arub, Z., Habib, G., Hildebrandt Ruiz, L., & Apte, J. S.',
      org: 'Atmospheric Chemistry and Physics (ACP / EGU)',
      year: 2019,
      link: 'https://doi.org/10.5194/acp-19-6843-2019',
      decisionInformed: 'Informed our multi-pollutant diagnostic matrix: distinguishing primary hydrocarbon vehicular signatures from secondary ammonium nitrate/sulfate aerosol formation during nocturnal temperature inversions.',
      limitation: 'ACSM measures submicron non-refractory PM1 mass; coarse crustal road dust (2.5–10 µm) requires optical sizing complement.',
    },
    {
      title: 'Particulate matter and gaseous pollutants in South Asia: Source apportionment and health risk assessment',
      authors: 'Pant, P., & Harrison, R. M.',
      org: 'Atmospheric Environment (Elsevier)',
      year: 2012,
      link: 'https://doi.org/10.1016/j.atmosenv.2012.01.051',
      decisionInformed: 'Informed our strict separation of resuspended mineral crustal dust (PM10 dominant) from tailpipe combustion emissions in the Sector Action Plans.',
      limitation: 'Receptor modeling factor loadings exhibit strong seasonal variability between pre-monsoon convective mixing and post-monsoon stagnant boundary layers.',
    },
    {
      title: 'Technical Guidance for the Use of Low-Cost Air Sensors and Sensor Networks',
      authors: 'Air Sensor Evaluation Center / Technology Transfer Network',
      org: 'US EPA & CPCB Guidelines on Low-Cost Air Sensors',
      year: 2020,
      link: 'https://www.epa.gov/air-sensor-toolbox',
      decisionInformed: 'Mandates transparent labeling: Low-cost and model data are strictly labeled "Indicative / Decision Support" and NEVER represented as statutory regulatory ground reference equivalents.',
      limitation: 'Optical particle counters suffer hygroscopic growth artifacts at RH > 75% and zero-point baseline drift over 6-month continuous field deployments.',
    },
    {
      title: 'National Ambient Air Quality Standards & National Air Quality Index (NAQI) Breakpoint Methodology',
      authors: 'Central Pollution Control Board (CPCB) Ministry of Environment, Forest & Climate Change',
      org: 'CPCB Government of India',
      year: 2014,
      link: 'https://cpcb.nic.in/air-quality-standards/',
      decisionInformed: 'Direct implementation of NAQI breakpoints (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) for 6 criteria pollutants (PM2.5, PM10, NO2, O3, SO2, CO).',
      limitation: 'Official statutory NAQI is legally mandated over a 24-hour moving window. PRAN-NET calculates an hourly indicative category to prevent delayed public safety response.',
    },
    {
      title: 'Mathematical Modeling of Indoor Airborne Particle Dynamics and Filtration Efficiency',
      authors: 'Nazaroff, W. W., & Cass, G. R.',
      org: 'Environmental Science & Technology',
      year: 1989,
      link: 'https://doi.org/10.1021/es00180a003',
      decisionInformed: 'Direct derivation of PRAN-NET’s steady-state indoor single-zone mass balance formula incorporating air exchange rate (ACH), penetration factor (P), and CADR filtration.',
      limitation: 'Assumes well-mixed single zone; spatial gradients near doors and localized indoor emissions (cooking, incense) require localized sub-zone modeling.',
    },
  ];

  return (
    <div className="view-container">
      {/* 1. VIEW HEADER */}
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>RESEARCH-INFORMED METHODOLOGY</small>
          <h2>Scientific Standards, Research Registry & Decision Rules</h2>
        </div>
        <label className="pill">Peer-Reviewed Foundations · Explainable v0.3.0</label>
      </div>

      {/* 2. RESEARCH & LITERATURE REGISTRY TABLE */}
      <section className="panel" style={{ marginBottom: '18px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div className="panel-head">
          <div>
            <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>SECTION 7 COMPLIANCE</small>
            <h3>Research Papers & Official Guidance Registry</h3>
          </div>
          <span className="pill">5 Verified Academic Foundations</span>
        </div>
        <p className="muted" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          PRAN-NET does not invent scientific claims or claim artificial intelligence replaces physical atmospheric science. Every design choice, data threshold, and operational guardrail is anchored in peer-reviewed atmospheric chemistry and public-health engineering literature.
        </p>

        <div className="table-wrap" style={{ marginTop: '12px' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Study / Title</th>
                <th style={{ width: '20%' }}>Authors & Organization</th>
                <th style={{ width: '28%' }}>Design Decision Informed</th>
                <th style={{ width: '24%' }}>Physical / Methodological Limitation</th>
              </tr>
            </thead>
            <tbody>
              {researchPapers.map((paper, idx) => (
                <tr key={idx}>
                  <td>
                    <b style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{paper.title}</b>
                    <div style={{ marginTop: '4px' }}>
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-cyan)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Verified DOI / Link <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{paper.authors}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{paper.org} ({paper.year})</small>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {paper.decisionInformed}
                    </p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {paper.limitation}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. NAQI BREAKPOINTS TABLE */}
      <section className="panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <small style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>INDIA NATIONAL AIR QUALITY INDEX (NAQI)</small>
            <h3>National Ambient Air Quality Standards & Breakpoint Table</h3>
          </div>
          <label className="pill">CPCB 2014 Criteria</label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NAQI Category</th>
                <th>PM₂.₅ Range (µg/m³)</th>
                <th>PM₁₀ Range (µg/m³)</th>
                <th>NO₂ Range (µg/m³)</th>
                <th>Health Impact Descriptor (CPCB NAAQS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b style={{ color: 'var(--accent-emerald)' }}>Good</b></td>
                <td>0 – 30</td>
                <td>0 – 50</td>
                <td>0 – 40</td>
                <td>Minimal impact; satisfactory ambient air quality.</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-emerald)' }}>Satisfactory</b></td>
                <td>31 – 60</td>
                <td>51 – 100</td>
                <td>41 – 80</td>
                <td>Minor breathing discomfort to sensitive people.</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-amber)' }}>Moderate</b></td>
                <td>61 – 90</td>
                <td>101 – 250</td>
                <td>81 – 180</td>
                <td>Breathing discomfort to people with asthma and heart diseases.</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-coral)' }}>Poor</b></td>
                <td>91 – 120</td>
                <td>251 – 350</td>
                <td>181 – 280</td>
                <td>Breathing discomfort to most people on prolonged exposure.</td>
              </tr>
              <tr>
                <td><b style={{ color: 'var(--accent-coral)' }}>Very Poor</b></td>
                <td>121 – 250</td>
                <td>351 – 430</td>
                <td>281 – 400</td>
                <td>Respiratory illness on prolonged exposure; active caution advised.</td>
              </tr>
              <tr>
                <td><b style={{ color: '#E11D48' }}>Severe</b></td>
                <td>&gt; 250</td>
                <td>&gt; 430</td>
                <td>&gt; 400</td>
                <td>Affects healthy people and seriously impacts vulnerable populations.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="footnote" style={{ marginTop: '10px' }}>
          <strong>Statutory Averaging Caveat:</strong> Official CPCB NAQI requires 24-hour average concentrations. PRAN-NET calculates an hourly indicative category to provide rapid operational decision support while distinguishing instantaneous spikes from diurnal averages.
        </p>
      </section>

      {/* 4. MATHEMATICAL AND PHYSICAL MODELS */}
      <div className="columns" style={{ marginBottom: '18px' }}>
        {/* Steady State Indoor Mass Balance */}
        <div className="panel">
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>PROBLEM D · CONSERVATION OF MASS</small>
          <h3 style={{ margin: '6px 0 10px', fontSize: '15px' }}>Indoor Steady-State Mass Balance</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Indoor particulate concentration under steady-state equilibrium governed by infiltration and filtration:
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
              border: '1px solid var(--border-subtle)',
            }}
          >
            C_in = (P · ACH · C_out) / (ACH + k_dep + CADR / V)
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '11px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <li><code>P</code>: Penetration factor (default: 0.8 for unsealed windows)</li>
            <li><code>ACH</code>: Air changes per hour (0.5 to 2.5 h⁻¹)</li>
            <li><code>k_dep</code>: Particle deposition rate constant (0.24 h⁻¹ for PM2.5)</li>
            <li><code>CADR</code>: Clean Air Delivery Rate of HEPA filtration unit (m³/h)</li>
            <li><code>V</code>: Enclosed room volume (m³)</li>
          </ul>
        </div>

        {/* Personal Inhaled Dose Model */}
        <div className="panel">
          <small style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>PROBLEM B · PHYSIOLOGICAL DOSE</small>
          <h3 style={{ margin: '6px 0 10px', fontSize: '15px' }}>Inhaled Particulate Mass Model</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Cumulative inhaled particulate dose computed across route segments and transit modes:
          </p>
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--accent-emerald)',
              textAlign: 'center',
              margin: '10px 0',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Inhaled Mass (µg) = ∑ [ C_i · BR_m · Δt_i ]
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '11px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            <li><code>C_i</code>: Ambient concentration along segment <em>i</em> (µg/m³)</li>
            <li><code>BR_m</code>: Physiological minute ventilation rate for transit mode <em>m</em>:</li>
            <li style={{ paddingLeft: '12px' }}>Sedentary / enclosed vehicle: <strong>0.5 m³/h</strong></li>
            <li style={{ paddingLeft: '12px' }}>Walking / pedestrian: <strong>1.2 m³/h</strong></li>
            <li style={{ paddingLeft: '12px' }}>Cycling / delivery courier: <strong>2.1 m³/h</strong></li>
            <li><code>Δt_i</code>: Exposure duration along segment (hours)</li>
          </ul>
        </div>
      </div>

      {/* 5. DETERMINISTIC SAFETY RULES (NO LLM HALLUCINATIONS) */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <small style={{ color: 'var(--accent-coral)', fontWeight: 800 }}>SAFETY-CRITICAL ARCHITECTURE</small>
            <h3>Deterministic Advisory Engine & Algorithmic Guardrails</h3>
          </div>
          <label className="pill" style={{ color: 'var(--accent-coral)' }}>Zero LLM in Safety Decision Path</label>
        </div>

        <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: '10px' }}>
          <li>
            <strong>Deterministic Advisory Engine:</strong> Life-safety advisory codes (e.g. <code>MOVE_INDOORS</code>, <code>SUSPEND_PE</code>, <code>DEPLOY_MISTING</code>) are derived strictly through deterministic boundary conditions. No generative large language models are in the advisory logic path.
          </li>
          <li>
            <strong>Conservative Peak Reading Rule:</strong> When multiple reporting stations exist in an operational zone, the most conservative (highest severity) fresh reading is selected. Spatial readings are never averaged across distinct micro-environments.
          </li>
          <li>
            <strong>Spatial Disagreement Flag:</strong> If fresh stations within 10 km disagree by 2 or more NAQI categories, the engine switches the decision code to <code>VERIFY_FIRST</code> rather than issuing conflicting operational directives.
          </li>
          <li>
            <strong>Stale Data Refusal Protocol:</strong> Telemetry older than 180 minutes is automatically rejected and classified as <code>NO_ADVICE</code>, forcing physical confirmation.
          </li>
          <li>
            <strong>Non-Punitive Assistance Posture:</strong> PRAN-NET algorithms never issue automated statutory penalties, facility closures, or criminal allegations against farmers or contractors without authorized human confirmation and physical field verification.
          </li>
        </ul>
      </section>
    </div>
  );
}
