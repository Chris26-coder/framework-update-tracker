import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
}) => {
  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Left indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
        <span style={{ fontWeight: 500 }}>Live Tracker Connected</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Night / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
        >
          {isDark ? (
            <>
              <Sun size={17} color="#F59E0B" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={17} color="#6366F1" />
              <span>Night Mode</span>
            </>
          )}
        </button>

        {/* User Profile Avatar (Chris) */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1.5px solid var(--border-card)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Chris (Administrator)"
        >
          C
        </div>
      </div>
    </header>
  );
};
