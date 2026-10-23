import React from 'react';
import { PieChart } from 'lucide-react';

interface CategoryDonutChartProps {
  totalChanges?: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ totalChanges = 42 }) => {
  const categories = [
    { name: 'NIST', count: 14, percent: 33, color: '#3B82F6' },
    { name: 'MITRE', count: 9, percent: 21, color: '#A855F7' },
    { name: 'OWASP', count: 8, percent: 19, color: '#14B8A6' },
    { name: 'CIS', count: 6, percent: 14, color: '#F59E0B' },
    { name: 'Others', count: 5, percent: 12, color: '#64748B' },
  ];

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div
      style={{
        backgroundColor: '#0A1224',
        border: '1px solid #162444',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
          <PieChart size={17} color="#38BDF8" />
          Updates by Framework Category
        </div>
      </div>

      {/* Donut Chart + Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flex: 1 }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {categories.map((cat, i) => {
              const dashLength = (cat.percent / 100) * circumference;
              const dashSpace = circumference - dashLength;
              const strokeDashoffset = -currentOffset;
              currentOffset += dashLength;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${dashSpace}`}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', lineHeight: 1 }}>
              {totalChanges}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Changes
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '140px' }}>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{cat.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', color: '#94A3B8' }}>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{cat.count}</span>
                <span style={{ minWidth: '28px', textAlign: 'right' }}>{cat.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
