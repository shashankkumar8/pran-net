import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { ViewId } from '../types';

interface MitigationReviewViewProps {
  pendingProposal: { sector: string; action: string; reason: string } | null;
  onClearProposal: () => void;
  onSaveAction: (record: { activity: string; decision: string; action_taken: string; note: string }) => Promise<void>;
  token: string;
  onTokenChange: (token: string) => void;
  onNavigate: (view: ViewId) => void;
  savedMessage: string;
}

export default function MitigationReviewView({
  pendingProposal,
  onClearProposal,
  onSaveAction,
  token,
  onTokenChange,
  onNavigate,
  savedMessage,
}: MitigationReviewViewProps) {
  const [activity, setActivity] = useState('outdoor_assembly');
  const [decision, setDecision] = useState('followed');
  const [actionTaken, setActionTaken] = useState(
    pendingProposal?.action || 'Move activity indoors'
  );
  const [note, setNote] = useState(
    pendingProposal?.reason || 'Evidence reviewed; advisory followed for stakeholder safety.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (decision === 'overridden' && note.trim().length < 10) {
      setError('Overriding an advisory requires an explicit reason of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSaveAction({
        activity,
        decision,
        action_taken: actionTaken,
        note,
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
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>HUMAN-IN-THE-LOOP MITIGATION WORKFLOW</small>
          <h2>Mitigation Review & Authorization Queue</h2>
        </div>
        <label className="pill">Audited Authorization</label>
      </div>

      {savedMessage && (
        <div className="notice" role="status" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> {savedMessage}
          <button
            className="secondary"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '11px' }}
            onClick={() => onNavigate('ledger')}
          >
            View in Ledger <ArrowRight size={12} />
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
            <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>PENDING PROPOSAL FROM {pendingProposal.sector.toUpperCase()} SECTOR</small>
            <h4 style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{pendingProposal.action}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{pendingProposal.reason}</p>
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

      <div className="columns">
        {/* Form Panel */}
        <article className="panel">
          <div className="panel-head">
            <div>
              <small>AUTHORIZED SUBMISSION</small>
              <h2>Record Operational Decision</h2>
            </div>
            <label className="pill">Transaction Persistence</label>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Target Activity / Sector Workflow
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="outdoor_assembly">Campus: Outdoor assembly / shift start</option>
                <option value="sports">Campus / Athletics: Strenuous PE & sports</option>
                <option value="routine_outdoor">Municipal / Logistics: Routine outdoor operations</option>
                <option value="indoor_class">Facility: Indoor classroom / warehouse space</option>
              </select>
            </label>

            <label>
              Review Posture
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="followed">Followed advisory (Adopt recommended action)</option>
                <option value="modified">Modified activity (Adjust duration/scope)</option>
                <option value="reviewed">Reviewed advisory (Telemetry logged)</option>
                <option value="overridden">Overrode advisory (Explicit justification mandatory)</option>
              </select>
            </label>

            <label>
              Action Executed
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                maxLength={120}
                required
                placeholder="e.g. Move activity indoors, deploy mist cannons, reschedule shift"
              />
            </label>

            <label>
              Operational Rationale & Justification (Max 500 chars)
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Document localized observations, shelter measures, or override justification…"
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
              {submitting ? 'Recording Action…' : 'Record Action to Ledger'}
            </button>
          </form>
        </article>

        {/* Verification Guardrails Panel */}
        <article className="panel">
          <div className="panel-head">
            <div>
              <small>DECISION AUDIT INTEGRITY</small>
              <h2>Integrity & Verification Protocol</h2>
            </div>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
          </div>

          <div className="proof" style={{ marginBottom: '14px' }}>
            <ShieldCheck size={24} />
            <div>
              <b>Server-Side Evidence Anchoring</b>
              <small>Client does not supply or tamper with the evidence snapshot</small>
            </div>
          </div>

          <p className="muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
            When an authorized decision is submitted, the PRAN-NET backend executes a transactional write:
          </p>

          <ol style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <li>Generates a unique cryptographic <code>Idempotency-Key</code> preventing duplicate submissions.</li>
            <li>Captures the exact station evidence, model parameters, and rules version evaluated at that moment.</li>
            <li>Records the human reviewer decision posture, action taken, and rationale note.</li>
            <li>Persists the composite record into DynamoDB with point-in-time recovery.</li>
          </ol>

          <div className="caution" style={{ marginTop: '16px' }}>
            <p>
              <strong>Zero Automatic Sanctions:</strong> Decisions are submitted by human coordinators. PRAN-NET does not issue autonomous fines, plant closures, or statutory cease-and-desist orders.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
