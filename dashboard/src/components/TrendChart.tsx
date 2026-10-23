import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
  period?: '7D' | '30D' | '90D';
}

export const TrendChart: React.FC<TrendChartProps> = () => {
  const [activePeriod, setActivePeriod] = useState<'7D' | '30D' | '90D'>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Data points matching the mockup (7 days: 20 Aug to 26 Aug)
  const data = [
    { label: '20 Aug', value: 1 },
    { label: '21 Aug', value: 5 },
    { label: '22 Aug', value: 3 },
    { label: '23 Aug', value: 5 },
    { label: '24 Aug', value: 4 },
    { label: '25 Aug', value: 7 },
    { label: '26 Aug', value: 9 },
  ];

  const width = 500;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxValue = 10;
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const generatePath = () => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpY1 = p0.y;
      const cpX2 = p1.x - (p1.x - p0.x) * 0.45;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = generatePath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div
      style={{
        backgroundColor: '#0A1224',
        border: '1px solid #162444',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
            <TrendingUp size={17} color="#38BDF8" />
            Framework Updates Trend
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Number of frameworks updated over the last 7 days
          </div>
        </div>

        {/* Period Selector Pills */}
        <div style={{ display: 'flex', backgroundColor: '#070D1C', borderRadius: '8px', padding: '3px', border: '1px solid #162444' }}>
          {(['7D', '30D', '90D'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              style={{
                background: activePeriod === p ? '#1D4ED8' : 'transparent',
                color: activePeriod === p ? '#FFFFFF' : '#64748B',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 2, 4, 6, 8, 10].map((val) => {
            const y = height - paddingY - (val / maxValue) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#14213D"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#0A1224"
                stroke="#38BDF8"
                strokeWidth="2.5"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill="transparent"
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              fill="#64748B"
              fontSize="10"
              fontFamily="Inter, sans-serif"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#1E293B',
              border: '1px solid #38BDF8',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#F8FAFC',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {hoveredPoint.label}: {hoveredPoint.value} updates
          </div>
        )}
      </div>
    </div>
  );
};
