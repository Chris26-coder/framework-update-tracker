import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
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
      {/* Search Input with ⌘ K */}
      <div style={{ position: 'relative', width: '420px', maxWidth: '60%' }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search frameworks, versions, or changes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            borderRadius: '10px',
            padding: '9px 44px 9px 38px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.15s ease, background-color 0.2s ease, color 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-glow)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-card)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '5px',
            padding: '2px 6px',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            fontWeight: 600,
            pointerEvents: 'none',
          }}
        >
          ⌘ K
        </div>
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
