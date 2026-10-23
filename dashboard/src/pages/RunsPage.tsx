import React, { useState, useEffect } from 'react';
import { FetchRun, getFetchRuns } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import { FileText, RefreshCw, AlertTriangle, Clock, Terminal } from 'lucide-react';

export const RunsPage: React.FC = () => {
  const [runs, setRuns] = useState<FetchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'no_change' | 'failed'>('all');

  const fetchRunsData = async () => {
    setLoading(true);
    try {
      const data = await getFetchRuns(50);
      setRuns(data);
    } catch (err) {
      console.error('Error fetching runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunsData();
  }, []);

  const filteredRuns = runs.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Pipeline Execution Runs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            Complete audit log of every automated fetch and check job stored in the <code className="mono">fetch_runs</code> table.
          </p>
        </div>

        <button
          onClick={fetchRunsData}
          className="btn btn-secondary"
          style={{ padding: '8px 14px' }}
        >
          <RefreshCw size={14} />
          Refresh Runs
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['all', 'success', 'no_change', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'capitalize' }}
          >
            {s.replace('_', ' ')} ({s === 'all' ? runs.length : runs.filter(r => r.status === s).length})
          </button>
        ))}
      </div>

      {/* Runs Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton height="55px" count={6} borderRadius="8px" />
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <Terminal size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No pipeline runs found</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Framework</th>
                <th>Executed At</th>
                <th>Duration</th>
                <th>Details / Error</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => {
                const isFailed = run.status === 'failed';
                return (
                  <tr
                    key={run.id}
                    style={{
                      backgroundColor: isFailed ? 'rgba(239, 68, 68, 0.05)' : undefined
                    }}
                  >
                    <td>
                      <StatusBadge type="run" value={run.status} />
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{run.framework_name || run.framework_slug}</div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{run.framework_slug}</div>
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(run.started_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td>
                      <span className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {run.duration_ms ? `${run.duration_ms}ms` : '—'}
                      </span>
                    </td>

                    <td>
                      {isFailed ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#F87171',
                          fontSize: '12px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                          <span className="mono" style={{ wordBreak: 'break-all' }}>{run.error_message || 'Fetch failed'}</span>
                        </div>
                      ) : run.metadata && run.metadata.commit_sha ? (
                        <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          commit {String(run.metadata.commit_sha).slice(0, 10)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Completed check cleanly
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
