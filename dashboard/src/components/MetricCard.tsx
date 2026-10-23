import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  trendColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trendColor = 'var(--accent)',
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: trendColor
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {value}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {subtext}
      </div>

      {/* Subtle indicator bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: trendColor,
        opacity: 0.8
      }} />
    </div>
  );
};
