import React from 'react';
import { LayoutDashboard, Layers, FileText, Settings, ShieldAlert } from 'lucide-react';

export type NavigationTab = 'dashboard' | 'frameworks' | 'changelog' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  lastCheckedText?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  lastCheckedText = '2h ago',
}) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'frameworks' as const, label: 'Frameworks', icon: <Layers size={18} /> },
    { id: 'changelog' as const, label: 'Change Log', icon: <FileText size={18} /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-main)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Top Brand & Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Brand */}
        <div
          onClick={() => onSelectTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            paddingLeft: '8px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.45)',
            }}
          >
            <ShieldAlert size={20} color="#FFFFFF" />
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>
            Framework<span style={{ color: 'var(--accent-primary)' }}>Tracker</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                {item.label}

                {/* Left Active Indicator Bar */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: '8px',
                      bottom: '8px',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
            System Online
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '16px' }}>
          Last checked: {lastCheckedText}
        </div>
      </div>
    </aside>
  );
};
