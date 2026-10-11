import { CheckCircle2, History, Database, Download } from 'lucide-react';
import { ActionRecord } from '../types';

interface LedgerViewProps {
  actions: ActionRecord[];
  token: string;
}

const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : 'Unavailable');

export default function LedgerView({ actions, token }: LedgerViewProps) {
  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(actions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pran-net-ledger-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>AUDITABLE ACTION HISTORY</small>
          <h2>Action History</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label className="pill">{actions.length} Total Records</label>
          {actions.length > 0 && (
            <button className="secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={exportJson}>
              <Download size={13} /> Export JSON
            </button>
          )}
        </div>
      </div>

      {!token && (
        <div className="notice" style={{ marginBottom: '16px' }}>
          <Database size={15} /> Enter an authorized coordinator token in the Review tab to query historical records.
        </div>
      )}

      {actions.length === 0 ? (
        <div className="panel empty" style={{ padding: '60px 20px' }}>
          <History size={36} color="var(--accent-cyan)" />
          <h3>No Recorded Mitigation Actions Yet</h3>
          <p className="muted">
            When coordinators review and record mitigation decisions, append-only records persist here alongside the exact evidence snapshot evaluated at that moment.
          </p>
        </div>
      ) : (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {actions.map((a) => (
            <div className="action-row" key={a.sk || a.action_id} style={{ display: 'flex', gap: '14px' }}>
              <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <b style={{ fontSize: '14px' }}>{a.action_taken}</b>
                  <span className="pill" style={{ fontSize: '9px' }}>
                    {a.decision.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Workflow: <strong>{a.activity}</strong> · Advisory Decision: <strong>{a.advisory_snapshot?.decision_code || '—'}</strong>
                  {a.data_status === 'sample' && ' · SIMULATED DATA'}
                </p>
                {a.note && (
                  <p style={{ margin: '4px 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    Rationale: {a.note}
                  </p>
                )}
                <small style={{ color: 'var(--text-muted)' }}>
                  Recorded {fmt(a.created_at)} · Rules v{a.rules_version} · Review latency {a.review_seconds ?? '—'}s
                </small>
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '11px', color: 'var(--accent-cyan)' }}>
                    View immutable evidence snapshot
                  </summary>
                  <pre style={{ marginTop: '6px' }}>
                    {JSON.stringify(a.advisory_snapshot, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
