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

  // Fallback demo changes if API changes list is empty
  const displayChanges = changes.length > 0 ? changes : [
    {
      id: 'demo-1',
      version_id: 'v1',
      control_id: 'AC-7(21)',
      change_type: 'added' as const,
      detected_at: new Date().toISOString(),
      llm_summary: 'Control AC-7(21) was newly added to mandate AI system inventory tracking and governance authorization.',
      field_changes: {
        title: { old: '', new: 'AI System Inventory and Governance' },
        body: { old: '', new: 'Organizations must maintain an authoritative inventory of all machine learning models, autonomous systems, and training data pipelines operating within the production environment.' },
      },
    },
    {
      id: 'demo-2',
      version_id: 'v1',
      control_id: 'SC-12(7)',
      change_type: 'modified' as const,
      detected_at: new Date(Date.now() - 7200000).toISOString(),
      llm_summary: 'Control SC-12(7): Organizations can now establish additional security and operational requirements, including supply chain risk evaluations and developer notification timing.',
      field_changes: {
        title: { old: 'Cryptographic Module Authentication', new: 'Cryptographic Module Authentication and Supply Chain Integrity' },
        body: {
          old: 'Authenticate cryptographic modules in accordance with applicable federal standards and organizational policies.',
          new: 'Authenticate cryptographic modules in accordance with applicable federal standards, verify supply chain integrity for third-party firmware, and establish explicit developer notification windows.',
        },
      },
    },
  ];

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
        className="theme-card"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-card)',
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
          {displayChanges.map((ch) => {
            const fieldChanges = ch.field_changes || {};
            const titleDiff = fieldChanges.title;
            const bodyDiff = fieldChanges.body;

            return (
              <div
                key={ch.id}
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-card)',
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
                        color: 'var(--accent-primary)',
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
                    <Sparkles size={15} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>{ch.llm_summary}</div>
                  </div>
                )}

                {/* Title Diff */}
                {titleDiff && titleDiff.old !== titleDiff.new && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Title:</span>
                    <span style={{ textDecoration: 'line-through', color: '#EF4444' }}>{titleDiff.old || '(empty)'}</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <span style={{ color: '#10B981', fontWeight: 600 }}>{titleDiff.new}</span>
                  </div>
                )}

                {/* Side by Side Body Diff */}
                {bodyDiff ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '6px' }}>
                    {/* Previous Column */}
                    <div
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
                        <MinusCircle size={13} />
                        Previous Version (v5.1.0)
                      </div>
                      <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {bodyDiff.old || '(No previous content)'}
                      </div>
                    </div>

                    {/* New Column */}
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.04)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '8px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#10B981', marginBottom: '8px' }}>
                        <PlusCircle size={13} />
                        Updated Version (v5.1.1)
                      </div>
                      <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>
                        {bodyDiff.new || '(Deleted content)'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Requirement statement unchanged.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-card-subtle)',
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close Diff Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
