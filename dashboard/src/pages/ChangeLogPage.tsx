import React, { useState, useEffect } from 'react';
import { ChangeRecord, FrameworkOverview, getChanges } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { DiffViewer } from '../components/DiffViewer';
import { Skeleton } from '../components/Skeleton';
import { GitCommit, Search, ChevronDown, ChevronUp, Filter, Sparkles } from 'lucide-react';

interface ChangeLogPageProps {
  frameworks: FrameworkOverview[];
  initialFrameworkSlug?: string;
}

export const ChangeLogPage: React.FC<ChangeLogPageProps> = ({
  frameworks,
  initialFrameworkSlug,
}) => {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [selectedChangeType, setSelectedChangeType] = useState<string>('all');
  const [searchControl, setSearchControl] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Set initial framework if passed from detail page
  useEffect(() => {
    if (initialFrameworkSlug) {
      const match = frameworks.find(f => f.slug === initialFrameworkSlug);
      if (match) setSelectedFrameworkId(match.framework_id);
    }
  }, [initialFrameworkSlug, frameworks]);

  useEffect(() => {
    async function fetchChangeData() {
      setLoading(true);
      try {
        const data = await getChanges(
          selectedFrameworkId || undefined,
          selectedChangeType !== 'all' ? selectedChangeType : undefined
        );
        setChanges(data);
        // By default, auto-expand first few changes
        if (data.length > 0) {
          setExpandedIds(new Set(data.slice(0, 3).map(c => c.id)));
        }
      } catch (err) {
        console.error('Error fetching changes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChangeData();
  }, [selectedFrameworkId, selectedChangeType]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredChanges = changes.filter(ch => {
    if (!searchControl) return true;
    return ch.control_id.toLowerCase().includes(searchControl.toLowerCase()) ||
           (ch.llm_summary && ch.llm_summary.toLowerCase().includes(searchControl.toLowerCase()));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title */}
      <div>
        <h1>Security Control Change Log</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Audit trail of additions, modifications, and deprecations across consecutive framework versions with grounded LLM explanations.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Framework Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Framework:</span>
            <select
              value={selectedFrameworkId}
              onChange={(e) => setSelectedFrameworkId(e.target.value)}
              className="search-input"
              style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}
            >
              <option value="">All Frameworks ({frameworks.length})</option>
              {frameworks.map(fw => (
                <option key={fw.framework_id} value={fw.framework_id}>
                  {fw.name} ({fw.total_changes || 0} changes)
                </option>
              ))}
            </select>
          </div>

          {/* Change Type Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'added', 'modified', 'removed'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedChangeType(t)}
                className={`btn ${selectedChangeType === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '5px 12px', fontSize: '12px', textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search control ID..."
            value={searchControl}
            onChange={(e) => setSearchControl(e.target.value)}
            className="search-input"
            style={{ fontSize: '13px', padding: '7px 12px 7px 32px' }}
          />
        </div>
      </div>

      {/* Changes Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="70px" count={5} borderRadius="8px" />
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <GitCommit size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No changes recorded yet</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>
            {selectedFrameworkId ? 'This framework has no detected changes between versions.' : 'No framework updates match the selected filters.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Showing {filteredChanges.length} control-level updates</span>
            <button
              onClick={() => {
                if (expandedIds.size > 0) setExpandedIds(new Set());
                else setExpandedIds(new Set(filteredChanges.map(c => c.id)));
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              {expandedIds.size > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {filteredChanges.map((change) => {
            const isExpanded = expandedIds.has(change.id);
            return (
              <div
                key={change.id}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(change.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <StatusBadge type="change" value={change.change_type} />

                    <span className="mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {change.control_id}
                    </span>

                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      in <strong style={{ color: 'var(--text-secondary)' }}>{change.framework_name || change.framework_slug}</strong>
                    </span>

                    {change.llm_summary && (
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        maxWidth: '480px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        — {change.llm_summary}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(change.detected_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>

                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Content with Side-by-Side Diff (FR11) */}
                {isExpanded && (
                  <div style={{ padding: '16px 20px 20px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <DiffViewer change={change} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
