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
        backgroundColor: '#070C18',
        borderBottom: '1px solid #141F36',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Search Input with ⌘ K */}
      <div style={{ position: 'relative', width: '420px', maxWidth: '60%' }}>
        <Search
          size={16}
          color="#64748B"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search frameworks, versions, or changes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: '#0B1324',
            border: '1px solid #172444',
            borderRadius: '10px',
            padding: '9px 44px 9px 38px',
            color: '#F8FAFC',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3B82F6';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#172444';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#121F3B',
            border: '1px solid #1E2F52',
            borderRadius: '5px',
            padding: '2px 6px',
            fontSize: '10px',
            color: '#94A3B8',
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
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0F1A30';
            e.currentTarget.style.color = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94A3B8';
          }}
          title="Toggle light / dark theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile Avatar (Chris) */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            border: '1.5px solid #334155',
            color: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          }}
          title="Chris (Administrator)"
        >
          C
        </div>
      </div>
    </header>
  );
};
