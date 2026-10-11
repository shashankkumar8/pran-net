import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  History,
  RefreshCw,
  ShieldCheck,
  Waves,
  BarChart3,
  Sun,
  Moon,
  Monitor,
  Info,
} from 'lucide-react';
import './styles.css';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type Any = any;

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

// Client-side fallback scenarios for resilient offline/demo evaluation
const DEMO_SCENARIOS: Record<string, {
  name: string;
  category: string;
  stations: Array<{ id: string; name: string; dist: number; cat: string; fresh: string; status: string }>;
  decision_code: string;
  recommendation: string;
  reason: string;
  disagree?: boolean;
}> = {
  severe: {
    name: 'Severe AQI Episode (PM2.5: 280 µg/m³)',
    category: 'Severe',
    stations: [
      { id: 's1', name: 'Anand Vihar (DPCC)', dist: 2.1, cat: 'Severe', fresh: 'fresh', status: 'sample' },
      { id: 's2', name: 'Patparganj (DPCC)', dist: 3.4, cat: 'Very Poor', fresh: 'fresh', status: 'sample' },
      { id: 's3', name: 'Vivek Vihar (DPCC)', dist: 4.8, cat: 'Very Poor', fresh: 'fresh', status: 'sample' },
    ],
    decision_code: 'MOVE_INDOORS',
    recommendation: 'Review the activity against current official guidance; move outdoor activity indoors or reschedule.',
    reason: 'Deterministic prompt based on worst fresh category (Severe) among nearest stations.',
  },
  disagree: {
    name: 'Sensor Disagreement (Severe vs Moderate)',
    category: 'Severe',
    stations: [
      { id: 's1', name: 'Station Alpha (North)', dist: 1.5, cat: 'Severe', fresh: 'fresh', status: 'sample' },
      { id: 's2', name: 'Station Beta (East)', dist: 2.8, cat: 'Moderate', fresh: 'fresh', status: 'sample' },
      { id: 's3', name: 'Station Gamma (Central)', dist: 3.2, cat: 'Satisfactory', fresh: 'fresh', status: 'sample' },
    ],
    decision_code: 'VERIFY_FIRST',
    recommendation: 'Nearby stations differ by 2+ categories. Verify latest official readings before deciding.',
    reason: 'Safety guardrail triggered due to multi-station conflict.',
    disagree: true,
  },
  stale: {
    name: 'Stale Sensor Data (>3 Hours Old)',
    category: 'Unavailable',
    stations: [
      { id: 's1', name: 'Station Delta', dist: 1.8, cat: 'Poor', fresh: 'stale', status: 'sample' },
      { id: 's2', name: 'Station Epsilon', dist: 2.5, cat: 'Poor', fresh: 'stale', status: 'sample' },
    ],
    decision_code: 'NO_ADVICE',
    recommendation: 'No recommendation can be made from stale or missing evidence.',
    reason: 'Observation exceeds configured freshness window (180 min). Verify current conditions.',
  },
  moderate: {
    name: 'Moderate Conditions (PM2.5: 75 µg/m³)',
    category: 'Moderate',
    stations: [
      { id: 's1', name: 'Lodhi Road (IMD)', dist: 1.9, cat: 'Moderate', fresh: 'fresh', status: 'sample' },
      { id: 's2', name: 'Jor Bagh (CPCB)', dist: 2.4, cat: 'Moderate', fresh: 'fresh', status: 'sample' },
      { id: 's3', name: 'Pusa Road (DPCC)', dist: 4.1, cat: 'Satisfactory', fresh: 'fresh', status: 'sample' },
    ],
    decision_code: 'PROCEED_AND_MONITOR',
    recommendation: 'Follow standard procedures and re-check conditions before and during the activity.',
    reason: 'Deterministic prompt based on Moderate category reading.',
  },
};

