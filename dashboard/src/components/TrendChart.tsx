import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { ChangeRecord, FetchRun } from '../lib/api';

interface TrendChartProps {
  initialPeriod?: '7D' | '30D' | '90D';
  changes?: ChangeRecord[];
  runs?: FetchRun[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  initialPeriod = '7D',
  changes = [],
  runs = [],
}) => {
  const [activePeriod, setActivePeriod] = useState<'7D' | '30D' | '90D'>(initialPeriod);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Generate real-time points dynamically based on the current date and database activity
  const periodData = useMemo(() => {
    const now = new Date();

    const toLocalKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // ── 7D Generation (7 calendar days ending today, using local timezone) ──
    const sevenDaysPoints: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const targetKey = toLocalKey(d);
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      const changeCount = changes.filter(c => {
        if (!c.detected_at) return false;
        return toLocalKey(new Date(c.detected_at)) === targetKey;
      }).length;

      sevenDaysPoints.push({ label, value: changeCount });
    }
    const peak7D = Math.max(...sevenDaysPoints.map(p => p.value), 0);
    const max7D = Math.max(10, Math.ceil((peak7D + 2) / 2) * 2);

    // ── 30D Generation (10 continuous 3-day windows spanning 30 days) ──
    const thirtyDaysPoints: { label: string; value: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const endDaysAgo = i * 3;
      const startDaysAgo = endDaysAgo + 2;
      const dStart = new Date(now);
      dStart.setDate(now.getDate() - startDaysAgo);
      dStart.setHours(0, 0, 0, 0);

      const dEnd = new Date(now);
      dEnd.setDate(now.getDate() - endDaysAgo);
      dEnd.setHours(23, 59, 59, 999);

      const label = dEnd.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      const count = changes.filter(c => {
        if (!c.detected_at) return false;
        const cd = new Date(c.detected_at);
        return cd >= dStart && cd <= dEnd;
      }).length;

      thirtyDaysPoints.push({ label, value: count });
    }
    const peak30D = Math.max(...thirtyDaysPoints.map(p => p.value), 0);
    const max30D = Math.max(15, Math.ceil((peak30D + 3) / 5) * 5);

    // ── 90D Generation (9 continuous 10-day intervals spanning 90 days) ──
    const ninetyDaysPoints: { label: string; value: number }[] = [];
    for (let i = 8; i >= 0; i--) {
      const endDaysAgo = i * 10;
      const startDaysAgo = endDaysAgo + 9;
      const dStart = new Date(now);
      dStart.setDate(now.getDate() - startDaysAgo);
      dStart.setHours(0, 0, 0, 0);

      const dEnd = new Date(now);
      dEnd.setDate(now.getDate() - endDaysAgo);
      dEnd.setHours(23, 59, 59, 999);

      const month = dEnd.toLocaleDateString('en-US', { month: 'short' });
      const weekNum = Math.min(4, Math.ceil(dEnd.getDate() / 7));
      const label = `${month} W${weekNum}`;

      const count = changes.filter(c => {
        if (!c.detected_at) return false;
        const cd = new Date(c.detected_at);
        return cd >= dStart && cd <= dEnd;
      }).length;

      ninetyDaysPoints.push({ label, value: count });
    }
    const peak90D = Math.max(...ninetyDaysPoints.map(p => p.value), 0);
    const max90D = Math.max(20, Math.ceil((peak90D + 4) / 5) * 5);

    return {
      '7D': {
        subtitle: 'Daily framework update frequency over the last 7 days',
        points: sevenDaysPoints,
        maxValue: max7D,
        ySteps: [0, Math.round(max7D * 0.2), Math.round(max7D * 0.4), Math.round(max7D * 0.6), Math.round(max7D * 0.8), max7D],
      },
      '30D': {
        subtitle: 'Framework update cadence aggregated over the last 30 days',
        points: thirtyDaysPoints,
        maxValue: max30D,
        ySteps: [0, Math.round(max30D * 0.25), Math.round(max30D * 0.5), Math.round(max30D * 0.75), max30D],
      },
      '90D': {
        subtitle: 'Quarterly compliance trajectory & changes across 90 days',
        points: ninetyDaysPoints,
        maxValue: max90D,
        ySteps: [0, Math.round(max90D * 0.2), Math.round(max90D * 0.4), Math.round(max90D * 0.6), Math.round(max90D * 0.8), max90D],
      },
    };
  }, [changes]);

  const currentConfig = periodData[activePeriod];
  const data = currentConfig.points;

  const width = 500;
  const height = 180;
  const paddingX = 32;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxValue = currentConfig.maxValue;
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
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

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
        gap: '14px',
        height: '100%',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
            <TrendingUp size={17} color="var(--accent-primary)" />
            Framework Updates Trend
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {currentConfig.subtitle}
          </div>
        </div>

        {/* Period Selector Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-card)',
            gap: '2px',
          }}
        >
          {(['7D', '30D', '90D'] as const).map((p) => {
            const isActive = activePeriod === p;
            return (
              <button
                key={p}
                onClick={() => {
                  setActivePeriod(p);
                  setHoveredPoint(null);
                }}
                style={{
                  background: isActive ? 'var(--accent-blue)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`trendGradient-${activePeriod}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow-trend" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38BDF8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {currentConfig.ySteps.map((val) => {
            const y = height - paddingY - (val / maxValue) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill with smooth transition */}
          <path d={areaPath} fill={`url(#trendGradient-${activePeriod})`} />

          {/* Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow-trend)"
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
                r={hoveredPoint?.label === p.label ? "6" : "4"}
                fill="var(--bg-card)"
                stroke="var(--accent-primary)"
                strokeWidth={hoveredPoint?.label === p.label ? "3" : "2.5"}
                style={{ transition: 'all 0.15s ease' }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
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
              fill={hoveredPoint?.label === p.label ? "var(--accent-primary)" : "var(--text-muted)"}
              fontSize={points.length > 8 ? "9" : "10"}
              fontFamily="Inter, sans-serif"
              fontWeight={hoveredPoint?.label === p.label ? "600" : "400"}
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
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--accent-primary)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-heading)',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-md)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={12} color="var(--accent-primary)" />
            <span>{hoveredPoint.label}:</span>
            <span style={{ color: 'var(--accent-primary)' }}>{hoveredPoint.value} updates</span>
          </div>
        )}
      </div>
    </div>
  );
};
