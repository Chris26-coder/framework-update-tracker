import React from 'react';
import { Sparkles, ArrowRight, MinusCircle, PlusCircle } from 'lucide-react';
import { ChangeRecord } from '../lib/api';

interface DiffViewerProps {
  change: ChangeRecord;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ change }) => {
  const fieldChanges = change.field_changes || {};
  const titleDiff = fieldChanges.title;
  const bodyDiff = fieldChanges.body;

  const isAdded = change.change_type === 'added';
  const isRemoved = change.change_type === 'removed';
  const isModified = change.change_type === 'modified';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
      {/* Grounded LLM Summary Banner */}
      {change.llm_summary && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <Sparkles size={16} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#60A5FA', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Grounded Change Summary
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {change.llm_summary}
            </div>
          </div>
        </div>
      )}

      {/* Title Diff */}
      {titleDiff && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Title:</span>
          <span style={{ textDecoration: 'line-through', color: '#F87171' }}>{titleDiff.old}</span>
          <ArrowRight size={14} color="var(--text-muted)" />
          <span style={{ color: '#34D399', fontWeight: 600 }}>{titleDiff.new}</span>
        </div>
      )}

      {/* Side-by-Side Diff Container (FR11) */}
      {isModified && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Side-by-Side Control Diff
          </div>
          <div className="diff-container">
            {/* Old Version */}
            <div className="diff-col diff-old">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>
                <MinusCircle size={14} />
                Previous Version {change.from_version_label ? `(${change.from_version_label.slice(0, 8)})` : ''}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {bodyDiff ? bodyDiff.old : (change.before_text || 'No previous body recorded')}
              </div>
            </div>

            {/* New Version */}
            <div className="diff-col diff-new">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399', fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>
                <PlusCircle size={14} />
                Current Version {change.to_version_label ? `(${change.to_version_label.slice(0, 8)})` : ''}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {bodyDiff ? bodyDiff.new : (change.after_text || 'No new body recorded')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Added Control View */}
      {isAdded && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid var(--color-added-border)',
          borderRadius: '8px',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px'
        }}>
          <div style={{ color: '#34D399', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={14} />
            Newly Added Control Content
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {change.after_text || 'Control added in current version.'}
          </div>
        </div>
      )}

      {/* Removed Control View */}
      {isRemoved && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid var(--color-removed-border)',
          borderRadius: '8px',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px'
        }}>
          <div style={{ color: '#F87171', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MinusCircle size={14} />
            Removed Control Content (from previous version)
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {change.before_text || 'Control deprecated or removed from framework.'}
          </div>
        </div>
      )}
    </div>
  );
};
