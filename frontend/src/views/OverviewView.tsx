import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Wind,
  Thermometer,
  Droplets,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { LiveTelemetry, ViewId } from '../types';

interface OverviewViewProps {
  telemetry: LiveTelemetry | null;
  adv: any;
  sim: any[];
  activity: string;
  onActivityChange: (act: string) => void;
  activities: Record<string, string>;
  onProposeAction: (proposal: { sector: string; action: string; reason: string }) => void;
  onNavigate: (view: ViewId) => void;
}

const CODE_LABEL: Record<string, string> = {
  PROCEED: 'Proceed',
  PROCEED_AND_MONITOR: 'Proceed and monitor',
  MODIFY: 'Modify activity',
  MOVE_INDOORS: 'Move indoors / reschedule',
  VERIFY_FIRST: 'Verify first',
  NO_ADVICE: 'No advice (evidence unusable)',
};

const NOTICE: Record<string, Record<string, string>> = {
  en: {
    PROCEED: 'routine procedures apply',
    PROCEED_AND_MONITOR: 'the activity may proceed with monitoring',
    MODIFY: 'the activity may be shortened or modified',
    MOVE_INDOORS: 'the activity is being moved indoors or rescheduled',
    VERIFY_FIRST: 'conditions are being verified before a decision',
    NO_ADVICE: 'current data is unavailable, so the coordinator is verifying conditions',
  },
  hi: {
    PROCEED: 'सामान्य प्रक्रिया लागू है',
    PROCEED_AND_MONITOR: 'गतिविधि निगरानी के साथ जारी रह सकती है',
    MODIFY: 'गतिविधि को छोटा या बदला जा सकता है',
    MOVE_INDOORS: 'गतिविधि को भीतर किया जा रहा है या स्थगित किया जा रहा है',
    VERIFY_FIRST: 'निर्णय से पहले स्थिति की जाँच की जा रही है',
    NO_ADVICE: 'वर्तमान डेटा उपलब्ध नहीं है, इसलिए समन्वयक स्थिति की जाँच कर रहा है',
  },
};

const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : 'Unavailable');