type ThemeMode = 'dark' | 'light' | 'system';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('prannet_theme_mode') as ThemeMode) || 'system';
  });

  const [school, setSchool] = useState<Any>({
    school_id: 'demo-school',
    name: 'Pran Operational Zone 1',
    lat: 28.6139,
    lon: 77.2090,
    activities: {
      outdoor_assembly: 'Outdoor assembly / shift start',
      sports: 'Strenuous athletics / outdoor dispatch',
      routine_outdoor: 'Routine outdoor movement',
      indoor_class: 'Indoor workspace / classroom',
    },
  });

  const [activity, setActivity] = useState('outdoor_assembly');
  const [adv, setAdv] = useState<Any>(null);
  const [sim, setSim] = useState<Any[]>([]);
  const [actions, setActions] = useState<Any[]>([]);
  const [metrics, setMetrics] = useState<Any>(null);
  const [tab, setTab] = useState<'workspace' | 'history' | 'metrics'>('workspace');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shownAt, setShownAt] = useState('');
  const [decision, setDecision] = useState('reviewed');
  const [actionTaken, setActionTaken] = useState('Review current official guidance');
  const [note, setNote] = useState('');
  const [token, setToken] = useState('demo-token');
  const [noticeLang, setNoticeLang] = useState<'en' | 'hi'>('en');
  const [scenario, setScenario] = useState({ outdoor: 150, ach: 1.2, cadr: 0, volume: 150 });
  const [scenarioOut, setScenarioOut] = useState<Any>(null);
  const [saved, setSaved] = useState('');

  // Offline / Demo Resilience state
  const [isOfflineDemo, setIsOfflineDemo] = useState(!API);
  const [selectedDemoKey, setSelectedDemoKey] = useState('severe');

  // Theme Synchronizer
  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let resolved = mode;
      if (mode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('prannet_theme_mode', mode);
    };

    applyTheme(themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  // Compute offline simulated advisory
  const generateSimulatedAdvisory = useCallback((actKey: string, scenKey: string) => {
    const sc = DEMO_SCENARIOS[scenKey] || DEMO_SCENARIOS.severe;
    let code = sc.decision_code;
    let rec = sc.recommendation;

    // Strenuous activity offset
    if (actKey === 'sports') {
      if (code === 'MODIFY') code = 'MOVE_INDOORS';
      else if (code === 'PROCEED_AND_MONITOR') code = 'MODIFY';
    } else if (actKey === 'indoor_class') {
      code = 'PROCEED';
      rec = 'Indoor activity: outdoor station data is contextual; follow routine indoor procedures.';
    }

    return {
      activity: actKey,
      rules_version: '0.3.0',
      decision_code: code,
      recommendation: rec,
      reason: sc.reason,
      status: code === 'NO_ADVICE' ? 'stale' : 'usable',
      generated_at: new Date().toISOString(),
      any_sample: true,
      stations_disagree: sc.disagree,
      chosen_station_distance_km: sc.stations[0]?.dist ?? 2.1,
      evidence: {
        station_name: sc.stations[0]?.name ?? 'Simulated Station',
        aqi_category: sc.category,
        category_basis: 'PM2.5',
        observed_at: new Date(Date.now() - (scenKey === 'stale' ? 14400000 : 900000)).toISOString(),
        retrieved_at: new Date().toISOString(),
        source: 'SIMULATED DEMO FIXTURE',
        data_status: 'sample',
      },
      stations_considered: sc.stations.map((s) => ({
        station_id: s.id,
        station_name: s.name,
        distance_km: s.dist,
        category: s.cat,
        freshness: s.fresh,
      })),
      selection_rule: 'Conservative rule: worst fresh category among nearest 3 stations.',
      limitations: [
        'Station readings are not personal or indoor exposure measurements.',
        'This prototype provides deterministic decision support, not medical or legal orders.',
      ],
      freshness: {
        status: scenKey === 'stale' ? 'stale' : 'fresh',
      },
    };
  }, []);

  // Compute offline activity simulator
  const generateSimulatedMatrix = useCallback((scenKey: string) => {
    const acts = [
      { key: 'outdoor_assembly', label: 'Outdoor assembly / shift start' },
      { key: 'sports', label: 'Strenuous athletics / outdoor dispatch' },
      { key: 'routine_outdoor', label: 'Routine outdoor movement' },
      { key: 'indoor_class', label: 'Indoor workspace / classroom' },
    ];
    return acts.map((a) => ({
      activity: a.key,
      label: a.label,
      advisory: generateSimulatedAdvisory(a.key, scenKey),
    }));
  }, [generateSimulatedAdvisory]);

  // Load Advisory from API or fallback
  const loadAdvice = useCallback(async () => {
    setLoading(true);
    setError('');

    if (!API) {
      // Offline fallback
      setIsOfflineDemo(true);
      const simulatedAdv = generateSimulatedAdvisory(activity, selectedDemoKey);
      const simulatedMatrix = generateSimulatedMatrix(selectedDemoKey);
      setAdv(simulatedAdv);
      setSim(simulatedMatrix);
      setShownAt(new Date().toISOString());
      setLoading(false);
      return;
    }

    try {
      const fetchWithTimeout = (url: string, ms = 4000) => {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), ms);
        return fetch(url, { signal: controller.signal })
          .then((r) => r.json())
          .finally(() => clearTimeout(t));
      };

      const [sc, a, s] = await Promise.all([
        fetchWithTimeout(`${API}/school`),
        fetchWithTimeout(`${API}/advisory?activity=${activity}`),
        fetchWithTimeout(`${API}/simulate`),
      ]);

      setSchool(sc);
      setAdv(a);
      setSim(s.items);
      setShownAt(new Date().toISOString());
      setIsOfflineDemo(false);
    } catch {
      // Graceful fallback on connection failure
      setIsOfflineDemo(true);
      const simulatedAdv = generateSimulatedAdvisory(activity, selectedDemoKey);
      const simulatedMatrix = generateSimulatedMatrix(selectedDemoKey);
      setAdv(simulatedAdv);
      setSim(simulatedMatrix);
      setShownAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, [activity, selectedDemoKey, generateSimulatedAdvisory, generateSimulatedMatrix]);

  // Load Ledger
  const loadLedger = useCallback(async () => {
    if (!token) return;
    if (isOfflineDemo || !API) {
      setMetrics({
        actions_recorded: actions.length,
        by_decision: actions.reduce((acc: Record<string, number>, cur) => {
          acc[cur.decision] = (acc[cur.decision] || 0) + 1;
          return acc;
        }, {}),
        median_review_seconds_client_reported: 14,
        severe_alerts_detected: 1,
        escalation_emails_sent: 0,
        note: 'Showing local demo records; no cloud records queried.',
      });
      return;
    }

    try {
      const [h, m] = await Promise.all([
        fetch(`${API}/actions`, { headers: { 'X-Coordinator-Token': token } }).then((r) => r.json()),
        fetch(`${API}/metrics`, { headers: { 'X-Coordinator-Token': token } }).then((r) => r.json()),
      ]);
      if (h.items) setActions(h.items);
      if (m) setMetrics(m);
    } catch (e: Any) {
      setError(e.message || 'Unable to load cloud ledger');
    }
  }, [token, isOfflineDemo, actions]);

  useEffect(() => {
    void loadAdvice();
  }, [loadAdvice]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  // Steady-state mass-balance calculation
  useEffect(() => {
    const { outdoor, ach, cadr, volume } = scenario;
    const k_dep = 0.24;
    const penetration = 0.8;
    const denominator = ach + k_dep + (cadr / (volume || 1));
    const result = Math.round(((penetration * ach * outdoor) / denominator) * 10) / 10;
    setScenarioOut({
      estimated_steady_state_pm25: result,
      label: 'MODEL SCENARIO, NOT MEASURED',
      warning: 'Calculated deterministically from inputs. Never used to generate the activity advisory.',
    });
  }, [scenario]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved('');

    if (isOfflineDemo || !API) {
      // Local demo persistence
      const newAction = {
        pk: `SCHOOL#${school?.school_id || 'demo-school'}`,
        sk: `ACT#${new Date().toISOString()}#local-${Date.now()}`,
        action_id: `local-${Date.now()}`,
        activity,
        decision,
        action_taken: actionTaken,
        note: note.trim(),
        created_at: new Date().toISOString(),
        review_seconds: 12,
        rules_version: '0.3.0',
        data_status: 'sample',
        advisory_snapshot: adv,
      };

      setActions((prev) => [newAction, ...prev]);
      setSaved('Recorded in local demo ledger. Evidence snapshot and rules version preserved.');
      setNote('');
      setTab('history');
      return;
    }

    try {
      const r = await fetch(`${API}/actions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Coordinator-Token': token,
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          activity,
          decision,
          action_taken: actionTaken,
          note,
          advisory_shown_at: shownAt,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to record action');
      setSaved(data.duplicate ? 'Already recorded (duplicate key ignored).' : 'Recorded. Stored with full evidence snapshot.');
      setNote('');
      await loadLedger();
      setTab('history');
    } catch (err: Any) {
      setError(err.message || 'Error persisting action');
    }
  }

  const ev = adv?.evidence;
  const code = adv?.decision_code;
  const noticeText =
    noticeLang === 'en'
      ? `PRAN-NET Advisory Update (${school?.name || 'Operational Zone'}): for "${
          school?.activities?.[activity] || activity
        }", ${NOTICE.en[code] || NOTICE.en.NO_ADVICE}. Category "${
          ev?.aqi_category || 'Unavailable'
        }" observed ${fmt(ev?.observed_at)}. Station data is context only; please follow official local guidance.`
      : `प्राण-नेट वायु-गुणवत्ता सूचना (${school?.name || 'क्षेत्र'}): "${
          school?.activities?.[activity] || activity
        }" के लिए ${NOTICE.hi[code] || NOTICE.hi.NO_ADVICE}। स्टेशन श्रेणी "${
          ev?.aqi_category || 'उपलब्ध नहीं'
        }", समय ${fmt(ev?.observed_at)}। स्टेशन का डेटा संदर्भ मात्र है; कृपया आधिकारिक दिशानिर्देशों का पालन करें।`;

  return (
    <div className="shell">
      <header>
        <div className="brand">
          <div className="logo">
            <Waves size={24} />
          </div>
          <div>
            <b>
              PRAN-NET <span>· Mitigation Network</span>
            </b>
            <small>Evidence-to-Action Decision Support</small>
          </div>
        </div>

        <div className="head-right">
          {/* Theme Selector */}
          <div className="theme-switch" role="group" aria-label="Theme selection">
            <button
              type="button"
              className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
              title="Airglass Porcelain (Light)"
            >
              <Sun size={13} /> Light
            </button>
            <button
              type="button"
              className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
              title="Obsidian Atmosphere (Dark)"
            >
              <Moon size={13} /> Dark
            </button>
            <button
              type="button"
              className={`theme-btn ${themeMode === 'system' ? 'active' : ''}`}
              onClick={() => setThemeMode('system')}
              title="System Preference"
            >
              <Monitor size={13} /> System
            </button>
          </div>

          {/* Truthful Data Status Badge */}
          {adv?.any_sample || isOfflineDemo ? (
            <span className="demo" title="Verified synthetic scenario, not live monitoring">
              SIMULATED DEMO DATA
            </span>
          ) : (
            <span className="live-badge" title="Live observation from connected provider">
              LIVE · STATION
            </span>
          )}

          <button className="refresh" onClick={loadAdvice} aria-label="Refresh telemetry">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main>
        {/* Resilient Offline / Demo Banner */}
        {isOfflineDemo && (
          <div className="system-banner" role="status">
            <div className="system-banner-content">
              <Info size={16} />
              <span>
                <strong>Offline Simulation Active:</strong> Backend API is not currently connected.
                Demonstrating deterministic decision rules with verified scenarios.
              </span>
            </div>
            <div className="scenario-picker">
              <label htmlFor="demo-scen">Scenario:</label>
              <select
                id="demo-scen"
                value={selectedDemoKey}
                onChange={(e) => setSelectedDemoKey(e.target.value)}
              >
                <option value="severe">Severe AQI Episode (280 µg/m³)</option>
                <option value="disagree">Sensor Disagreement (Conflict)</option>
                <option value="stale">Stale Sensor Data (over 3h old)</option>
                <option value="moderate">Moderate Conditions (75 µg/m³)</option>
              </select>
            </div>
          </div>
        )}

        <section className="hero">
          <div>
            <p className="eyebrow">{school?.name || 'ZONE 1'} · OPERATIONAL ADVISORY</p>
            <h1>
              See the evidence.
              <br />
              <em>Record the decision.</em>
            </h1>
            <p className="muted">
              Conservative per-activity advisories derived from nearby stations, coupled with an auditable
              ledger documenting exact data conditions at the moment of human review.
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

        {error && (
          <div className="error" role="alert">
            <AlertTriangle size={18} />
            {error}
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {saved && (
          <div className="notice" role="status">
            <CheckCircle2 size={16} /> {saved}
          </div>
        )}

        <section className="filters">
          <div>
            <label htmlFor="activity">Operational Activity</label>
            <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value)}>
              {Object.entries(school?.activities || {}).map(([k, v]: Any) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="target-zone">Active Zone</label>
            <select id="target-zone" disabled>
              <option>{school?.name || 'Primary Zone'} (28.61°N, 77.21°E)</option>
            </select>
          </div>
          <div className="status">
            <span className={`dot ${adv?.freshness?.status === 'fresh' ? 'green' : ''}`} />
            <div>
              <b>{loading ? 'Refreshing…' : `Freshness: ${adv?.freshness?.status || 'Unknown'}`}</b>
              <small>Evaluated {fmt(adv?.generated_at)}</small>
            </div>
          </div>
        </section>

        <nav>
          <button
            className={tab === 'workspace' ? 'selected' : ''}
            onClick={() => setTab('workspace')}
          >
            <Activity size={15} /> Decision workspace
          </button>
          <button
            className={tab === 'history' ? 'selected' : ''}
            onClick={() => setTab('history')}
          >
            <History size={15} /> Action ledger <span className="count">{actions.length}</span>
          </button>
          <button
            className={tab === 'metrics' ? 'selected' : ''}
            onClick={() => setTab('metrics')}
          >
            <BarChart3 size={15} /> Measured outcomes
          </button>
        </nav>

        {tab === 'workspace' && (
          <>
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
                    <small>Recommendation</small>
                    <h3>{adv?.recommendation || 'No recommendation can be made from current evidence.'}</h3>
                    <p>{adv?.reason}</p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Decisive station</dt>
                    <dd>
                      {ev?.station_name || 'None'}
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
                    <dd>{ev?.source || '—'}</dd>
                  </div>
                  <div>
                    <dt>Rules version</dt>
                    <dd>{adv?.rules_version}</dd>
                  </div>
                </dl>
                {adv?.stations_disagree && (
                  <div className="notice">
                    <AlertTriangle size={15} /> Nearby stations disagree by 2+ categories. Conservative worst fresh reading applied.
                  </div>
                )}
                <div className="caution">
                  <ShieldCheck size={18} />
                  <p>
                    <b>Methodological Limitations:</b>
                    <br />
                    {(adv?.limitations || []).join(' ')}
                  </p>
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
                <p className="muted">{adv?.selection_rule}</p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Station</th>
                        <th>Distance</th>
                        <th>Category</th>
                        <th>Freshness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adv?.stations_considered || []).map((s: Any) => (
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
                            <b>{CODE_LABEL[x.advisory.decision_code]}</b>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="footnote">
                  Strenuous activity is evaluated one category stricter. Editable policy default, not statutory enforcement.
                </p>
              </article>

              <article className="panel">
                <div className="panel-head">
                  <div>
                    <small>04 / Accountability Loop</small>
                    <h2>Record mitigation decision</h2>
                  </div>
                  <label className="pill">{isOfflineDemo ? 'Demo Persistence' : 'DynamoDB Write'}</label>
                </div>
                <form onSubmit={save}>
                  <label>
                    Decision posture
                    <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                      <option value="reviewed">Reviewed advisory</option>
                      <option value="followed">Followed advisory</option>
                      <option value="modified">Modified activity</option>
                      <option value="overridden">Overrode advisory (reason required)</option>
                    </select>
                  </label>
                  <label>
                    Action taken
                    <select value={actionTaken} onChange={(e) => setActionTaken(e.target.value)}>
                      <option>Review current official guidance</option>
                      <option>Notify relevant staff and parents</option>
                      <option>Issue localized mitigation advisory</option>
                      <option>Move activity indoors</option>
                      <option>Reschedule activity</option>
                      <option>Proceed with active air monitoring</option>
                    </select>
                  </label>
                  <label>
                    Decision rationale / notes (max 500)
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Record operational context, mitigation reasoning, or override justification…"
                    />
                  </label>
                  <label>
                    Coordinator verification token
                    <input
                      type="password"
                      autoComplete="off"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter authorized token"
                    />
                  </label>
                  <button className="primary" disabled={!token || !adv} type="submit">
                    <CheckCircle2 size={16} /> Record action
                  </button>
                </form>
              </article>
            </section>

            <section className="columns">
              <article className="panel">
                <div className="panel-head">
                  <div>
                    <small>05 / Communication</small>
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
                <button
                  className="secondary"
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(noticeText)}
                >
                  Copy notice draft
                </button>
              </article>

              <article className="panel scenario-panel">
                <div className="panel-head">
                  <div>
                    <small>06 / Exploratory Scenario</small>
                    <h2>Indoor steady-state model</h2>
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
                    Air changes / hour <b>{scenario.ach.toFixed(1)}</b>
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
                  <small>Steady-state concentration</small>
                  <b>{scenarioOut ? `${scenarioOut.estimated_steady_state_pm25} µg/m³` : '—'}</b>
                  <span>{scenarioOut?.warning}</span>
                </div>
              </article>
            </section>
          </>
        )}

        {tab === 'history' && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <small>Auditable Event History</small>
                <h2>Persistent Action Ledger</h2>
              </div>
              <label className="pill">{actions.length} records</label>
            </div>
            {!token && (
              <div className="notice">
                <Database size={15} /> Enter the coordinator token to inspect the ledger.
              </div>
            )}
            {token && !actions.length && (
              <div className="empty">
                <History size={32} />
                <h3>No recorded actions in current session</h3>
                <p>Recorded actions persist with full evidence snapshots.</p>
              </div>
            )}
            {actions.map((a) => (
              <div className="action-row" key={a.sk || a.action_id}>
                <CheckCircle2 size={20} />
                <div style={{ width: '100%' }}>
                  <b>{a.action_taken}</b>
                  <p>
                    {a.decision} · {a.activity} · Advisory then:{' '}
                    <strong>{CODE_LABEL[a.advisory_snapshot?.decision_code] || '—'}</strong>
                    {a.data_status === 'sample' && ' · SIMULATED DATA'}
                  </p>
                  {a.note && <p>Rationale: {a.note}</p>}
                  <small>
                    {fmt(a.created_at)} · Rules v{a.rules_version} · Review time {a.review_seconds ?? '—'}s
                  </small>
                  <details>
                    <summary>View immutable evidence snapshot</summary>
                    <pre>{JSON.stringify(a.advisory_snapshot, null, 2)}</pre>
                  </details>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'metrics' && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <small>Observable Metrics</small>
                <h2>Measured System Outcomes</h2>
              </div>
            </div>
            {!metrics ? (
              <div className="notice">
                <Database size={15} /> Provide coordinator verification to view metrics.
              </div>
            ) : (
              <div className="stats">
                <article>
                  <small>Actions recorded</small>
                  <b>{metrics.actions_recorded}</b>
                </article>
                <article>
                  <small>Median review time</small>
                  <b>{metrics.median_review_seconds_client_reported ?? '—'}s</b>
                </article>
                <article>
                  <small>Severe alerts detected</small>
                  <b>{metrics.severe_alerts_detected}</b>
                </article>
              </div>
            )}
            <p className="footnote">
              {metrics?.note ||
                'Only system-observable action counts and timestamps are reported. No unsubstantiated health or exposure outcomes are claimed.'}
            </p>
          </section>
        )}

        <footer>
          <div>
            <b>PRAN-NET — Pran Operational Mitigation Network</b>
            <small>Deterministic decision support; not medical advice or a statutory directive</small>
          </div>
          <span>Truthful Provenance. Uncertainty Visible. Auditable Actions.</span>
        </footer>
      </main>
    </div>
  );
}
