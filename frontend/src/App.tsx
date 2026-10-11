import {useCallback, useEffect, useState} from 'react';
import {Activity, AlertTriangle, CheckCircle2, Database, History, RefreshCw, ShieldCheck, Waves, BarChart3} from 'lucide-react';
import './styles.css';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
type Any = any;
const CODE_LABEL: Record<string, string> = {PROCEED: 'Proceed', PROCEED_AND_MONITOR: 'Proceed and monitor', MODIFY: 'Modify activity',
  MOVE_INDOORS: 'Move indoors / reschedule', VERIFY_FIRST: 'Verify first', NO_ADVICE: 'No advice (evidence unusable)'};
const NOTICE: Record<string, Record<string, string>> = {
  en: {PROCEED: 'routine procedures apply', PROCEED_AND_MONITOR: 'the activity may proceed with monitoring', MODIFY: 'the activity may be shortened or modified',
       MOVE_INDOORS: 'the activity is being moved indoors or rescheduled', VERIFY_FIRST: 'conditions are being verified before a decision', NO_ADVICE: 'current data is unavailable, so the school is verifying conditions'},
  hi: {PROCEED: 'सामान्य प्रक्रिया लागू है', PROCEED_AND_MONITOR: 'गतिविधि निगरानी के साथ जारी रह सकती है', MODIFY: 'गतिविधि को छोटा या बदला जा सकता है',
       MOVE_INDOORS: 'गतिविधि को भीतर किया जा रहा है या स्थगित किया जा रहा है', VERIFY_FIRST: 'निर्णय से पहले स्थिति की जाँच की जा रही है', NO_ADVICE: 'वर्तमान डेटा उपलब्ध नहीं है, इसलिए विद्यालय स्थिति की जाँच कर रहा है'}};
const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : 'Unavailable');

async function api(path: string, init: RequestInit = {}) {
  const r = await fetch(API + path, init);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
  return d;
}

