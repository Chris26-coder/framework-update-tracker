import React, { useState, useEffect } from 'react';
import { FrameworkLogo } from '../components/FrameworkLogo';
import { FullDiffModal } from '../components/FullDiffModal';
import { ChangeRecord, FrameworkOverview, getChanges } from '../lib/api';
import { Clock, Search, ChevronRight, ExternalLink, Code, Layers, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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

  // Pre-configured change records matching the PRD and UI mockups
  const allUpdates = [
    {
      id: 'nist-800-53',
      slug: 'nist-sp-800-53-r5',
      name: 'NIST SP 800-53 Rev 5',
      source: 'usnistgov/oscal-content',
      sourceUrl: 'https://github.com/usnistgov/oscal-content',
      changeSignal: 'New commit to catalog file',
      versionFrom: 'v5.1.0',
      versionTo: 'v5.1.1',
      addedCount: 3,
      removedCount: 0,
      modifiedCount: 5,
      timeAgo: '2h ago',
      daysAgo: 0,
      severity: 'Major Update',
      severityColor: '#818CF8',
      summary: 'Control SA-4 and SI-2 updated to establish additional developer responsibilities and controlled patching environments. New controls SA-15.13, SA-24, and SI-2.7 added to catalog.',
      subtitle: 'Added new controls for AI governance and updated control mappings.',
      keyChanges: [
        { type: 'added', id: 'SA-15.13', desc: 'Critical Software Analysis and developer verification.' },
        { type: 'added', id: 'SA-24', desc: 'Hardware, Software, and Firmware Authenticity.' },
        { type: 'added', id: 'SI-2.7', desc: 'Automated Flaw Remediation testing and verification.' },
        { type: 'modified', id: 'SA-4', desc: 'Organizations can now establish additional security and operational requirements.' },
        { type: 'modified', id: 'SI-2', desc: 'Controlled patching environment and verification of software updates.' },
        { type: 'modified', id: 'SI-2.5', desc: 'Implementation of staggered deployment strategy for flaw remediation.' },
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
      daysAgo: 0,
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
      daysAgo: 1,
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
      sourceUrl: 'https://www.cisecurity.org/controls',
      changeSignal: 'Document revision',
      versionFrom: 'v8.0',
      versionTo: 'v8.1',
      addedCount: 3,
      removedCount: 0,
      modifiedCount: 2,
      timeAgo: '2d ago',
      daysAgo: 2,
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
      daysAgo: 3,
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
      daysAgo: 6,
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
      daysAgo: 7,
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
      timeAgo: '12d ago',
      daysAgo: 12,
      severity: 'Low',
      severityColor: '#34D399',
      summary: 'Added crosswalk guidance for generative AI risk management and red-teaming methodologies.',
      subtitle: 'Added guidance for generative AI risk management.',
      keyChanges: [
        { type: 'added', id: 'MANAGE-2.4', desc: 'Assess and monitor third-party generative models.' },
      ],
    },
  ];

  // Apply filters
  const filteredUpdates = allUpdates.filter((item) => {
    // 1. Framework filter
    if (frameworkFilter !== 'all' && item.slug !== frameworkFilter) return false;

    // 2. Change Type filter
    if (changeTypeFilter === 'added' && item.addedCount === 0) return false;
    if (changeTypeFilter === 'modified' && item.modifiedCount === 0) return false;
    if (changeTypeFilter === 'removed' && item.removedCount === 0) return false;

    // 3. Time filter
    if (timeFilter === '7d' && item.daysAgo > 7) return false;
    if (timeFilter === '30d' && item.daysAgo > 30) return false;
    if (timeFilter === '90d' && item.daysAgo > 90) return false;

    // 4. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesSummary = item.summary.toLowerCase().includes(q);
      const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchesKey = item.keyChanges.some(
        (k) => k.id.toLowerCase().includes(q) || k.desc.toLowerCase().includes(q)
      );
      if (!matchesName && !matchesSummary && !matchesSubtitle && !matchesKey) return false;
    }

    return true;
  });

  // Current inspector target
  const currentInspectorItem = filteredUpdates[selectedItemIndex] || filteredUpdates[0] || allUpdates[0];

  // Pagination calculation
  const totalPages = Math.ceil(filteredUpdates.length / pageSize) || 1;
  const paginatedUpdates = filteredUpdates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectFrameworkItem = (idxInPage: number) => {
    const globalIdx = (currentPage - 1) * pageSize + idxInPage;
    setSelectedItemIndex(globalIdx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Breadcrumb + Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Clock size={13} />
          Change Log
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
          Framework <span style={{ color: 'var(--accent-primary)' }}>Change Log</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Track all detected changes across frameworks with detailed diffs, version history and plain-English AI summaries.
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
        <div className="theme-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>
              {changes.length > 0 ? changes.length : 10}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Changes (last 30 days)</div>
          </div>
        </div>

        <div className="theme-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>{filteredUpdates.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Matching Filtered Results</div>
          </div>
        </div>

        <div className="theme-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
            <Code size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>
              {changes.length > 0 ? changes.filter(c => c.change_type === 'modified').length : 7}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modified Controls</div>
          </div>
        </div>

        <div className="theme-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>
              {changes.length > 0 ? changes.filter(c => c.change_type === 'added').length : 3}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Added Controls</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Framework Filter */}
          <select
            value={frameworkFilter}
            onChange={(e) => {
              setFrameworkFilter(e.target.value);
              setSelectedItemIndex(0);
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Frameworks</option>
            {allUpdates.map((u) => (
              <option key={u.id} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Change Type Filter */}
          <select
            value={changeTypeFilter}
            onChange={(e) => {
              setChangeTypeFilter(e.target.value);
              setSelectedItemIndex(0);
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Change Types</option>
            <option value="added">Added (+)</option>
            <option value="modified">Modified (~)</option>
            <option value="removed">Removed (-)</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value);
              setSelectedItemIndex(0);
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Reset button if filtered */}
          {(frameworkFilter !== 'all' || changeTypeFilter !== 'all' || timeFilter !== '30d' || searchQuery) && (
            <button
              onClick={() => {
                setFrameworkFilter('all');
                setChangeTypeFilter('all');
                setTimeFilter('30d');
                setSearchQuery('');
                setSelectedItemIndex(0);
                setCurrentPage(1);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search changes or control IDs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedItemIndex(0);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '8px 14px 8px 36px',
              color: 'var(--text-heading)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Two-Column Split Layout */}
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
          {filteredUpdates.length === 0 ? (
            <div
              className="theme-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <AlertCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                No changes match your active filters
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Try resetting your search query or selecting "All Frameworks".
              </div>
            </div>
          ) : (
            paginatedUpdates.map((item, idxInPage) => {
              const globalIdx = (currentPage - 1) * pageSize + idxInPage;
              const isSelected = selectedItemIndex === globalIdx;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFrameworkItem(idxInPage)}
                  className="theme-card"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-card)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 20px var(--accent-glow)' : 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {/* Row 1: Logo + Name + Version Arrow + Time + Severity Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <FrameworkLogo slug={item.slug} name={item.name} size={32} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {item.name}
                      </div>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {item.versionFrom} → {item.versionTo}
                      </span>

                      {/* Change Badges */}
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {item.addedCount > 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            +{item.addedCount} added
                          </span>
                        )}
                        {item.removedCount > 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            -{item.removedCount} removed
                          </span>
                        )}
                        {item.modifiedCount > 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                            ~{item.modifiedCount} modified
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.timeAgo}</span>
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
                      <ChevronRight size={15} color="var(--text-muted)" />
                    </div>
                  </div>

                  {/* Subtitle / Change excerpt */}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '44px' }}>
                    {item.subtitle}
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination Controls */}
          {filteredUpdates.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-heading)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      backgroundColor: currentPage === p ? 'var(--accent-blue)' : 'var(--bg-card)',
                      border: currentPage === p ? '1px solid var(--accent-primary)' : '1px solid var(--border-card)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      color: currentPage === p ? '#FFFFFF' : 'var(--text-secondary)',
                      fontWeight: currentPage === p ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-heading)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  &gt;
                </button>
              </div>

              <div>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredUpdates.length)} of {filteredUpdates.length} changes
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Change Inspector Card */}
        <div
          className="theme-card"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '88px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FrameworkLogo slug={currentInspectorItem.slug} name={currentInspectorItem.name} size={40} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {currentInspectorItem.name}
                  <a href={currentInspectorItem.sourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
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

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentInspectorItem.timeAgo}</span>
          </div>

          {/* Source & Signal Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Source: </span>
              <a href={currentInspectorItem.sourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
                {currentInspectorItem.source}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span>Signal</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '11px' }}>
                {currentInspectorItem.changeSignal}
              </span>
              <Code size={13} color="var(--text-muted)" />
            </div>
          </div>

          {/* Grounded AI Summary Box */}
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid var(--accent-glow)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>
              <Shield size={16} color="var(--accent-primary)" />
              Grounded AI Summary (Google Gemini)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {currentInspectorItem.summary}
            </div>
          </div>

          {/* Diff Breakdown Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>+{currentInspectorItem.addedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Added Controls</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#EF4444' }}>-{currentInspectorItem.removedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Removed</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>~{currentInspectorItem.modifiedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Modified</div>
            </div>
          </div>

          {/* Key Changes List */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '10px' }}>
              Key Modified & Added Controls:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentInspectorItem.keyChanges.map((change, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: change.type === 'added' ? '#10B981' : change.type === 'removed' ? '#EF4444' : '#F59E0B',
                      backgroundColor: change.type === 'added' ? 'rgba(16, 185, 129, 0.1)' : change.type === 'removed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {change.id}
                  </span>
                  <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{change.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-blue)',
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
