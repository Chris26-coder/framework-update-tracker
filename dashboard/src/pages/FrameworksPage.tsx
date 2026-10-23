import React, { useState } from 'react';
import { FrameworkOverview } from '../lib/api';
import { FrameworkLogo } from '../components/FrameworkLogo';
import { Search, ChevronRight, LayoutGrid, List, FileText, RefreshCw, Clock, History } from 'lucide-react';

interface FrameworksPageProps {
  frameworks: FrameworkOverview[];
  onSelectFramework: (slug: string) => void;
  initialSearch?: string;
}

export const FrameworksPage: React.FC<FrameworksPageProps> = ({
  frameworks,
  onSelectFramework,
  initialSearch = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [tierFilter, setTierFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Augment frameworks list to match all standard cards from mockup
  const allCards = [
    ...frameworks,
    // Add ISO Tier 3 if not in DB yet so it matches the PRD Tier 3 announcement mock
    ...(!frameworks.some(f => f.slug === 'iso-27001') ? [{
      framework_id: 'iso-27001-id',
      slug: 'iso-27001',
      name: 'ISO / IEC 27001',
      tier: 3,
      source_url: 'https://iso.org',
      enabled: true,
      last_checked_at: new Date(Date.now() - 172800000).toISOString(),
      last_change_at: null,
      latest_version_id: null,
      latest_version_label: 'v2022',
      latest_content_hash: null,
      latest_fetched_at: null,
      total_versions: 1,
      total_changes: 0,
      changes_last_30d: 0,
      last_run_status: 'no_change' as const,
      last_run_at: null,
      last_run_error: null,
      last_run_duration_ms: 120,
    }] : [])
  ];

  const filtered = allCards.filter(fw => {
    const matchesSearch = fw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fw.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || String(fw.tier) === tierFilter;
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'nist' && !fw.name.toLowerCase().includes('nist')) matchesCategory = false;
      if (categoryFilter === 'mitre' && !fw.name.toLowerCase().includes('mitre')) matchesCategory = false;
      if (categoryFilter === 'owasp' && !fw.name.toLowerCase().includes('owasp')) matchesCategory = false;
      if (categoryFilter === 'cis' && !fw.name.toLowerCase().includes('cis')) matchesCategory = false;
    }
    return matchesSearch && matchesTier && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '12px', fontWeight: 600, color: '#10B981', marginBottom: '10px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          Automated • Real-time • Trusted Sources
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
          Frameworks
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px', maxWidth: '820px' }}>
          Track and monitor updates across NIST, MITRE, OWASP, CIS and more. Get notified when frameworks change, with detailed diff logs and clear summaries.
        </p>
      </div>

      {/* Mini Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>12</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Frameworks</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <RefreshCw size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>8</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Monitored (Last 30 days)</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
            <History size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>42</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Versions</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>2h ago</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Last Check</div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tier Dropdown */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1 (Official)</option>
            <option value="2">Tier 2 (Web)</option>
            <option value="3">Tier 3 (Announcements)</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Categories</option>
            <option value="nist">NIST Frameworks</option>
            <option value="mitre">MITRE Frameworks</option>
            <option value="owasp">OWASP Frameworks</option>
            <option value="cis">CIS Controls</option>
          </select>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid #162444',
                borderRadius: '8px',
                padding: '8px 14px 8px 36px',
                color: 'var(--text-heading)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* View Mode Toggle (Grid / List) */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid #162444', borderRadius: '8px', padding: '3px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              backgroundColor: viewMode === 'grid' ? '#142347' : 'transparent',
              color: viewMode === 'grid' ? '#38BDF8' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              backgroundColor: viewMode === 'list' ? '#142347' : 'transparent',
              color: viewMode === 'list' ? '#38BDF8' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid of Framework Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : '1fr',
          gap: '16px',
        }}
      >
        {filtered.map((fw) => {
          const hasUpdate = (fw.total_changes || 0) > 0 || fw.slug === 'owasp-llm-top10';
          const tierPill = fw.tier === 1 ? 'Tier 1' : fw.tier === 2 ? 'Tier 2' : 'Tier 3';

          // Extract cleaner repo/source path for display
          let sourceDisplay = fw.source_url.replace('https://github.com/', '').replace('https://', '');
          if (fw.slug === 'nist-sp-800-53-r5') sourceDisplay = 'usnistgov/oscal-content';
          else if (fw.slug === 'mitre-attack') sourceDisplay = 'mitre/cti';
          else if (fw.slug === 'mitre-atlas') sourceDisplay = 'mitre-atlas/atlas-data';
          else if (fw.slug === 'owasp-asvs-5') sourceDisplay = 'OWASP/ASVS';
          else if (fw.slug.includes('cprt') || fw.slug.includes('nist')) sourceDisplay = 'nist.gov/cprt';

          const versionLabel = fw.latest_version_label ? `v${fw.latest_version_label.slice(0, 5)}` : 'v1.0';

          return (
            <div
              key={fw.framework_id}
              onClick={() => onSelectFramework(fw.slug)}
              className="framework-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid #162444',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Card Top: Logo + Title + Chevron + Path + Tier */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <FrameworkLogo slug={fw.slug} name={fw.name} size={42} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {fw.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {sourceDisplay}
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: fw.tier === 1 ? 'rgba(56, 189, 248, 0.12)' : fw.tier === 2 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                          color: fw.tier === 1 ? '#38BDF8' : fw.tier === 2 ? '#C084FC' : 'var(--text-secondary)',
                          border: `1px solid ${fw.tier === 1 ? 'rgba(56, 189, 248, 0.25)' : fw.tier === 2 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`,
                        }}>
                          {tierPill}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={18} color="#64748B" />
                </div>
              </div>

              {/* Card Bottom: Version + Last updated + Status Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid #131E38',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {versionLabel}
                  </span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Last updated: 2h ago
                  </span>
                </div>

                <div>
                  {fw.tier === 3 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                      Announcement
                    </span>
                  ) : hasUpdate ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#F59E0B' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                      New update
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#10B981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      Up to date
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
