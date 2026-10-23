import React from 'react';
import { FileText, RefreshCw, Code, Clock, ArrowRight, ChevronRight, ArrowUpRight } from 'lucide-react';
import { TrendChart } from '../components/TrendChart';
import { CategoryDonutChart } from '../components/CategoryDonutChart';
import { FrameworkLogo } from '../components/FrameworkLogo';
import { NavigationTab } from '../components/Sidebar';
import { FrameworkOverview } from '../lib/api';

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
            Welcome back, <span style={{ color: 'var(--accent-primary)' }}>Chris</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            Here's what's happening with your tracked security frameworks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Last updated</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            26 Aug 2026, 14:32
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
              12
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across 5 categories
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
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Frameworks Updated</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              8
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              In the last 30 days
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
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Changes</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              42
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Added • Removed • Modified
            </div>
          </div>
        </div>

        {/* Card 4: Last Check */}
        <div
          className="dashboard-stat-card theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
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
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Last Check</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
              2h ago
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              NIST SP 800-53 Rev 5
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
        <TrendChart />
        <CategoryDonutChart totalChanges={42} />
      </div>

      {/* Row 3: Bottom Lists (Recent Framework Updates + Frameworks Overview) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}
      >
        {/* Recent Framework Updates Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid #162444',
            borderRadius: '14px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
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

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Item 1: NIST 800-53 */}
            <div
              onClick={() => onSelectTab('changelog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="nist-sp-800-53-r5" name="NIST" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    NIST SP 800-53 Rev 5
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    usnistgov/oscal-content
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '9999px' }}>
                    + 3 added
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '2px 8px', borderRadius: '9999px' }}>
                    - 1 removed
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>2h ago</span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Item 2: MITRE ATT&CK */}
            <div
              onClick={() => onSelectTab('changelog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="mitre-attack" name="MITRE" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    MITRE ATT&CK
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    mitre/cti
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#A855F7', backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '2px 8px', borderRadius: '9999px' }}>
                  • 5 modified
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>5h ago</span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Item 3: OWASP Top 10 for LLMs */}
            <div
              onClick={() => onSelectTab('changelog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="owasp-llm-top10" name="OWASP" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    OWASP Top 10 for LLMs
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    genai.owasp.org
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '9999px' }}>
                    + 2 added
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'rgba(100, 116, 139, 0.1)', border: '1px solid #1E293B', padding: '2px 8px', borderRadius: '9999px' }}>
                    - 0 removed
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>1d ago</span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Item 4: CIS Controls v8.1 */}
            <div
              onClick={() => onSelectTab('changelog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="cis-controls-v8" name="CIS" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    CIS Controls v8.1
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    cisecurity.org
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '2px 8px', borderRadius: '9999px' }}>
                  • 1 modified
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>2d ago</span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Item 5: ISO 27001 */}
            <div
              onClick={() => onSelectTab('changelog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="iso" name="ISO" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    ISO / IEC 27001
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    iso.org
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', backgroundColor: 'rgba(148, 163, 184, 0.1)', border: '1px solid #1E293B', padding: '2px 8px', borderRadius: '9999px' }}>
                  • Announcement
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>3d ago</span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>
          </div>
        </div>

        {/* Frameworks Overview Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid #162444',
            borderRadius: '14px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
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

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Row 1: NIST SP 800-53 */}
            <div
              onClick={() => onSelectFramework('nist-sp-800-53-r5')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="nist-sp-800-53-r5" name="NIST" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    NIST SP 800-53 Rev 5
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Security Controls
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '3px 10px', borderRadius: '6px' }}>
                  Up to date
                </span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Row 2: MITRE ATT&CK */}
            <div
              onClick={() => onSelectFramework('mitre-attack')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="mitre-attack" name="MITRE" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    MITRE ATT&CK
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Threat Intelligence
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '3px 10px', borderRadius: '6px' }}>
                  Up to date
                </span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Row 3: OWASP Top 10 for LLMs */}
            <div
              onClick={() => onSelectFramework('owasp-llm-top10')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="owasp-llm-top10" name="OWASP" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    OWASP Top 10 for LLMs
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Application Security
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 10px', borderRadius: '6px' }}>
                  • Updated
                </span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Row 4: CIS Controls v8.1 */}
            <div
              onClick={() => onSelectFramework('cis-controls-v8')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="cis-controls-v8" name="CIS" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    CIS Controls v8.1
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Security Controls
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '3px 10px', borderRadius: '6px' }}>
                  Up to date
                </span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>

            {/* Row 5: NIST AI RMF */}
            <div
              onClick={() => onSelectFramework('nist-ai-rmf')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid #14213D',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FrameworkLogo slug="nist-ai-rmf" name="NIST" size={36} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    NIST AI RMF
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    AI Risk Management
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '3px 10px', borderRadius: '6px' }}>
                  Up to date
                </span>
                <ChevronRight size={14} color="#64748B" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
