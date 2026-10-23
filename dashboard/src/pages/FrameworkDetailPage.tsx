import React, { useState, useEffect } from 'react';
import { FrameworkOverview, FrameworkVersion, Control, getFrameworkVersions, getControlsForVersion } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import { ArrowLeft, ExternalLink, Search, Clock, ShieldCheck, ChevronLeft, ChevronRight, Hash, Layers } from 'lucide-react';

interface FrameworkDetailPageProps {
  framework: FrameworkOverview;
  onBack: () => void;
  onViewChanges: () => void;
}

export const FrameworkDetailPage: React.FC<FrameworkDetailPageProps> = ({
  framework,
  onBack,
  onViewChanges,
}) => {
  const [versions, setVersions] = useState<FrameworkVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [controls, setControls] = useState<Control[]>([]);
  const [totalControls, setTotalControls] = useState<number>(0);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [loadingControls, setLoadingControls] = useState(false);
  const [searchControl, setSearchControl] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    async function fetchVersions() {
      setLoadingVersions(true);
      try {
        const vList = await getFrameworkVersions(framework.framework_id);
        setVersions(vList);
        if (vList.length > 0) {
          setSelectedVersionId(vList[0].id);
        }
      } catch (err) {
        console.error('Error fetching versions:', err);
      } finally {
        setLoadingVersions(false);
      }
    }
    fetchVersions();
  }, [framework.framework_id]);

  useEffect(() => {
    if (!selectedVersionId) return;
    async function fetchControls() {
      setLoadingControls(true);
      try {
        const res = await getControlsForVersion(selectedVersionId, searchControl, page, pageSize);
        setControls(res.controls);
        setTotalControls(res.total);
      } catch (err) {
        console.error('Error fetching controls:', err);
      } finally {
        setLoadingControls(false);
      }
    }
    fetchControls();
  }, [selectedVersionId, searchControl, page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={14} />
          Back to Overview
        </button>
      </div>

      {/* Framework Header Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1>{framework.name}</h1>
              <StatusBadge type="tier" value={framework.tier} />
            </div>
            <div className="mono" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Slug: {framework.slug}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {framework.total_changes > 0 && (
              <button
                onClick={onViewChanges}
                className="btn btn-primary"
                style={{ backgroundColor: '#F59E0B' }}
              >
                View {framework.total_changes} Changes
              </button>
            )}

            <a
              href={framework.source_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Official Source
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Latest Version</div>
            <div className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {framework.latest_version_label || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Content Fingerprint</div>
            <div className="mono" style={{ fontSize: '13px', color: '#60A5FA', marginTop: '2px' }}>
              {framework.latest_content_hash ? `${framework.latest_content_hash.slice(0, 16)}...` : '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Total Versions Stored</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {framework.total_versions || versions.length} recorded
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Pipeline Status</div>
            <div style={{ marginTop: '2px' }}>
              <StatusBadge type="run" value={framework.last_run_status || 'success'} />
            </div>
          </div>
        </div>
      </div>

      {/* Version Selector Timeline */}
      <div>
        <h2 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#3B82F6" />
          Version History ({versions.length})
        </h2>

        {loadingVersions ? (
          <Skeleton height="50px" count={2} />
        ) : (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
            {versions.map((ver, idx) => {
              const isSelected = ver.id === selectedVersionId;
              return (
                <div
                  key={ver.id}
                  onClick={() => {
                    setSelectedVersionId(ver.id);
                    setPage(0);
                  }}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    minWidth: '220px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      v{ver.version_label.slice(0, 10)}
                    </span>
                    {idx === 0 && (
                      <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>Latest</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(ver.fetched_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Hash: {ver.content_hash.slice(0, 8)}...
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls Catalog Explorer */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <h2>
            Controls Catalog ({totalControls.toLocaleString()} items)
          </h2>

          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search by ID or keyword..."
              value={searchControl}
              onChange={(e) => {
                setSearchControl(e.target.value);
                setPage(0);
              }}
              className="search-input"
              style={{ fontSize: '13px', padding: '8px 12px 8px 32px' }}
            />
          </div>
        </div>

        {loadingControls ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton height="70px" count={5} />
          </div>
        ) : controls.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <Layers size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <div>No controls matching "{searchControl}"</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {controls.map((ctrl) => (
              <div key={ctrl.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                  <span className="mono" style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#38BDF8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}>
                    {ctrl.control_id}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ctrl.title || 'Untitled Control'}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {ctrl.body || 'No description body available.'}
                </div>

                {ctrl.metadata && Object.keys(ctrl.metadata).length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {Object.entries(ctrl.metadata).slice(0, 4).map(([k, v]) => (
                      <span key={k} style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}>
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalControls > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalControls)} of {totalControls}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px' }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    disabled={(page + 1) * pageSize >= totalControls}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px' }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
