import React, { useState, useEffect } from 'react';
import { FetchRun, getFetchRuns, triggerManualCheck, getFrameworkOverview, FrameworkOverview } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import { FileText, RefreshCw, AlertTriangle, Clock, Terminal, Play, Loader2, CheckCircle2 } from 'lucide-react';

export const RunsPage: React.FC = () => {
  const [runs, setRuns] = useState<FetchRun[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'no_change' | 'failed'>('all');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRunsData = async () => {
    setLoading(true);
    try {
      const [runsData, fwsData] = await Promise.all([
        getFetchRuns(50),
        getFrameworkOverview(),
      ]);
      setRuns(runsData);
      setFrameworks(fwsData);
    } catch (err) {
      console.error('Error fetching runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunsData();
  }, []);

  const handleRunManualCheck = async () => {
    setIsRunningCheck(true);
    setToastMessage(null);
    try {
      const targetName = selectedSlug
        ? frameworks.find(f => f.slug === selectedSlug)?.name || selectedSlug
        : 'all frameworks';
      
      const res = await triggerManualCheck(selectedSlug);
      if (res.success) {
        setToastMessage({
          type: 'success',
          text: `Manual check completed successfully for ${targetName}!`,
        });
        await fetchRunsData();
      } else {
        setToastMessage({
          type: 'error',
          text: res.error || 'Failed to complete pipeline check.',
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'An error occurred during manual check.',
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const filteredRuns = runs.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
            Pipeline Execution Runs
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            Complete audit log of every automated fetch and check job stored in the <code className="mono">fetch_runs</code> table.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Framework Selector */}
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            disabled={isRunningCheck}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Enabled Frameworks</option>
            {frameworks.map((fw) => (
              <option key={fw.slug} value={fw.slug}>
                {fw.name}
              </option>
            ))}
          </select>

          {/* Run Manual Check Button */}
          <button
            onClick={handleRunManualCheck}
            disabled={isRunningCheck}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: isRunningCheck ? 'var(--bg-hover)' : 'var(--accent-primary)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: isRunningCheck ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
            }}
          >
            {isRunningCheck ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="#FFFFFF" />
                <span>Run Manual Check</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchRunsData}
            disabled={isRunningCheck}
            className="btn btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: toastMessage.type === 'success' ? '#10B981' : '#EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

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
