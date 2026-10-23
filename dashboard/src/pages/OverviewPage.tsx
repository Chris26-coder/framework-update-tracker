import React, { useState } from 'react';
import { FrameworkOverview } from '../lib/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { Skeleton } from '../components/Skeleton';
import { Layers, ShieldCheck, GitCommit, Search, ExternalLink, ChevronRight, BellRing } from 'lucide-react';

interface OverviewPageProps {
  frameworks: FrameworkOverview[];
  loading: boolean;
  metrics: {
    totalFrameworks: number;
    totalControls: number;
    totalChanges: number;
    pipelineHealth: number;
  };
  onSelectFramework: (slug: string) => void;
  onSelectTab: (tab: 'overview' | 'detail' | 'changelog' | 'runs') => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  frameworks,
  loading,
  metrics,
  onSelectFramework,
  onSelectTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | '1' | '2'>('all');

  const filteredFrameworks = frameworks.filter(fw => {
    const matchesSearch = fw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fw.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || String(fw.tier) === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Title & Intro */}
      <div>
        <h1>Security Frameworks Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Real-time tracking, automated versioning, and change detection across official security & compliance standards.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <MetricCard
          label="Tracked Frameworks"
          value={metrics.totalFrameworks}
          subtext="8 Tier 1 (Official) • 2 Tier 2 (Web)"
          icon={<Layers size={18} />}
          trendColor="#38BDF8"
        />
        <MetricCard
          label="Ingested Controls"
          value={metrics.totalControls.toLocaleString()}
          subtext="Normalized & hashed in Supabase"
          icon={<ShieldCheck size={18} />}
          trendColor="#10B981"
        />
        <MetricCard
          label="Detected Changes"
          value={metrics.totalChanges}
          subtext="Control-level diffs with LLM summaries"
          icon={<GitCommit size={18} />}
          trendColor="#F59E0B"
        />
        <MetricCard
          label="Pipeline Success Rate"
          value={`${metrics.pipelineHealth}%`}
          subtext="Automated daily scheduled jobs"
          icon={<BellRing size={18} />}
          trendColor="#6366F1"
        />
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTierFilter('all')}
            className={`btn ${tierFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            All Tiers ({frameworks.length})
          </button>
          <button
            onClick={() => setTierFilter('1')}
            className={`btn ${tierFilter === '1' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Tier 1 Official (8)
          </button>
          <button
            onClick={() => setTierFilter('2')}
            className={`btn ${tierFilter === '2' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Tier 2 Web (2)
          </button>
        </div>
      </div>

      {/* Frameworks Grid / Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="64px" count={5} borderRadius="12px" />
        </div>
      ) : filteredFrameworks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No frameworks found</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search or tier filter.</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Framework</th>
                <th>Tier</th>
                <th>Latest Version</th>
                <th>Total Versions</th>
                <th>Total Changes</th>
                <th>Last Checked</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFrameworks.map((fw) => {
                const hasRecentChanges = (fw.total_changes || 0) > 0;
                return (
                  <tr
                    key={fw.framework_id}
                    className="clickable-row"
                    onClick={() => onSelectFramework(fw.slug)}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {fw.name}
                          {hasRecentChanges && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#F59E0B',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                              Changed Recently
                            </span>
                          )}
                        </div>
                        <div className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {fw.slug}
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusBadge type="tier" value={fw.tier} />
                    </td>

                    <td>
                      <span className="mono" style={{
                        fontSize: '13px',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}>
                        {fw.latest_version_label ? fw.latest_version_label.slice(0, 10) : '—'}
                      </span>
                    </td>

                    <td style={{ fontWeight: 500 }}>
                      {fw.total_versions || 0}
                    </td>

                    <td>
                      {fw.total_changes > 0 ? (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTab('changelog');
                          }}
                          style={{
                            fontWeight: 700,
                            color: '#F59E0B',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {fw.total_changes} changes
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {fw.last_checked_at
                        ? new Date(fw.last_checked_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'}
                    </td>

                    <td>
                      <StatusBadge type="run" value={fw.last_run_status || 'success'} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} color="var(--text-muted)" />
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
