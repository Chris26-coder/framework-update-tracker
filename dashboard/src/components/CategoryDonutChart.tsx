import React, { useState } from 'react';
import { PieChart, Check } from 'lucide-react';

interface CategoryDonutChartProps {
  totalChanges?: number;
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  totalChanges = 42,
  onSelectCategory,
  selectedCategory = null,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categories = [
    { name: 'NIST', slug: 'nist', count: 14, percent: 33, color: '#3B82F6' },
    { name: 'MITRE', slug: 'mitre', count: 9, percent: 21, color: '#A855F7' },
    { name: 'OWASP', slug: 'owasp', count: 8, percent: 19, color: '#14B8A6' },
    { name: 'CIS', slug: 'cis', count: 6, percent: 14, color: '#F59E0B' },
    { name: 'Others', slug: 'others', count: 5, percent: 12, color: '#64748B' },
  ];

  const size = 160;
  const baseStrokeWidth = 20;
  const radius = (size - baseStrokeWidth - 8) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const activeCategory = hoveredIdx !== null ? categories[hoveredIdx] : null;

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(selectedCategory === slug ? null : slug);
    }
  };

  return (
    <div
      className="theme-card"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
          <PieChart size={17} color="var(--accent-primary)" />
          Updates by Framework Category
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Donut Chart + Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flex: 1, flexWrap: 'wrap' }}>
        {/* SVG Interactive Donut */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0, margin: '0 auto' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <filter id="donut-hover-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38BDF8" floodOpacity="0.4" />
              </filter>
            </defs>

            {categories.map((cat, i) => {
              const dashLength = (cat.percent / 100) * circumference;
              const dashSpace = circumference - dashLength;
              const strokeDashoffset = -currentOffset;
              currentOffset += dashLength;

              const isHovered = hoveredIdx === i;
              const isSelected = selectedCategory === cat.slug;
              const currentStroke = isHovered || isSelected ? baseStrokeWidth + 4 : baseStrokeWidth;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={currentStroke}
                  strokeDasharray={`${dashLength} ${dashSpace}`}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.6 : 1,
                  }}
                  filter={isHovered ? 'url(#donut-hover-glow)' : undefined}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => handleCategoryClick(cat.slug)}
                />
              );
            })}
          </svg>

          {/* Interactive Center Info */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              width: '80%',
            }}
          >
            {activeCategory ? (
              <>
                <div style={{ fontSize: '20px', fontWeight: 700, color: activeCategory.color, lineHeight: 1 }}>
                  {activeCategory.count}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {activeCategory.name} ({activeCategory.percent}%)
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>
                  {totalChanges}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Changes
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
          {categories.map((cat, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedCategory === cat.slug;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => handleCategoryClick(cat.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isHovered || isSelected ? 'var(--bg-active)' : 'transparent',
                  border: isSelected ? `1px solid ${cat.color}` : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: cat.color,
                      transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{cat.count}</span>
                  <span style={{ minWidth: '28px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>{cat.percent}%</span>
                  {isSelected && <Check size={12} color={cat.color} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
