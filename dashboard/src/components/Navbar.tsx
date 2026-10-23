import React from 'react';
import { Shield, Activity, GitCommit, FileText, Sun, Moon, Database } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'detail' | 'changelog' | 'runs';
  onSelectTab: (tab: 'overview' | 'detail' | 'changelog' | 'runs') => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', paddingBottom: 0 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onSelectTab('overview')}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
          }}>
            <Shield size={20} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Framework Update Tracker
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
              NIST • MITRE • OWASP • CIS
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onSelectTab('overview')}
            className={`btn ${currentTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '7px 14px', fontSize: '13px' }}
          >
            <Activity size={15} />
            Overview
          </button>

          <button
            onClick={() => onSelectTab('changelog')}
            className={`btn ${currentTab === 'changelog' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '7px 14px', fontSize: '13px' }}
          >
            <GitCommit size={15} />
            Change Log
          </button>

          <button
            onClick={() => onSelectTab('runs')}
            className={`btn ${currentTab === 'runs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '7px 14px', fontSize: '13px' }}
          >
            <FileText size={15} />
            Pipeline Runs
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '11px',
            color: 'var(--text-secondary)'
          }}>
            <Database size={12} color="#10B981" />
            Supabase Live
          </div>

          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            title="Toggle light / dark mode"
            style={{ padding: '8px', borderRadius: '8px' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
