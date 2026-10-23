import React, { useState, useEffect } from 'react';
import { FrameworkLogo } from '../components/FrameworkLogo';
import { FullDiffModal } from '../components/FullDiffModal';
import { ChangeRecord, FrameworkOverview, getChanges } from '../lib/api';
import { Clock, Search, ChevronRight, ExternalLink, Code, Layers, Shield, FileText } from 'lucide-react';

interface ChangeLogPageProps {
  frameworks: FrameworkOverview[];
  onSelectFramework: (slug: string) => void;
  initialFrameworkSlug?: string;
}

export const ChangeLogPage: React.FC<ChangeLogPageProps> = ({
  frameworks,
  onSelectFramework,
  initialFrameworkSlug,
}) => {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [frameworkFilter, setFrameworkFilter] = useState(initialFrameworkSlug || 'all');
  const [changeTypeFilter, setChangeTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialFrameworkSlug) {
      setFrameworkFilter(initialFrameworkSlug);
    }
  }, [initialFrameworkSlug]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getChanges();
        setChanges(data);
      } catch (err) {
        console.error('Error fetching changes:', err);
      }
    }
    loadData();
  }, []);

  // Pre-configured change cards matching Image 3 mockup
  const mockUpdates = [
    {
      id: 'nist-800-53',
      slug: 'nist-sp-800-53-r5',
      name: 'NIST SP 800-53 Rev 5',
      source: 'usnistgov/oscal-content',
      sourceUrl: 'https://github.com/usnistgov/oscal-content',
      changeSignal: 'New commit to catalog file',
      versionFrom: 'v5.1.0',
      versionTo: 'v5.1.1',
      addedCount: 12,
      removedCount: 3,
      modifiedCount: 5,
      timeAgo: '2h ago',
      severity: 'Major Update',
      severityColor: '#818CF8',
      summary: '12 new controls were added, 3 controls were removed, and 5 were modified in NIST SP 800-53 Rev 5. This update includes new controls for AI governance, enhanced supply chain security requirements, and updated control mappings.',
      subtitle: 'Added new controls for AI governance and updated control mappings.',
      keyChanges: [
        { type: 'added', id: 'AC-7(21)', desc: 'New control for AI system inventory and governance.' },
        { type: 'added', id: 'SC-12(7)', desc: 'Added requirement for supply chain risk management.' },
        { type: 'removed', id: 'IR-4(3)', desc: 'Deprecated control for legacy systems.' },
        { type: 'modified', id: 'AU-6(4)', desc: 'Updated logging requirements for cloud environments.' },
        { type: 'modified', id: 'SI-4(8)', desc: 'Enhanced guidance for system monitoring.' },
      ],
    },
    {
      id: 'mitre-attack',
      slug: 'mitre-attack',
      name: 'MITRE ATT&CK',
      source: 'mitre/cti',
      sourceUrl: 'https://github.com/mitre/cti',
      changeSignal: 'New commit or release',
      versionFrom: 'v16.0',
      versionTo: 'v16.1',
      addedCount: 4,
      removedCount: 1,
      modifiedCount: 2,
      timeAgo: '5h ago',
      severity: 'Medium',
      severityColor: '#F59E0B',
      summary: '4 new enterprise attack techniques added, 1 subtechnique deprecated, and 2 techniques updated with additional cloud and identity detection analytics.',
      subtitle: 'Added new techniques for cloud and identity-based attacks.',
      keyChanges: [
        { type: 'added', id: 'T1556.009', desc: 'Modify Authentication Process: Conditional Access Policies.' },
        { type: 'modified', id: 'T1059.001', desc: 'PowerShell: Updated detection guidance for obfuscated scripts.' },
        { type: 'removed', id: 'T1086', desc: 'PowerShell legacy technique superseded by T1059.001.' },
      ],
    },
    {
      id: 'owasp-llm',
      slug: 'owasp-llm-top10',
      name: 'OWASP Top 10 for LLMs',
      source: 'genai.owasp.org',
      sourceUrl: 'https://genai.owasp.org/llm-top-10/',
      changeSignal: 'Page content hash changes',
      versionFrom: 'v1.0',
      versionTo: 'v1.1',
      addedCount: 2,
      removedCount: 0,
      modifiedCount: 1,
      timeAgo: '1d ago',
      severity: 'Low',
      severityColor: '#34D399',
      summary: 'Updated risk documentation and mitigations for prompt injection and sensitive information leakage in GenAI applications.',
      subtitle: 'Updated guidance for prompt injection and data leakage risks.',
      keyChanges: [
        { type: 'added', id: 'LLM01:2025', desc: 'Expanded direct and indirect prompt injection threat scenarios.' },
        { type: 'modified', id: 'LLM02:2025', desc: 'Updated sensitive data disclosure mitigations.' },
      ],
    },
    {
      id: 'cis-controls',
      slug: 'cis-controls-v8',
      name: 'CIS Controls v8.1',
      source: 'cisecurity.org',
      sourceUrl: 'https://www.cisecurity.org/controls/cis-controls-list/',
      changeSignal: 'Version string on page',
      versionFrom: 'v8.1',
      versionTo: 'v8.2',
      addedCount: 6,
      removedCount: 2,
      modifiedCount: 3,
      timeAgo: '2d ago',
      severity: 'Medium',
      severityColor: '#F59E0B',
      summary: 'Refined control descriptions, added guidance for SaaS asset tracking, and streamlined implementation safeguards.',
      subtitle: 'Refined control descriptions and added new implementation notes.',
      keyChanges: [
        { type: 'added', id: 'CIS-1.6', desc: 'Identify and track cloud and serverless assets.' },
        { type: 'modified', id: 'CIS-4.2', desc: 'Establish and maintain secure configurations.' },
      ],
    },
    {
      id: 'nist-171',
      slug: 'nist-sp-800-171-r3',
      name: 'NIST SP 800-171 Rev 3',
      source: 'nist.gov/cprt',
      sourceUrl: 'https://csrc.nist.gov/projects/cprt',
      changeSignal: 'Content hash change',
      versionFrom: 'v3.0',
      versionTo: 'v3.1',
      addedCount: 8,
      removedCount: 1,
      modifiedCount: 4,
      timeAgo: '3d ago',
      severity: 'Medium',
      severityColor: '#F59E0B',
      summary: 'Updated references, clarified requirement language, and aligned with SP 800-53 Rev 5 control baselines.',
      subtitle: 'Updated references and clarified requirement language.',
      keyChanges: [
        { type: 'added', id: '3.1.23', desc: 'Authorize access to security assessment and audit tools.' },
        { type: 'modified', id: '3.5.3', desc: 'Enforce multifactor authentication for non-privileged accounts.' },
      ],
    },
    {
      id: 'mitre-atlas',
      slug: 'mitre-atlas',
      name: 'MITRE ATLAS',
      source: 'mitre-atlas/atlas-data',
      sourceUrl: 'https://github.com/mitre-atlas/atlas-data',
      changeSignal: 'Content version change',
      versionFrom: 'v0.9',
      versionTo: 'v1.0',
      addedCount: 3,
      removedCount: 0,
      modifiedCount: 1,
      timeAgo: '6d ago',
      severity: 'Low',
      severityColor: '#34D399',
      summary: 'New adversarial ML techniques added for LLM jailbreaking and model evasion.',
      subtitle: 'New techniques added for adversary emulation.',
      keyChanges: [
        { type: 'added', id: 'AML.T0054', desc: 'LLM Jailbreak Prompt Generation.' },
      ],
    },
    {
      id: 'owasp-asvs',
      slug: 'owasp-asvs-5',
      name: 'OWASP ASVS 5.0',
      source: 'OWASP/ASVS',
      sourceUrl: 'https://github.com/OWASP/ASVS',
      changeSignal: 'New release tag',
      versionFrom: 'v5.0',
      versionTo: 'v5.1',
      addedCount: 10,
      removedCount: 4,
      modifiedCount: 2,
      timeAgo: '1w ago',
      severity: 'Medium',
      severityColor: '#F59E0B',
      summary: 'Updated verification requirements for authentication and session management in modern SPAs.',
      subtitle: 'Updated verification requirements for authentication and session management.',
      keyChanges: [
        { type: 'added', id: 'V2.10.4', desc: 'Verify passkey and WebAuthn credential attestation.' },
      ],
    },
    {
      id: 'nist-ai-rmf',
      slug: 'nist-ai-rmf',
      name: 'NIST AI RMF',
      source: 'nist.gov/cprt',
      sourceUrl: 'https://csrc.nist.gov/projects/cprt',
      changeSignal: 'Content hash change',
      versionFrom: 'v1.0',
      versionTo: 'v1.1',
      addedCount: 5,
      removedCount: 1,
      modifiedCount: 2,
      timeAgo: '1w ago',
      severity: 'Low',
      severityColor: '#34D399',
      summary: 'Added crosswalk guidance for generative AI risk management and red-teaming methodologies.',
      subtitle: 'Added guidance for generative AI risk management.',
      keyChanges: [
        { type: 'added', id: 'MANAGE-2.4', desc: 'Assess and monitor third-party generative models.' },
      ],
    },
  ];

  const currentInspectorItem = mockUpdates[selectedItemIndex] || mockUpdates[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Breadcrumb + Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <Clock size={13} />
          Change Log
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
          Framework <span style={{ color: '#38BDF8' }}>Change Log</span>
        </h1>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
          Track all detected changes across frameworks with detailed diffs, version history and plain English summaries.
        </p>
      </div>

      {/* Mini Stats Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC' }}>42</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Changes (last 30 days)</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC' }}>12</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Frameworks Updated (last 30 days)</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC' }}>8</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Frameworks with Changes</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC' }}>2h ago</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>NIST SP 800-53 Rev 5</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Frameworks</option>
            {mockUpdates.map(u => (
              <option key={u.id} value={u.slug}>{u.name}</option>
            ))}
          </select>

          <select
            value={changeTypeFilter}
            onChange={(e) => setChangeTypeFilter(e.target.value)}
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Change Types</option>
            <option value="added">Added</option>
            <option value="modified">Modified</option>
            <option value="removed">Removed</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '8px',
              padding: '8px 14px 8px 36px',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Two-Column Split Layout (Mockup Exact Match) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1.05fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Changes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockUpdates.map((item, idx) => {
            const isSelected = selectedItemIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemIndex(idx)}
                style={{
                  backgroundColor: '#0A1224',
                  border: isSelected ? '1.5px solid #38BDF8' : '1px solid #162444',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Row 1: Logo + Name + Version Arrow + Time + Severity Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <FrameworkLogo slug={item.slug} name={item.name} size={32} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                      {item.name}
                    </div>
                    <span className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {item.versionFrom} → {item.versionTo}
                    </span>

                    {/* Change Badges */}
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        +{item.addedCount} added
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        -{item.removedCount} removed
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                        +{item.modifiedCount} modified
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{item.timeAgo}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: item.severityColor,
                        border: `1px solid ${item.severityColor}40`,
                      }}
                    >
                      {item.severity}
                    </span>
                    <ChevronRight size={15} color="#64748B" />
                  </div>
                </div>

                {/* Subtitle / Change excerpt */}
                <div style={{ fontSize: '12px', color: '#94A3B8', paddingLeft: '44px' }}>
                  {item.subtitle}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 6px', fontSize: '12px', color: '#64748B' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#64748B', cursor: 'pointer' }}>&lt;</button>
              <button style={{ backgroundColor: '#1E293B', border: '1px solid #38BDF8', borderRadius: '6px', padding: '4px 8px', color: '#F8FAFC', fontWeight: 600, cursor: 'pointer' }}>1</button>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#94A3B8', cursor: 'pointer' }}>2</button>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#94A3B8', cursor: 'pointer' }}>3</button>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#94A3B8', cursor: 'pointer' }}>4</button>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#94A3B8', cursor: 'pointer' }}>5</button>
              <span style={{ padding: '4px' }}>...</span>
              <button style={{ backgroundColor: '#0A1224', border: '1px solid #162444', borderRadius: '6px', padding: '4px 8px', color: '#64748B', cursor: 'pointer' }}>&gt;</button>
            </div>

            <div>
              Showing 1-8 of 42 changes
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Change Inspector Card */}
        <div
          style={{
            backgroundColor: '#0A1224',
            border: '1px solid #162444',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '88px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FrameworkLogo slug={currentInspectorItem.slug} name={currentInspectorItem.name} size={40} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {currentInspectorItem.name}
                  <a href={currentInspectorItem.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#64748B' }}>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {currentInspectorItem.versionFrom} → {currentInspectorItem.versionTo}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: currentInspectorItem.severityColor,
                    }}
                  >
                    {currentInspectorItem.severity}
                  </span>
                </div>
              </div>
            </div>

            <span style={{ fontSize: '12px', color: '#64748B' }}>{currentInspectorItem.timeAgo}</span>
          </div>

          {/* Source & Signal Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#070E1C',
              borderRadius: '8px',
              border: '1px solid #14213D',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: '#64748B' }}>Source: </span>
              <a href={currentInspectorItem.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 500 }}>
                {currentInspectorItem.source}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
              <span>Change Signal</span>
              <span style={{ color: '#64748B' }}>•</span>
              <span style={{ color: '#CBD5E1', fontFamily: 'monospace', fontSize: '11px' }}>
                {currentInspectorItem.changeSignal}
              </span>
              <Code size={13} color="#64748B" />
            </div>
          </div>

          {/* Change Summary Box (Grounded AI Summary) */}
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.18)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#38BDF8', marginBottom: '8px' }}>
              <FileText size={15} />
              Change Summary
            </div>
            <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>
              {currentInspectorItem.summary}
            </div>
          </div>

          {/* Changes Breakdown */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Changes Breakdown
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>{currentInspectorItem.addedCount}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Added</div>
              </div>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>{currentInspectorItem.removedCount}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Removed</div>
              </div>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F59E0B' }}>{currentInspectorItem.modifiedCount}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Modified</div>
              </div>
            </div>
          </div>

          {/* Key Changes List */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Key Changes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentInspectorItem.keyChanges.map((kc, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    backgroundColor: '#070E1C',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #14213D',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: kc.type === 'added' ? 'rgba(16, 185, 129, 0.15)' : kc.type === 'removed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: kc.type === 'added' ? '#10B981' : kc.type === 'removed' ? '#EF4444' : '#F59E0B',
                      flexShrink: 0,
                    }}
                  >
                    {kc.type}
                  </span>
                  <span className="mono" style={{ fontWeight: 600, color: '#F8FAFC', flexShrink: 0 }}>
                    {kc.id}
                  </span>
                  <span style={{ color: '#94A3B8', lineHeight: 1.4 }}>
                    {kc.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              View Full Change Details
              <ExternalLink size={14} />
            </button>

            <button
              onClick={() => onSelectFramework(currentInspectorItem.slug)}
              className="btn btn-secondary"
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Shield size={14} />
              View Framework
            </button>
          </div>
        </div>
      </div>

      {/* Full Diff Modal */}
      <FullDiffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changes={changes}
        frameworkName={currentInspectorItem.name}
      />
    </div>
  );
};
