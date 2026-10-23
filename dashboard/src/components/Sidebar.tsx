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
        backgroundColor: '#070C18',
        borderRight: '1px solid #141F36',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
          <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
            Framework<span style={{ color: '#38BDF8' }}>Tracker</span>
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
                  backgroundColor: isActive ? '#142347' : 'transparent',
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#0F1A30';
                    e.currentTarget.style.color = '#F1F5F9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <span style={{ color: isActive ? '#38BDF8' : '#64748B' }}>
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
                      backgroundColor: '#38BDF8',
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
          backgroundColor: '#0B1324',
          border: '1px solid #162442',
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
        <div style={{ fontSize: '11px', color: '#64748B', paddingLeft: '16px' }}>
          Last checked: {lastCheckedText}
        </div>
      </div>
    </aside>
  );
};