export default function App() {
  const [school, setSchool] = useState<Any>(null);
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
  const [token, setToken] = useState('');
  const [noticeLang, setNoticeLang] = useState<'en' | 'hi'>('en');
  const [scenario, setScenario] = useState({outdoor: 150, ach: 1.2, cadr: 0, volume: 150});
  const [scenarioOut, setScenarioOut] = useState<Any>(null);
  const [saved, setSaved] = useState('');

  const loadAdvice = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sc, a, s] = await Promise.all([api('/school'), api(`/advisory?activity=${activity}`), api('/simulate')]);
      setSchool(sc); setAdv(a); setSim(s.items); setShownAt(new Date().toISOString());
    } catch (e: Any) { setError(e.message || 'Unable to load advisory'); } finally { setLoading(false); }
  }, [activity]);

  const loadLedger = useCallback(async () => {
    if (!token) return;
    try {
      const [h, m] = await Promise.all([api('/actions', {headers: {'X-Coordinator-Token': token}}), api('/metrics', {headers: {'X-Coordinator-Token': token}})]);
      setActions(h.items); setMetrics(m);
    } catch (e: Any) { setError(e.message); }
  }, [token]);

  useEffect(() => { if (API) void loadAdvice(); }, [loadAdvice]);
  useEffect(() => { void loadLedger(); }, [loadLedger]);
  useEffect(() => {
    if (!API) return;
    const t = setTimeout(() => {
      api('/scenario', {method: 'POST', headers: {'content-type': 'application/json'},
        body: JSON.stringify({outdoor_pm25: scenario.outdoor, ach: scenario.ach, cadr: scenario.cadr, room_volume: scenario.volume})})
        .then(setScenarioOut).catch(() => setScenarioOut(null));
    }, 250);
    return () => clearTimeout(t);
  }, [scenario]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaved('');
    try {
      const r = await api('/actions', {method: 'POST', headers: {'content-type': 'application/json', 'X-Coordinator-Token': token, 'Idempotency-Key': crypto.randomUUID()},
        body: JSON.stringify({activity, decision, action_taken: actionTaken, note, advisory_shown_at: shownAt})});
      setSaved(r.duplicate ? 'Already recorded (duplicate ignored).' : 'Recorded. The evidence snapshot was stored with this decision.');
      setNote(''); await loadLedger(); setTab('history');
    } catch (err: Any) { setError(err.message); }
  }

  if (!API) return <div className="shell"><main><div className="error" role="alert"><AlertTriangle size={18}/> VITE_API_URL is not set. Deploy the backend (see README) and set it in frontend/.env. This app never fabricates readings.</div></main></div>;

  const ev = adv?.evidence;
  const code = adv?.decision_code;
  const noticeText = noticeLang === 'en'
    ? `School air-quality update (${school?.name || 'School'}): for "${school?.activities?.[activity] || activity}", ${NOTICE.en[code] || NOTICE.en.NO_ADVICE}. Based on the station category "${ev?.aqi_category || 'unavailable'}" observed ${fmt(ev?.observed_at)}. Station data is not a personal exposure measurement; please follow official guidance.`
    : `विद्यालय वायु-गुणवत्ता सूचना (${school?.name || 'विद्यालय'}): "${school?.activities?.[activity] || activity}" के लिए ${NOTICE.hi[code] || NOTICE.hi.NO_ADVICE}। स्टेशन श्रेणी "${ev?.aqi_category || 'उपलब्ध नहीं'}", समय ${fmt(ev?.observed_at)}। स्टेशन का डेटा व्यक्तिगत संपर्क का माप नहीं है; कृपया आधिकारिक दिशानिर्देशों का पालन करें।`;

  return <div className="shell">
    <header><div className="brand"><div className="logo"><Waves/></div><div><b>SchoolAir <span>Ledger</span></b><small>EVIDENCE-TO-ACTION DECISION SUPPORT</small></div></div>
      <div className="head-right">{adv?.any_sample && <label className="demo">SAMPLE DATA · NOT LIVE MEASUREMENTS</label>}
        <button className="refresh" onClick={loadAdvice} aria-label="Refresh advisory"><RefreshCw size={17}/></button></div></header>
    <main>
      <section className="hero"><div><p className="eyebrow">{school?.name || 'SCHOOL'} · AIR-QUALITY DECISIONS</p><h1>See the evidence.<br/><em>Record the decision.</em></h1>
        <p className="muted">Explainable per-activity advisories from the nearest stations, plus a permanent record of what the school decided and what the data said at that moment.</p></div>
        <div className="proof"><ShieldCheck/><div><b>Deterministic rules, no LLM in the safety path</b><small>Stale or missing data produces no advice</small></div></div></section>
      {error && <div className="error" role="alert"><AlertTriangle size={18}/>{error}<button onClick={() => setError('')}>Dismiss</button></div>}
      {saved && <div className="notice" role="status"><CheckCircle2 size={15}/> {saved}</div>}
      <section className="filters"><div><label htmlFor="activity">Activity to review</label>
        <select id="activity" value={activity} onChange={e => setActivity(e.target.value)}>{Object.entries(school?.activities || {}).map(([k, v]: Any) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div className="status"><span className="dot"/><div><b>{loading ? 'Refreshing…' : `Freshness: ${adv?.freshness?.status || '—'}`}</b><small>Advisory generated {fmt(adv?.generated_at)}</small></div></div></section>
      <nav>
        <button className={tab === 'workspace' ? 'selected' : ''} onClick={() => setTab('workspace')}><Activity size={15}/> Decision workspace</button>
        <button className={tab === 'history' ? 'selected' : ''} onClick={() => setTab('history')}><History size={15}/> Action ledger <span className="count">{actions.length}</span></button>
        <button className={tab === 'metrics' ? 'selected' : ''} onClick={() => setTab('metrics')}><BarChart3 size={15}/> Measured outcomes</button></nav>

      {tab === 'workspace' && <>
        <section className="columns">
          <article className="panel"><div className="panel-head"><div><small>01 / ADVISORY</small><h2>{CODE_LABEL[code] || 'Loading…'}</h2></div><label className="pill">{code || '…'}</label></div>
            <div className="recommend"><AlertTriangle/><div><small>RECOMMENDATION</small><h3>{adv?.recommendation || 'No recommendation can be made from the current evidence.'}</h3><p>{adv?.reason}</p></div></div>
            <dl><div><dt>Decisive station</dt><dd>{ev?.station_name || 'None'}{adv?.chosen_station_distance_km != null && ` (${adv.chosen_station_distance_km} km)`}</dd></div>
              <div><dt>Category</dt><dd>{ev?.aqi_category || '—'}{ev?.category_basis && ` (from ${ev.category_basis})`}</dd></div>
              <div><dt>Observed / retrieved</dt><dd>{fmt(ev?.observed_at)} / {fmt(ev?.retrieved_at)}</dd></div>
              <div><dt>Source</dt><dd>{ev?.source || '—'}</dd></div><div><dt>Rules version</dt><dd>{adv?.rules_version}</dd></div></dl>
            {adv?.stations_disagree && <div className="notice"><AlertTriangle size={15}/> Nearby stations disagree by 2+ categories. The most conservative fresh reading is used.</div>}
            <div className="caution"><ShieldCheck/><p><b>Limitations</b><br/>{(adv?.limitations || []).join(' ')}</p></div></article>
          <article className="panel"><div className="panel-head"><div><small>02 / EVIDENCE</small><h2>Stations considered</h2></div><label className="pill">nearest 3</label></div>
            <p className="muted">{adv?.selection_rule}</p>
            <div className="table-wrap"><table><thead><tr><th>Station</th><th>km</th><th>Category</th><th>Freshness</th></tr></thead><tbody>
              {(adv?.stations_considered || []).map((s: Any) => <tr key={s.station_id}><td>{s.station_name}</td><td>{s.distance_km}</td><td>{s.category || '—'}</td><td>{s.freshness}</td></tr>)}
              {!(adv?.stations_considered || []).length && <tr><td colSpan={4}>No station evidence available.</td></tr>}</tbody></table></div>
            <p className="footnote">Category is derived from PM2.5/PM10 against CPCB NAQI breakpoints using hourly values; official NAQI uses 24-hour averages. This is indicative, not an official AQI.</p></article></section>
        <section className="columns">
          <article className="panel"><div className="panel-head"><div><small>03 / SIMULATOR</small><h2>Same evidence, every activity</h2></div><label className="pill">measured, not forecast</label></div>
            <div className="table-wrap"><table><thead><tr><th>Activity</th><th>Decision</th></tr></thead><tbody>
              {sim.map(x => <tr key={x.activity}><td>{x.label}</td><td><b>{CODE_LABEL[x.advisory.decision_code]}</b></td></tr>)}</tbody></table></div>
            <p className="footnote">Strenuous activity is judged one category stricter. This is an editable policy default, not an official threshold.</p></article>
          <article className="panel"><div className="panel-head"><div><small>04 / ACCOUNTABILITY</small><h2>Record a decision</h2></div><label className="pill">AWS persistence</label></div>
            <form onSubmit={save}>
              <label>Decision<select value={decision} onChange={e => setDecision(e.target.value)}><option value="reviewed">Reviewed advisory</option><option value="followed">Followed advisory</option><option value="modified">Modified activity</option><option value="overridden">Overrode advisory (reason required)</option></select></label>
              <label>Action taken<select value={actionTaken} onChange={e => setActionTaken(e.target.value)}><option>Review current official guidance</option><option>Notify relevant staff</option><option>Issue school advisory</option><option>Move activity indoors</option><option>Reschedule activity</option><option>Proceed with monitoring</option></select></label>
              <label>Reason / note (max 500)<textarea rows={3} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Evidence reviewed, reason for override…"/></label>
              <label>Coordinator token<input type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)}/></label>
              <button className="primary" disabled={!token || !adv}><CheckCircle2 size={16}/> Record action</button></form></article></section>
        <section className="columns">
          <article className="panel"><div className="panel-head"><div><small>05 / COMMUNICATION</small><h2>Parent notice draft</h2></div><label className="pill">template, editable</label></div>
            <div className="lang-switch"><button type="button" className={noticeLang === 'en' ? 'selected' : ''} onClick={() => setNoticeLang('en')}>English</button><button type="button" className={noticeLang === 'hi' ? 'selected' : ''} onClick={() => setNoticeLang('hi')}>हिन्दी</button></div>
            <blockquote>{noticeText}</blockquote><button className="secondary" onClick={() => navigator.clipboard?.writeText(noticeText)}>Copy draft</button></article>
          <article className="panel scenario-panel"><div className="panel-head"><div><small>06 / EXPLORATORY</small><h2>Indoor air scenario</h2></div><label className="pill warning-pill">MODEL SCENARIO, NOT MEASURED</label></div>
            <div className="scenario-grid">
              <label>Assumed outdoor PM₂.₅ <b>{scenario.outdoor} µg/m³</b><input type="range" min="0" max="500" step="5" value={scenario.outdoor} onChange={e => setScenario({...scenario, outdoor: +e.target.value})}/></label>
              <label>Air changes / hour <b>{scenario.ach.toFixed(1)}</b><input type="range" min="0.1" max="10" step="0.1" value={scenario.ach} onChange={e => setScenario({...scenario, ach: +e.target.value})}/></label>
              <label>Purifier airflow <b>{scenario.cadr} m³/h</b><input type="range" min="0" max="1000" step="25" value={scenario.cadr} onChange={e => setScenario({...scenario, cadr: +e.target.value})}/></label>
              <label>Room volume <b>{scenario.volume} m³</b><input type="range" min="20" max="500" step="10" value={scenario.volume} onChange={e => setScenario({...scenario, volume: +e.target.value})}/></label></div>
            <div className="scenario-result"><small>Illustrative steady state</small><b>{scenarioOut ? `${scenarioOut.estimated_steady_state_pm25} µg/m³` : '—'}</b><span>{scenarioOut?.warning || 'Calculated by the backend from your assumptions. Never used to generate the advisory.'}</span></div></article></section></>}

      {tab === 'history' && <section className="panel"><div className="panel-head"><div><small>APPEND-ONLY RECORDS</small><h2>Action ledger</h2></div><label className="pill">{actions.length} records</label></div>
        {!token && <div className="notice"><Database size={15}/> Enter the coordinator token in the Decision workspace to load the ledger.</div>}
        {token && !actions.length && <div className="empty"><History size={30}/><h3>No recorded actions yet</h3><p>Records persist in DynamoDB and reload after a refresh.</p></div>}
        {actions.map(a => <div className="action-row" key={a.sk}><CheckCircle2/><div><b>{a.action_taken}</b><p>{a.decision} · {a.activity} · advisory then: <b>{CODE_LABEL[a.advisory_snapshot?.decision_code] || '—'}</b>{a.data_status === 'sample' && ' · SAMPLE DATA'}</p>
          {a.note && <p>Note: {a.note}</p>}<small>{fmt(a.created_at)} · rules {a.rules_version} · review {a.review_seconds ?? '—'}s (client-reported)</small>
          <details><summary>Evidence snapshot</summary><pre>{JSON.stringify(a.advisory_snapshot, null, 2)}</pre></details></div></div>)}</section>}

      {tab === 'metrics' && <section className="panel"><div className="panel-head"><div><small>HONEST METRICS</small><h2>Measured outcomes</h2></div></div>
        {!metrics ? <div className="notice"><Database size={15}/> Enter the coordinator token to load metrics.</div> :
          <div className="stats"><article><small>Actions recorded</small><b>{metrics.actions_recorded}</b></article><article><small>Median review time</small><b>{metrics.median_review_seconds_client_reported ?? '—'}s</b></article>
            <article><small>Severe alerts / emails</small><b>{metrics.severe_alerts_detected} / {metrics.escalation_emails_sent}</b></article></div>}
        <p className="footnote">{metrics?.note || 'Only system-observable counts are reported. No health or exposure outcomes are claimed.'}</p></section>}
      <footer><div><b>SchoolAir Ledger</b><small>Decision support, not medical advice or a legal directive</small></div><span>Evidence first. Uncertainty visible. Actions traceable.</span></footer>
    </main></div>;
}
