import React from 'react';

interface FrameworkLogoProps {
  slug?: string;
  name?: string;
  size?: number;
}

export const FrameworkLogo: React.FC<FrameworkLogoProps> = ({ slug = '', name = '', size = 40 }) => {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  let bg = '#1E293B';
  let text = 'FW';
  let iconType = 'text';

  if (s.includes('nist') || n.includes('nist')) {
    bg = '#1D4ED8';
    text = 'NIST';
  } else if (s.includes('mitre') || n.includes('mitre') || s.includes('atlas') || s.includes('attack')) {
    bg = '#991B1B';
    text = 'MITRE';
  } else if (s.includes('owasp') || n.includes('owasp') || s.includes('asvs') || s.includes('llm')) {
    bg = '#4F46E5';
    text = 'OWASP';
    iconType = 'owasp';
  } else if (s.includes('cis') || n.includes('cis')) {
    bg = '#0284C7';
    text = 'cis';
  } else if (s.includes('iso') || n.includes('iso')) {
    bg = '#0369A1';
    text = 'ISO';
  }

  const style: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: size > 32 ? '11px' : '9px',
    letterSpacing: '0.02em',
    flexShrink: 0,
    boxShadow: `0 0 14px ${bg}55`,
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    userSelect: 'none',
  };

  if (iconType === 'owasp') {
    return (
      <div style={style} title={name}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 2 15 12 12 22 9 12" />
        </svg>
      </div>
    );
  }

  return (
    <div style={style} title={name}>
      {text}
    </div>
  );
};
