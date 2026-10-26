import React, { useState, useEffect } from 'react';
import { Settings, Bell, Database, Trash2, ChevronRight, Sliders, Moon, Sun, Monitor, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { FrameworkLogo } from '../components/FrameworkLogo';

interface SettingsPageProps {
  themeMode: 'dark' | 'light' | 'system';
  onSelectThemeMode: (mode: 'dark' | 'light' | 'system') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  themeMode,
  onSelectThemeMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notifications' | 'sources' | 'system'>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persisted settings
  const [defaultView, setDefaultView] = useState(() => localStorage.getItem('fw_default_view') || 'All Frameworks');
  const [itemsPerPage, setItemsPerPage] = useState(() => localStorage.getItem('fw_items_per_page') || '10');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('fw_date_format') || 'DD MMM YYYY (e.g. 26 Oct 2026)');
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('fw_timezone') || 'Asia/Kolkata (GMT+5:30)');
  const [language, setLanguage] = useState(() => localStorage.getItem('fw_language') || 'English');
  const [retentionPolicy, setRetentionPolicy] = useState(() => localStorage.getItem('fw_retention') || 'Keep Forever (Append-Only)');
  const [dataCompression, setDataCompression] = useState(() => localStorage.getItem('fw_compression') !== 'false');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('fw_email_notif') !== 'false');
  const [newFrameworkUpdates, setNewFrameworkUpdates] = useState(() => localStorage.getItem('fw_new_fw_notif') !== 'false');
  const [criticalOnly, setCriticalOnly] = useState(() => localStorage.getItem('fw_critical_only') === 'true');
  const [summaryFrequency, setSummaryFrequency] = useState(() => localStorage.getItem('fw_summary_freq') || 'Daily');

  // Framework sources toggle state
  const [sources, setSources] = useState(() => {
    const saved = localStorage.getItem('fw_sources_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 'nist', name: 'NIST', count: 5, active: true, slug: 'nist-sp-800-53-r5' },
      { id: 'mitre', name: 'MITRE', count: 2, active: true, slug: 'mitre-attack' },
      { id: 'owasp', name: 'OWASP', count: 2, active: true, slug: 'owasp-llm-top10' },
      { id: 'cis', name: 'CIS', count: 1, active: true, slug: 'cis-controls-v8' },
      { id: 'others', name: 'Others', count: 2, active: true, slug: 'iso' },
    ];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSettingChange = (key: string, val: string, setter: (v: string) => void) => {
    setter(val);
    localStorage.setItem(key, val);
    showToast('Setting saved successfully');
  };

  const handleToggle = (key: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current;
    setter(next);
    localStorage.setItem(key, String(next));
    showToast(`Setting ${next ? 'enabled' : 'disabled'}`);
  };

  const toggleSource = (id: string) => {
    const updated = sources.map((s: any) => (s.id === id ? { ...s, active: !s.active } : s));
    setSources(updated);
    localStorage.setItem('fw_sources_state', JSON.stringify(updated));
    showToast('Framework source updated');
  };

  const handleResetCache = () => {
    if (window.confirm('Reset all saved local preferences and restore default settings?')) {
      localStorage.removeItem('fw_default_view');
      localStorage.removeItem('fw_items_per_page');
      localStorage.removeItem('fw_date_format');
      localStorage.removeItem('fw_timezone');
      localStorage.removeItem('fw_language');
      localStorage.removeItem('fw_retention');
      localStorage.removeItem('fw_compression');
      localStorage.removeItem('fw_email_notif');
      localStorage.removeItem('fw_new_fw_notif');
      localStorage.removeItem('fw_critical_only');
      localStorage.removeItem('fw_summary_freq');
      localStorage.removeItem('fw_sources_state');

      setDefaultView('All Frameworks');
      setItemsPerPage('10');
      setDateFormat('DD MMM YYYY (e.g. 26 Oct 2026)');
      setTimeZone('Asia/Kolkata (GMT+5:30)');
      setLanguage('English');
      setRetentionPolicy('Keep Forever (Append-Only)');
      setDataCompression(true);
      setEmailNotifications(true);
      setNewFrameworkUpdates(true);
      setCriticalOnly(false);
      setSummaryFrequency('Daily');
      showToast('Cache and preferences reset to defaults');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle size={16} />
          {toastMessage}
        </div>
      )}

      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Settings size={13} />
          Settings
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
          Application Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Configure your framework sources, notifications and system preferences.
        </p>
      </div>

      {/* Sub-tabs Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)', gap: '28px' }}>
        {[
          { id: 'general', label: 'General', icon: <Sliders size={15} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
          { id: 'sources', label: 'Sources', icon: <Database size={15} /> },
          { id: 'system', label: 'System', icon: <Settings size={15} /> },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 4px',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.15s ease',
              }}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        {(activeSubTab === 'general' || activeSubTab === 'system') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: General Settings */}
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
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>General Settings</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage basic application preferences and display options.
                </p>
              </div>

              {/* Theme Mode */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Theme Appearance</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Choose your preferred theme for the dashboard.
                  </div>
                </div>

                <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                  <button
                    onClick={() => { onSelectThemeMode('dark'); showToast('Dark theme activated'); }}
                    style={{
                      backgroundColor: themeMode === 'dark' ? 'var(--bg-active)' : 'transparent',
                      border: themeMode === 'dark' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      color: themeMode === 'dark' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Moon size={13} color={themeMode === 'dark' ? 'var(--accent-primary)' : undefined} />
                    Dark
                  </button>
                  <button
                    onClick={() => { onSelectThemeMode('light'); showToast('Light theme activated'); }}
                    style={{
                      backgroundColor: themeMode === 'light' ? 'var(--bg-active)' : 'transparent',
                      border: themeMode === 'light' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      color: themeMode === 'light' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Sun size={13} color={themeMode === 'light' ? '#F59E0B' : undefined} />
                    Light
                  </button>
                  <button
                    onClick={() => { onSelectThemeMode('system'); showToast('System theme activated'); }}
                    style={{
                      backgroundColor: themeMode === 'system' ? 'var(--bg-active)' : 'transparent',
                      border: themeMode === 'system' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      color: themeMode === 'system' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Monitor size={13} />
                    System
                  </button>
                </div>
              </div>

              {/* Default View */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Default View</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Set the default view when you access the frameworks page.
                  </div>
                </div>
                <select
                  value={defaultView}
                  onChange={(e) => handleSettingChange('fw_default_view', e.target.value, setDefaultView)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>All Frameworks</option>
                  <option>Tier 1 Only</option>
                  <option>Recently Updated</option>
                </select>
              </div>

              {/* Items per Page */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Items per Page</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Number of items to display in lists and tables.
                  </div>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleSettingChange('fw_items_per_page', e.target.value, setItemsPerPage)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 16px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>

              {/* Date Format */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Date Format</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Choose how dates are displayed throughout the application.
                  </div>
                </div>
                <select
                  value={dateFormat}
                  onChange={(e) => handleSettingChange('fw_date_format', e.target.value, setDateFormat)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>DD MMM YYYY (e.g. 26 Oct 2026)</option>
                  <option>YYYY-MM-DD</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>

              {/* Time Zone */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Time Zone</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Set your local time zone for accurate timestamps.
                  </div>
                </div>
                <select
                  value={timeZone}
                  onChange={(e) => handleSettingChange('fw_timezone', e.target.value, setTimeZone)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC (GMT+0:00)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>

              {/* Language */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Language</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Select your preferred language for the interface.
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => handleSettingChange('fw_language', e.target.value, setLanguage)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 16px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>English</option>
                  <option>Español</option>
                  <option>Deutsch</option>
                  <option>Français</option>
                </select>
              </div>
            </div>

            {/* Card 2: Data & Storage */}
            <div
              className="theme-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>Data & Storage</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage how your data is stored and handled in Supabase.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Retention Policy</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    How long to keep historical versions and change logs.
                  </div>
                </div>
                <select
                  value={retentionPolicy}
                  onChange={(e) => handleSettingChange('fw_retention', e.target.value, setRetentionPolicy)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 14px', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option>Keep Forever (Append-Only)</option>
                  <option>1 Year</option>
                  <option>3 Years</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Data Compression</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Compress stored raw catalog data to save database bandwidth (recommended).
                  </div>
                </div>
                <div
                  onClick={() => handleToggle('fw_compression', dataCompression, setDataCompression)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: dataCompression ? 'var(--accent-primary)' : '#94A3B8',
                    padding: '2px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      transform: dataCompression ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Notifications & Source Management */}
        {(activeSubTab === 'notifications' || activeSubTab === 'sources' || activeSubTab === 'general' || activeSubTab === 'system') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: Notification Settings */}
            {(activeSubTab === 'notifications' || activeSubTab === 'general') && (
              <div
                className="theme-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    <Bell size={18} color="var(--accent-primary)" />
                    Notification Settings
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Get notified when frameworks are updated or new changes are detected.
                  </p>
                </div>

                {/* Email Notifications */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Email Notifications</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Receive updates via email (if configured).</div>
                  </div>
                  <div
                    onClick={() => handleToggle('fw_email_notif', emailNotifications, setEmailNotifications)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: emailNotifications ? 'var(--accent-primary)' : '#94A3B8',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        transform: emailNotifications ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* New Framework Updates */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>New Framework Updates</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Notify when a new framework version is available.</div>
                  </div>
                  <div
                    onClick={() => handleToggle('fw_new_fw_notif', newFrameworkUpdates, setNewFrameworkUpdates)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: newFrameworkUpdates ? 'var(--accent-primary)' : '#94A3B8',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        transform: newFrameworkUpdates ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Critical Changes Only */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Critical Changes Only</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Only notify for high-priority or breaking changes.</div>
                  </div>
                  <div
                    onClick={() => handleToggle('fw_critical_only', criticalOnly, setCriticalOnly)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: criticalOnly ? 'var(--accent-primary)' : '#94A3B8',
                      padding: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        transform: criticalOnly ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Summary Frequency */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Summary Frequency</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>How often to receive summary emails.</div>
                  </div>
                  <select
                    value={summaryFrequency}
                    onChange={(e) => handleSettingChange('fw_summary_freq', e.target.value, setSummaryFrequency)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '6px 14px', color: 'var(--text-primary)', fontSize: '12px' }}
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Immediate</option>
                  </select>
                </div>
              </div>
            )}

            {/* Card 2: Framework Source Management */}
            {(activeSubTab === 'sources' || activeSubTab === 'general') && (
              <div
                className="theme-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>Framework Source Management</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Configure which framework families to track actively.</p>
                  </div>
                </div>

                {/* Sources list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sources.map((src: any) => (
                    <div
                      key={src.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-card-subtle)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FrameworkLogo slug={src.slug} name={src.name} size={30} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>{src.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{src.count} frameworks tracked</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: src.active ? '#10B981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: src.active ? '#10B981' : 'var(--text-muted)' }} />
                          {src.active ? 'Active' : 'Disabled'}
                        </span>

                        <div
                          onClick={() => toggleSource(src.id)}
                          style={{
                            width: '38px',
                            height: '20px',
                            borderRadius: '10px',
                            backgroundColor: src.active ? 'var(--accent-primary)' : '#94A3B8',
                            padding: '2px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                              transform: src.active ? 'translateX(18px)' : 'translateX(0)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: Danger Zone / System Management */}
            {(activeSubTab === 'system' || activeSubTab === 'general') && (
              <div
                className="theme-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} />
                    Danger Zone
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Irreversible actions. Use with caution.
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onClick={handleResetCache}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RotateCcw size={16} color="#EF4444" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>Reset Local Cache & Preferences</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Restore default application views, storage policies and UI states.</div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#EF4444" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