export default function OverviewView({
  telemetry,
  adv,
  sim,
  activity,
  onActivityChange,
  activities,
  onProposeAction,
  onNavigate,
}: OverviewViewProps) {
  const [noticeLang, setNoticeLang] = useState<'en' | 'hi'>('en');
  const [copied, setCopied] = useState(false);
  const [scenario, setScenario] = useState({ outdoor: 150, ach: 1.2, cadr: 300, volume: 150 });

  const ev = adv?.evidence;
  const code = adv?.decision_code;

  // Steady-state indoor scenario math
  const k_dep = 0.24;
  const penetration = 0.8;
  const denominator = scenario.ach + k_dep + scenario.cadr / (scenario.volume || 1);
  const steadyPm25 = Math.round(((penetration * scenario.ach * scenario.outdoor) / denominator) * 10) / 10;

  const noticeText =
    noticeLang === 'en'
      ? `PRAN-NET Advisory Update (${telemetry?.location.name || 'Active Zone'}): for "${
          activities[activity] || activity
        }", ${NOTICE.en[code] || NOTICE.en.NO_ADVICE}. Category "${
          ev?.aqi_category || 'Unavailable'
        }" observed ${fmt(ev?.observed_at)}. Station data is context only; please follow official local guidance.`
      : `प्राण-नेट वायु-गुणवत्ता सूचना (${telemetry?.location.name || 'क्षेत्र'}): "${
          activities[activity] || activity
        }" के लिए ${NOTICE.hi[code] || NOTICE.hi.NO_ADVICE}। स्टेशन श्रेणी "${
          ev?.aqi_category || 'उपलब्ध नहीं'
        }", समय ${fmt(ev?.observed_at)}। स्टेशन का डेटा संदर्भ मात्र है; कृपया आधिकारिक दिशानिर्देशों का पालन करें।`;

  const copyNotice = () => {
    navigator.clipboard?.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aq = telemetry?.air_quality;
  const weather = telemetry?.weather;

  return (
    <div className="view-container">
      {/* Real Open-Meteo Telemetry Live Strip */}
      <section className="telemetry-strip panel">
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <small>LIVE MODEL PM₂.₅</small>
            <b>{aq?.pollutants?.['PM2.5'] != null ? `${aq.pollutants['PM2.5']} µg/m³` : '—'}</b>
            <span>{aq?.indicative_category || 'Evaluating'} · Copernicus CAMS</span>
          </div>

          <div className="telemetry-card">
            <small>LIVE MODEL PM₁₀</small>
            <b>{aq?.pollutants?.['PM10'] != null ? `${aq.pollutants['PM10']} µg/m³` : '—'}</b>
            <span>PM Ratio: {aq?.pollutants?.['PM2.5'] && aq?.pollutants?.['PM10'] ? (aq.pollutants['PM2.5'] / aq.pollutants['PM10']).toFixed(2) : '—'}</span>
          </div>

          <div className="telemetry-card">
            <small>WIND VECTOR</small>
            <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={20} />
              {weather?.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '—'}
            </b>
            <span>Bearing: {weather?.wind_compass || '—'} ({weather?.wind_direction_deg != null ? `${weather.wind_direction_deg}°` : '—'})</span>
          </div>

          <div className="telemetry-card">
            <small>TEMPERATURE & HUMIDITY</small>
            <b style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span><Thermometer size={16} /> {weather?.temperature_c != null ? `${weather.temperature_c}°C` : '—'}</span>
              <span><Droplets size={16} /> {weather?.relative_humidity_percent != null ? `${weather.relative_humidity_percent}%` : '—'}</span>
            </b>
            <span>Valid: {aq?.valid_time ? fmt(aq.valid_time) : 'Real-time model'}</span>
          </div>
        </div>
      </section>

      {/* Hero & Context Banner */}
      <section className="hero">
        <div>
          <p className="eyebrow">{telemetry?.location.name || 'DELHI-NCR REGION'} · OPERATIONAL INTELLIGENCE</p>
          <h1>
            See the evidence.
            <br />
            <em>Record the decision.</em>
          </h1>
          <p className="muted">
            Conservative per-activity advisories grounded in nearest monitoring evidence, combined with real-time
            Open-Meteo atmospheric forecasts and an append-only human mitigation ledger.
          </p>
        </div>
        <div className="proof">
          <ShieldCheck size={26} />
          <div>
            <b>Deterministic rules, no LLM in safety path</b>
            <small>Stale or conflicting data triggers refusal/caution</small>
          </div>
        </div>
      </section>

      {/* Operational Filter Strip */}
      <section className="filters">
        <div>
          <label htmlFor="overview-activity">Operational Activity</label>
          <select
            id="overview-activity"
            value={activity}
            onChange={(e) => onActivityChange(e.target.value)}
          >
            {Object.entries(activities).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="overview-target">Active Geographic Sector</label>
          <select id="overview-target" disabled>
            <option>{telemetry?.location.name || 'Primary Zone'} (28.61°N, 77.21°E)</option>
          </select>
        </div>
        <div className="status">
          <span className={`dot ${adv?.freshness?.status === 'fresh' ? 'green' : ''}`} />
          <div>
            <b>Freshness: {adv?.freshness?.status || 'Active'}</b>
            <small>Observation {fmt(ev?.observed_at)}</small>
          </div>
        </div>
      </section>

      {/* Advisory Columns */}
      <section className="columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <small>01 / Advisory Assessment</small>
              <h2>{CODE_LABEL[code] || 'Evaluating…'}</h2>
            </div>
            <label className="pill">{code || '…'}</label>
          </div>
          <div className="recommend">
            <AlertTriangle />
            <div>
              <small>Operational Recommendation</small>
              <h3>{adv?.recommendation || 'No recommendation can be made from current evidence.'}</h3>
              <p>{adv?.reason}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Decisive station</dt>
              <dd>
                {ev?.station_name || 'Nearest Available'}
                {adv?.chosen_station_distance_km != null && ` (${adv.chosen_station_distance_km} km)`}
              </dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>
                {ev?.aqi_category || '—'}
                {ev?.category_basis && ` (from ${ev.category_basis})`}
              </dd>
            </div>
            <div>
              <dt>Observed / Retrieved</dt>
              <dd>
                {fmt(ev?.observed_at)} / {fmt(ev?.retrieved_at)}
              </dd>
            </div>
            <div>
              <dt>Source provenance</dt>
              <dd>{ev?.source || 'Open-Meteo Model / Station Hybrid'}</dd>
            </div>
            <div>
              <dt>Rules version</dt>
              <dd>v{adv?.rules_version || '0.3.0'}</dd>
            </div>
          </dl>
          {adv?.stations_disagree && (
            <div className="notice">
              <AlertTriangle size={15} /> Nearby stations disagree by 2+ categories. Conservative worst fresh reading applied.
            </div>
          )}
          <div style={{ marginTop: '14px' }}>
            <button
              className="primary"
              style={{ width: '100%' }}
              onClick={() => {
                onProposeAction({
                  sector: 'campus',
                  action: code === 'MOVE_INDOORS' ? 'Move activity indoors' : 'Proceed with active monitoring',
                  reason: adv?.recommendation || 'Evidence-backed advisory recommendation.',
                });
                onNavigate('review');
              }}
            >
              <CheckCircle2 size={16} /> Route to Mitigation Review Queue
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <small>02 / Observational Evidence</small>
              <h2>Stations considered</h2>
            </div>
            <label className="pill">Nearest 3 monitors</label>
          </div>
          <p className="muted">{adv?.selection_rule || 'Worst category among fresh readings from nearest 3 monitors.'}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Station / Model</th>
                  <th>Distance</th>
                  <th>Category</th>
                  <th>Freshness</th>
                </tr>
              </thead>
              <tbody>
                {(adv?.stations_considered || []).map((s: any) => (
                  <tr key={s.station_id}>
                    <td>{s.station_name}</td>
                    <td>{s.distance_km} km</td>
                    <td>{s.category || '—'}</td>
                    <td>{s.freshness}</td>
                  </tr>
                ))}
                {!(adv?.stations_considered || []).length && (
                  <tr>
                    <td colSpan={4}>No station evidence available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="footnote">
            Category is derived from hourly PM2.5/PM10 against NAQI breakpoints. Indicative decision support; official NAQI uses 24-hour averages.
          </p>
        </article>
      </section>

      {/* Simulator & Communication Columns */}
      <section className="columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <small>03 / Cross-Activity Simulator</small>
              <h2>Same evidence, all activities</h2>
            </div>
            <label className="pill">Deterministic matrix</label>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Advisory Decision</th>
                </tr>
              </thead>
              <tbody>
                {sim.map((x) => (
                  <tr key={x.activity}>
                    <td>{x.label}</td>
                    <td>
                      <b>{CODE_LABEL[x.advisory?.decision_code] || '—'}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footnote">
            Strenuous activities are evaluated one category stricter. Editable policy default, not statutory enforcement.
          </p>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <small>04 / Communication Draft</small>
              <h2>Stakeholder notice draft</h2>
            </div>
            <label className="pill">Bilingual Template</label>
          </div>
          <div className="lang-switch">
            <button
              type="button"
              className={noticeLang === 'en' ? 'selected' : ''}
              onClick={() => setNoticeLang('en')}
            >
              English
            </button>
            <button
              type="button"
              className={noticeLang === 'hi' ? 'selected' : ''}
              onClick={() => setNoticeLang('hi')}
            >
              हिन्दी
            </button>
          </div>
          <blockquote>{noticeText}</blockquote>
          <button className="secondary" type="button" onClick={copyNotice}>
            <Copy size={14} /> {copied ? 'Draft Copied!' : 'Copy Notice Draft'}
          </button>
        </article>
      </section>

      {/* Exploratory Scenario Model */}
      <section className="panel scenario-panel">
        <div className="panel-head">
          <div>
            <small>05 / Exploratory Model</small>
            <h2>Indoor steady-state calculator</h2>
          </div>
          <label className="pill demo">MODEL SCENARIO, NOT MEASURED</label>
        </div>
        <div className="scenario-grid">
          <label>
            Assumed outdoor PM₂.₅ <b>{scenario.outdoor} µg/m³</b>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={scenario.outdoor}
              onChange={(e) => setScenario({ ...scenario, outdoor: +e.target.value })}
            />
          </label>
          <label>
            Air changes / hour (ACH) <b>{scenario.ach.toFixed(1)}</b>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={scenario.ach}
              onChange={(e) => setScenario({ ...scenario, ach: +e.target.value })}
            />
          </label>
          <label>
            Purifier CADR <b>{scenario.cadr} m³/h</b>
            <input
              type="range"
              min="0"
              max="1000"
              step="25"
              value={scenario.cadr}
              onChange={(e) => setScenario({ ...scenario, cadr: +e.target.value })}
            />
          </label>
          <label>
            Room volume <b>{scenario.volume} m³</b>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={scenario.volume}
              onChange={(e) => setScenario({ ...scenario, volume: +e.target.value })}
            />
          </label>
        </div>
        <div className="scenario-result">
          <small>Calculated steady-state indoor PM₂.₅</small>
          <b>{steadyPm25} µg/m³</b>
          <span>
            Physical mass-balance calculation (penetration: 0.8, deposition: 0.24/h). This calculation never dictates outdoor advisories.
          </span>
        </div>
      </section>
    </div>
  );
}
