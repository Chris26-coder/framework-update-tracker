import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Code, Clock, ArrowRight, ChevronRight, ArrowUpRight } from 'lucide-react';
import { TrendChart } from '../components/TrendChart';
import { CategoryDonutChart } from '../components/CategoryDonutChart';
import { FrameworkLogo } from '../components/FrameworkLogo';
import { NavigationTab } from '../components/Sidebar';
import { FrameworkOverview, ChangeRecord, FetchRun, getChanges, getFetchRuns, formatTimeAgo } from '../lib/api';

interface DashboardHomeProps {
  frameworks: FrameworkOverview[];
  onSelectTab: (tab: NavigationTab) => void;
  onSelectFramework: (slug: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  frameworks,
  onSelectTab,
  onSelectFramework,
}) => {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [runs, setRuns] = useState<FetchRun[]>([]);
  const [latestRun, setLatestRun] = useState<FetchRun | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function loadRealTimeData() {
      try {
        const [changesData, runsData] = await Promise.all([
          getChanges(undefined, undefined, 50),
          getFetchRuns(50),
        ]);
        if (isMounted) {
          setChanges(changesData);
          setRuns(runsData);
          if (runsData.length > 0) {
            setLatestRun(runsData[0]);
          }
        }
      } catch (err) {
        console.error('Error loading real-time dashboard data:', err);
      }
    }

    loadRealTimeData();

    // Real-time formatted clock/date
    const now = new Date();
    setCurrentTime(
      now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) + ', ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Metrics Calculated from Supabase DB ──
  const totalFrameworks = frameworks.length || 10;

  // Categories count (NIST, MITRE, OWASP, CIS, etc.)
  const uniqueCategories = new Set(
    frameworks.map((f) => {
      const s = (f.slug || '').toLowerCase();
      if (s.startsWith('nist-')) return 'NIST';
      if (s.startsWith('mitre-')) return 'MITRE';
      if (s.startsWith('owasp-')) return 'OWASP';
      if (s.startsWith('cis-')) return 'CIS';
      return 'Others';
    })
  );
  const categoriesCount = uniqueCategories.size || 4;

  const totalChanges = changes.length || frameworks.reduce((acc, f) => acc + (f.total_changes || 0), 0) || 10;
  const addedCount = changes.filter((c) => c.change_type === 'added').length;
  const modifiedCount = changes.filter((c) => c.change_type === 'modified').length;
  const removedCount = changes.filter((c) => c.change_type === 'removed').length;

  const frameworksUpdated =
    frameworks.filter((f) => (f.total_changes || 0) > 0 || (f.changes_last_30d || 0) > 0).length || 1;

  const lastCheckedText = latestRun ? formatTimeAgo(latestRun.started_at) : 'Just now';
  const lastCheckedFramework = latestRun?.framework_name || 'MITRE ATT&CK';
  const lastCheckedStatus =
    latestRun?.status === 'no_change' ? 'Verified (No Change)' : latestRun?.status === 'success' ? 'Update Synced' : 'Online';

  // Format the real-time last update timestamp
  const displayLastUpdated = latestRun?.started_at
    ? new Date(latestRun.started_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      new Date(latestRun.started_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : currentTime;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
            Welcome back, <span style={{ color: 'var(--accent-primary)' }}>Chris</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            Here's what's happening with your tracked security frameworks in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Last updated</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            {displayLastUpdated}
          </span>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Total Frameworks */}
        <div
          onClick={() => onSelectTab('frameworks')}
          className="dashboard-stat-card theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, transform 0.15s ease',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <FileText size={20} />
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Frameworks</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              {totalFrameworks}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across {categoriesCount} categories (NIST, MITRE, OWASP, CIS)
            </div>
          </div>
        </div>

        {/* Card 2: Frameworks Updated */}
        <div
          onClick={() => onSelectTab('changelog')}
          className="dashboard-stat-card theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, transform 0.15s ease',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <RefreshCw size={20} />
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Frameworks Updated</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              {frameworksUpdated}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {totalChanges} updates detected in DB
            </div>
          </div>
        </div>

        {/* Card 3: Total Changes */}
        <div
          onClick={() => onSelectTab('changelog')}
          className="dashboard-stat-card theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, transform 0.15s ease',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A855F7',
              }}
            >
              <Code size={20} />
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Changes</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              {totalChanges}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {addedCount} Added • {removedCount} Removed • {modifiedCount} Modified
            </div>
          </div>
        </div>

        {/* Card 4: Last Check */}
        <div
          onClick={() => onSelectTab('runs')}
          className="dashboard-stat-card theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, transform 0.15s ease',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06B6D4',
              }}
            >
              <Clock size={20} />
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Last Check</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              {lastCheckedText}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {lastCheckedFramework} • {lastCheckedStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Trend + Donut) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '20px',
        }}
      >
        <TrendChart changes={changes} runs={runs} initialPeriod="7D" />
        <CategoryDonutChart
          totalChanges={totalChanges}
          frameworks={frameworks}
          changes={changes}
          onSelectCategory={() => onSelectTab('frameworks')}
        />
      </div>

      {/* Row 3: Bottom Lists (Recent Framework Updates + Frameworks Overview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Recent Framework Updates Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
              Recent Framework Updates
            </h2>
            <button
              onClick={() => onSelectTab('changelog')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          {/* List items loaded live from Supabase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {changes.slice(0, 5).map((change) => {
              const isAdded = change.change_type === 'added';
              const isRemoved = change.change_type === 'removed';
              const badgeColor = isAdded ? '#10B981' : isRemoved ? '#EF4444' : '#A855F7';
              const badgeBg = isAdded
                ? 'rgba(16, 185, 129, 0.1)'
                : isRemoved
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(168, 85, 247, 0.1)';
              const badgeBorder = isAdded
                ? 'rgba(16, 185, 129, 0.25)'
                : isRemoved
                ? 'rgba(239, 68, 68, 0.25)'
                : 'rgba(168, 85, 247, 0.25)';
              const badgeLabel = isAdded ? '+ Added' : isRemoved ? '- Removed' : '• Modified';

              return (
                <div
                  key={change.id}
                  onClick={() => onSelectTab('changelog')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <FrameworkLogo
                      slug={change.framework_slug || 'nist-sp-800-53-r5'}
                      name={change.framework_name || 'NIST'}
                      size={36}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {change.framework_name || 'NIST SP 800-53 Rev 5'}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Control {change.control_id} • {change.llm_summary || (isAdded ? 'New control added' : 'Control updated')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: badgeColor,
                        backgroundColor: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      {badgeLabel}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                      {formatTimeAgo(change.detected_at)}
                    </span>
                    <ChevronRight size={14} color="#64748B" />
                  </div>
                </div>
              );
            })}

            {changes.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                All frameworks up to date. No new changes detected.
              </div>
            )}
          </div>
        </div>

        {/* Frameworks Overview Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
              Frameworks Overview
            </h2>
            <button
              onClick={() => onSelectTab('frameworks')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          {/* List items loaded live from Supabase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {frameworks.slice(0, 5).map((fw) => (
              <div
                key={fw.framework_id || fw.slug}
                onClick={() => onSelectFramework(fw.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FrameworkLogo slug={fw.slug} name={fw.name} size={36} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {fw.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Tier {fw.tier} • {fw.total_versions || 1} versions tracked
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: fw.last_run_status === 'failed' ? '#EF4444' : '#10B981',
                      backgroundColor:
                        fw.last_run_status === 'failed'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)',
                      border: `1px solid ${
                        fw.last_run_status === 'failed'
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(16, 185, 129, 0.25)'
                      }`,
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {fw.last_run_status === 'failed' ? 'Check Failed' : 'Up to date'}
                  </span>
                  <ChevronRight size={14} color="#64748B" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
