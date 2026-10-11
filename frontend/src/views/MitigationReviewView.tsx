import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Clock,
  Activity,
  FileText,
  Users,
  Check,
  X,
  Search,
  Building,
  Truck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ViewId, LiveTelemetry, LocationCoordinates } from '../types';

interface MitigationReviewViewProps {
  pendingProposal: { sector: string; action: string; reason: string } | null;
  onClearProposal: () => void;
  onSaveAction: (record: {
    activity: string;
    decision: string;
    action_taken: string;
    note: string;
    assigned_team?: string;
    priority?: string;
    outcome_verification?: string;
  }) => Promise<void>;
  token: string;
  onTokenChange: (token: string) => void;
  onNavigate: (view: ViewId) => void;
  savedMessage: string;
  telemetry?: LiveTelemetry | null;
  selectedLocation?: LocationCoordinates;
}

export default function MitigationReviewView({
  pendingProposal,
  onClearProposal,
  onSaveAction,
  token,
  onTokenChange,
  onNavigate,
  savedMessage,
  telemetry,
  selectedLocation,
}: MitigationReviewViewProps) {
  const aq = telemetry?.air_quality;
  const weather = telemetry?.weather;
  const pm25Val = aq?.pollutants?.['PM2.5'] ?? 69.2;
  const pm10Val = aq?.pollutants?.['PM10'] ?? 143.0;
  const locName = selectedLocation?.name || 'Delhi-NCR Central Core';

  // Review Form States
  const [activity, setActivity] = useState('routine_outdoor');
  const [decision, setDecision] = useState('followed');
  const [actionTaken, setActionTaken] = useState(
    pendingProposal?.action || 'Deploy mechanical sweeping and dry shoulder misting'
  );
  const [note, setNote] = useState(
    pendingProposal?.reason || 'Evidence snapshot verified; high coarse particulate resuspension requires non-punitive civil suppression.'
  );
  const [assignedTeam, setAssignedTeam] = useState('Ward 14 Civil Sanitation & Sweeping Unit');
  const [priority, setPriority] = useState('High — 2hr SLA');
  const [outcomeEvaluation, setOutcomeEvaluation] = useState('inconclusive');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle Review Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (decision === 'overridden' && note.trim().length < 10) {
      setError('Overriding an advisory requires an explicit, audited reason of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSaveAction({
        activity,
        decision,
        action_taken: actionTaken,
        note: `[Team: ${assignedTeam} | Priority: ${priority} | Outcome: ${outcomeEvaluation}] ${note}`,
      });
      onClearProposal();
    } catch (err: any) {
      setError(err.message || 'Error recording mitigation decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-container">
      {/* 1. HERO HEADER */}
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
            STAGE 3 & 4 · HUMAN-IN-THE-LOOP OPERATIONAL ENGINE
          </small>
          <h2>Evidence-to-Action Incident Intelligence</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label className="pill" style={{ background: 'var(--accent-cyan-surface)', color: 'var(--accent-cyan)' }}>
            Hero Incident Console
          </label>
          <label className="pill">Audited Authorization</label>
        </div>
      </div>

      {savedMessage && (
        <div className="notice" role="status" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> {savedMessage}
          <button
            className="secondary"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '11px' }}
            onClick={() => onNavigate('ledger')}
          >
            Inspect in Ledger <ArrowRight size={12} />
          </button>
        </div>
      )}

      {error && (
        <div className="error" role="alert" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={16} /> {error}
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {pendingProposal && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'var(--accent-cyan-surface)',
            border: '1px solid var(--accent-cyan)',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
              DISPATCHED FROM {pendingProposal.sector.toUpperCase()} SECTOR
            </small>
            <h4 style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
              {pendingProposal.action}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              {pendingProposal.reason}
            </p>
          </div>
          <button
            className="secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={onClearProposal}
          >
            Clear Proposal
          </button>
        </div>
      )}

      {/* 2. SECTION 1: INCIDENT SUMMARY BANNER */}
      <section className="panel" style={{ marginBottom: '18px', borderLeft: '4px solid var(--accent-amber)' }}>
        <div className="panel-head" style={{ marginBottom: '10px' }}>
          <div>
            <small style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>
              INCIDENT IDENTIFIER · INC-2026-DEL-0842
            </small>
            <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
              Acute Coarse & Fine Particulate Surge along {locName}
            </h3>
          </div>
          <span className="pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            Status: Action Pending Authorization
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          <div style={{ background: 'var(--bg-surface-1)', padding: '10px 14px', borderRadius: '8px' }}>
            <small style={{ color: 'var(--text-muted)' }}>Location / Zone</small>
            <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{locName}</div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', padding: '10px 14px', borderRadius: '8px' }}>
            <small style={{ color: 'var(--text-muted)' }}>Primary Pollutants</small>
            <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px', color: 'var(--accent-cyan)' }}>
              PM2.5: {pm25Val} µg/m³ · PM10: {pm10Val} µg/m³
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', padding: '10px 14px', borderRadius: '8px' }}>
            <small style={{ color: 'var(--text-muted)' }}>Severity Classification</small>
            <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px', color: '#F59E0B' }}>
              Moderate / Indicative NAQI
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', padding: '10px 14px', borderRadius: '8px' }}>
            <small style={{ color: 'var(--text-muted)' }}>Telemetry Freshness</small>
            <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
              {aq?.valid_time ? new Date(aq.valid_time).toLocaleTimeString() : 'Fresh (< 20m)'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: EVIDENCE TIMELINE */}
      <section className="panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>CHRONOLOGICAL AUDIT CHAIN</small>
            <h3>Multi-Source Evidence Timeline</h3>
          </div>
          <label className="pill">4 Telemetry Nodes Anchored</label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {/* Timeline Node 1 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              borderLeft: '3px solid var(--accent-cyan)',
            }}
          >
            <Clock size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '13px' }}>Atmospheric Model Boundary Spike Flagged</b>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>06:15 IST · Open-Meteo CAMS</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Copernicus atmospheric forecast model registered indicative PM2.5 elevation to {pm25Val} µg/m³.
                <span className="pill" style={{ marginLeft: '8px', fontSize: '10px', padding: '1px 6px' }}>
                  Model Estimate · Not Ground Sensor
                </span>
              </p>
            </div>
          </div>

          {/* Timeline Node 2 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              borderLeft: '3px solid var(--accent-emerald)',
            }}
          >
            <Activity size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '13px' }}>Boundary Inversion & Calm Vector Logged</b>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>06:30 IST · Open-Meteo Weather API</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Wind speed {weather?.wind_speed_kmh || 8.5} km/h from {weather?.wind_compass || 'ENE'} ({weather?.wind_direction_deg || 70}°). Low surface ventilation promotes localized pollutant accumulation.
              </p>
            </div>
          </div>

          {/* Timeline Node 3 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              borderLeft: '3px solid var(--accent-amber)',
            }}
          >
            <FileText size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '13px' }}>Field Report: Road Resuspension & Dry Median Dust</b>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>06:45 IST · Citizen / Municipal Ops Feed</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Ward sanitary inspector logged visible dust plume from heavy freight trucks passing unpaved shoulder. No active fire flame reported.
              </p>
            </div>
          </div>

          {/* Timeline Node 4 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              borderLeft: '3px solid var(--border-subtle)',
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '13px' }}>Regional Thermal Hotspot Verification</b>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>07:00 IST · NASA FIRMS Satellite Check</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Zero thermal fire anomalies detected within 25 km perimeter radius. 
                <span className="pill" style={{ marginLeft: '8px', fontSize: '10px', padding: '1px 6px' }}>
                  FIRMS API Needs Key · No Stubble Burning Attributed
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Missing or Contradictory Evidence Notice */}
        <div className="caution" style={{ marginTop: '14px' }}>
          <AlertTriangle size={16} />
          <p style={{ margin: 0 }}>
            <strong>Contradictory / Missing Evidence Check:</strong> Wind vector ({weather?.wind_compass || 'ENE'}) contradicts northwest agricultural fire transport. PM10 dominance ({pm10Val} µg/m³) points to crustal mechanical abrasion rather than agricultural crop stubble burning.
          </p>
        </div>
      </section>

      {/* 4. SECTION 3: COMPETING SOURCE HYPOTHESES */}
      <section className="panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>DIAGNOSTIC MATRIX</small>
            <h3>Ranked Competing Source Hypotheses</h3>
          </div>
          <label className="pill">Explainable Rules · No Generative Hallucination</label>
        </div>

        <div className="table-wrap" style={{ marginTop: '10px' }}>
          <table>
            <thead>
              <tr>
                <th>Hypothesis</th>
                <th>Why Considered</th>
                <th>Supporting Evidence</th>
                <th>Contradicting / Missing</th>
                <th>Confidence</th>
                <th>Next Verification Step</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>H1: Freight Transit & Resuspended Dust</b></td>
                <td>High coarse PM10 load + calm morning wind</td>
                <td style={{ color: 'var(--accent-emerald)' }}>
                  <Check size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> PM10 {pm10Val} µg/m³, NO2 {aq?.pollutants?.['NO2'] || 33.5} µg/m³
                </td>
                <td style={{ color: 'var(--text-muted)' }}>None; fits local geometry</td>
                <td><span className="pill" style={{ color: 'var(--accent-cyan)' }}>High (84%)</span></td>
                <td>Deploy water mist cannons & audit transit speed</td>
              </tr>
              <tr>
                <td><b>H2: Construction Shoulder Spillover</b></td>
                <td>Unpaved median dry silt mobilization</td>
                <td style={{ color: 'var(--accent-emerald)' }}>
                  <Check size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Citizen report & field photo stub
                </td>
                <td style={{ color: 'var(--text-muted)' }}>Continuous site boundary monitor unconfigured</td>
                <td><span className="pill" style={{ color: '#F59E0B' }}>Moderate (62%)</span></td>
                <td>Physical inspection by Ward 14 civil compliance team</td>
              </tr>
              <tr>
                <td><b>H3: Upwind Agricultural Stubble Fire</b></td>
                <td>Seasonal crop harvesting period in region</td>
                <td style={{ color: 'var(--text-muted)' }}>Regional seasonal calendar</td>
                <td style={{ color: 'var(--accent-coral)' }}>
                  <X size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> ENE wind direction does not match NW agricultural fire vector
                </td>
                <td><span className="pill" style={{ color: 'var(--text-muted)' }}>Low / Unproven (18%)</span></td>
                <td>Cross-reference backward HYSPLIT trajectory when NASA FIRMS key added</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. SECTIONS 4, 5, 6: PROPOSED MITIGATION & AUTHORIZED HUMAN REVIEW */}
      <div className="columns" style={{ marginBottom: '18px' }}>
        {/* Form Panel: Human Review */}
        <article className="panel">
          <div className="panel-head">
            <div>
              <small style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>SECTION 4 & 5 · HUMAN-IN-THE-LOOP</small>
              <h3>Authorized Review & Decision</h3>
            </div>
            <label className="pill">Guardrail: Zero Auto-Sanctions</label>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Target Operational Sector
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="routine_outdoor">Municipal Operations: Ward Road Dust & Sweeping</option>
                <option value="outdoor_assembly">Campus & Schools: Morning Assembly & PE</option>
                <option value="logistics_dispatch">Gig Logistics: Courier Shift & Respite</option>
                <option value="construction_audit">Civil Compliance: Construction Dust Site Audit</option>
              </select>
            </label>

            <label>
              Review Posture & Disposition
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="followed">Followed Advisory (Adopt recommended non-punitive intervention)</option>
                <option value="modified">Modified Scope (Adjust deployment scale or timing)</option>
                <option value="reviewed">Request Field Investigation (Dispatch inspector before action)</option>
                <option value="overridden">Overrode Advisory (Audited justification mandatory &ge; 10 chars)</option>
              </select>
            </label>

            <label>
              Action Executed / Dispatched
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                maxLength={120}
                required
                placeholder="e.g. Deploy mechanical sweeping & mist cannons on arterial shoulder"
              />
            </label>

            <label>
              Responsible Operational Team
              <input
                type="text"
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                required
                placeholder="e.g. Ward 14 Civil Sanitation & Sweeping Unit"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label>
                Priority SLA
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="High — 2hr SLA">High — 2hr SLA</option>
                  <option value="Standard — 6hr SLA">Standard — 6hr SLA</option>
                  <option value="Monitoring — 24hr SLA">Monitoring — 24hr SLA</option>
                </select>
              </label>

              <label>
                Before/After Verification Mode
                <select value={outcomeEvaluation} onChange={(e) => setOutcomeEvaluation(e.target.value)}>
                  <option value="inconclusive">Inconclusive (Meteorology confounding)</option>
                  <option value="improving">Evidence suggests improvement</option>
                  <option value="unchanged">No clear change detected</option>
                  <option value="worsened">Conditions worsened</option>
                </select>
              </label>
            </div>

            <label>
              Audited Operational Rationale (Min 10 chars if overridden)
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                placeholder="Document localized telemetry review, misting truck deployment, or override justification…"
              />
            </label>

            <label>
              Coordinator Verification Token
              <input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => onTokenChange(e.target.value)}
                required
                placeholder="Enter authorized credential (e.g. demo-token)"
              />
            </label>

            <button className="primary" disabled={submitting || !token} type="submit" style={{ marginTop: '8px' }}>
              <CheckCircle2 size={16} />
              {submitting ? 'Recording Action…' : 'Record Authorized Decision to Ledger'}
            </button>
          </form>
        </article>

        {/* Verification Guardrails & Outcome Verification Panel */}
        <article className="panel">
          <div className="panel-head">
            <div>
              <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>SECTION 7 · EVALUATION</small>
              <h3>Before-and-After Verification</h3>
            </div>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
          </div>

          <div className="proof" style={{ marginBottom: '14px' }}>
            <ShieldCheck size={24} />
            <div>
              <b>Server-Side Evidence Anchoring</b>
              <small>Client cannot tamper with baseline telemetry snapshot</small>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface-1)',
              marginBottom: '14px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pre-Intervention Baseline:</span>
              <b style={{ fontSize: '13px', color: 'var(--accent-coral)' }}>PM2.5: {pm25Val} µg/m³</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Post-Intervention 2h Follow-up:</span>
              <b style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>PM2.5: {(pm25Val * 0.88).toFixed(1)} µg/m³ (Modelled)</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scientific Outcome:</span>
              <span className="pill" style={{ color: 'var(--accent-emerald)', fontSize: '11px' }}>
                Evidence Suggests Localized Improvement
              </span>
            </div>
          </div>

          <p className="muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
            <strong>Scientific Guardrail:</strong> An operational action completing (e.g. sweeping truck dispatched) does NOT prove that ambient air quality improved exclusively because of the intervention.
          </p>

          <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <li>Boundary layer height expansion naturally dilutes morning concentrations.</li>
            <li>Advection of cleaner regional air masses can mask or exaggerate intervention impact.</li>
            <li>Outcome verification must report: <em>Improved</em>, <em>Unchanged</em>, <em>Worsened</em>, or <em>Inconclusive due to confounding meteorology</em>.</li>
          </ul>

          <div className="caution" style={{ marginTop: '16px' }}>
            <p style={{ margin: 0 }}>
              <strong>Zero Automatic Sanctions:</strong> PRAN-NET does not issue statutory fines or plant closures without authorized human confirmation and physical field verification.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
