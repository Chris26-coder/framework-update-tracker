import React from 'react';
import { X, Sparkles, ArrowRight, MinusCircle, PlusCircle } from 'lucide-react';
import { ChangeRecord } from '../lib/api';

interface FullDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: ChangeRecord[];
  frameworkName?: string;
}

export const FullDiffModal: React.FC<FullDiffModalProps> = ({
  isOpen,
  onClose,
  changes,
  frameworkName = 'NIST SP 800-53 Rev 5',
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0B1325',
          border: '1px solid #1A2846',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #162444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>
              Full Control Diff Details — {frameworkName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Side-by-side verification of modified controls, requirements prose, and additions
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body with Scrollable Diffs */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {changes.map((ch) => {
            const fieldChanges = ch.field_changes || {};
            const titleDiff = fieldChanges.title;
            const bodyDiff = fieldChanges.body;

            return (
              <div
                key={ch.id}
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid #162444',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#38BDF8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                      }}
                    >
                      {ch.control_id}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: ch.change_type === 'added' ? 'rgba(16, 185, 129, 0.15)' : ch.change_type === 'removed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: ch.change_type === 'added' ? '#10B981' : ch.change_type === 'removed' ? '#EF4444' : '#F59E0B',
                      }}
                    >
                      {ch.change_type}
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(ch.detected_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Grounded Summary */}
                {ch.llm_summary && (
                  <div
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Sparkles size={15} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>{ch.llm_summary}</div>
                  </div>
                )}

                {/* Title Diff */}
                {titleDiff && (
                  <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Title:</span>
                    <span style={{ textDecoration: 'line-through', color: '#F87171' }}>{titleDiff.old}</span>
                    <ArrowRight size={14} color="#64748B" />
                    <span style={{ color: '#34D399', fontWeight: 600 }}>{titleDiff.new}</span>
                  </div>
                )}

                {/* Side-by-Side Diff */}
                {ch.change_type === 'modified' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '6px' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 600, fontSize: '11px', marginBottom: '6px' }}>
                        <MinusCircle size={13} />
                        Previous Version Text
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#CBD5E1' }}>
                        {bodyDiff ? bodyDiff.old : (ch.before_text || 'No previous text')}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399', fontWeight: 600, fontSize: '11px', marginBottom: '6px' }}>
                        <PlusCircle size={13} />
                        Current Version Text
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-heading)' }}>
                        {bodyDiff ? bodyDiff.new : (ch.after_text || 'No new text')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #162444', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
