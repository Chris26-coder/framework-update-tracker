import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  count?: number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  count = 1,
  borderRadius = '6px',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height,
            width,
            borderRadius,
            backgroundColor: 'var(--border-color)',
            opacity: 0.6,
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};
