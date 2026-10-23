import React, { useState } from 'react';
import { Settings, Bell, Database, Trash2, ChevronRight, Sliders, Moon, Sun, Monitor, Globe } from 'lucide-react';
import { FrameworkLogo } from '../components/FrameworkLogo';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notifications' | 'sources' | 'system'>('general');
  const [themePreference, setThemePreference] = useState<'dark' | 'light' | 'system'>('dark');

  // Interactive toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newFrameworkUpdates, setNewFrameworkUpdates] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [dataCompression, setDataCompression] = useState(true);

  // Framework sources toggle state
  const [sources, setSources] = useState([
    { id: 'nist', name: 'NIST', count: 5, active: true, slug: 'nist' },
    { id: 'mitre', name: 'MITRE', count: 2, active: true, slug: 'mitre' },
    { id: 'owasp', name: 'OWASP', count: 2, active: true, slug: 'owasp' },
    { id: 'cis', name: 'CIS', count: 1, active: true, slug: 'cis' },
    { id: 'others', name: 'Others', count: 2, active: true, slug: 'iso' },
  ]);

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <Settings size={13} />
          Settings
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
          Application Settings
        </h1>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
          Configure your framework sources, notifications and system preferences.
        </p>
      </div>

      {/* Sub-tabs Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #162444', gap: '28px' }}>
        {[
          { id: 'general', label: 'General', icon: <Sliders size={15} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
          { id: 'sources', label: 'Sources', icon: <Database size={15} /> },
          { id: 'system', label: 'System', icon: <Settings size={15} /> },
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 4px',
                color: isActive ? '#38BDF8' : '#94A3B8',
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
                    backgroundColor: '#38BDF8',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Two-Column Layout (Matching Mockup Image 4) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: General Settings & Storage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: General Settings */}
          <div
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>General Settings</h2>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Manage basic application preferences and display options.
              </p>
            </div>

            {/* Field: Theme */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Theme</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Choose your preferred theme for the dashboard.
                </div>
              </div>

              {/* Segmented control */}
              <div style={{ display: 'flex', backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '3px' }}>
                <button
                  onClick={() => {
                    setThemePreference('dark');
                    if (!isDark) onToggleTheme();
                  }}
                  style={{
                    backgroundColor: themePreference === 'dark' ? '#142347' : 'transparent',
                    border: themePreference === 'dark' ? '1px solid #38BDF8' : '1px solid transparent',
                    color: themePreference === 'dark' ? '#38BDF8' : '#94A3B8',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Moon size={13} />
                  Dark
                </button>
                <button
                  onClick={() => {
                    setThemePreference('light');
                    if (isDark) onToggleTheme();
                  }}
                  style={{
                    backgroundColor: themePreference === 'light' ? '#142347' : 'transparent',
                    border: themePreference === 'light' ? '1px solid #38BDF8' : '1px solid transparent',
                    color: themePreference === 'light' ? '#38BDF8' : '#94A3B8',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sun size={13} />
                  Light
                </button>
                <button
                  onClick={() => setThemePreference('system')}
                  style={{
                    backgroundColor: themePreference === 'system' ? '#142347' : 'transparent',
                    border: themePreference === 'system' ? '1px solid #38BDF8' : '1px solid transparent',
                    color: themePreference === 'system' ? '#38BDF8' : '#94A3B8',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Monitor size={13} />
                  System
                </button>
              </div>
            </div>

            {/* Field: Default View */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Default View</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Set the default view when you access the frameworks page.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 12px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>All Frameworks</option>
                <option>Tier 1 Only</option>
                <option>Recently Updated</option>
              </select>
            </div>

            {/* Field: Items per Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Items per Page</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Number of items to display in lists and tables.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 16px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>

            {/* Field: Date Format */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Date Format</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Choose how dates are displayed throughout the application.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 12px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>DD MMM YYYY (e.g. 26 Aug 2026)</option>
                <option>YYYY-MM-DD</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>

            {/* Field: Time Zone */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Time Zone</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Set your local time zone for accurate timestamps.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 12px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>Asia/Kolkata (GMT+5:30)</option>
                <option>UTC (GMT+0:00)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>

            {/* Field: Language */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Language</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Select your preferred language for the interface.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 16px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>English</option>
                <option>Español</option>
                <option>Deutsch</option>
              </select>
            </div>
          </div>

          {/* Card 2: Data & Storage */}
          <div
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>Data & Storage</h2>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Manage how your data is stored and handled in Supabase.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Retention Policy</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  How long to keep historical versions and change logs.
                </div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 14px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>Keep Forever (Append-Only)</option>
                <option>1 Year</option>
                <option>3 Years</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Data Compression</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Compress stored raw catalog data to save database bandwidth (recommended).
                </div>
              </div>
              <div
                onClick={() => setDataCompression(!dataCompression)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: dataCompression ? '#2563EB' : '#334155',
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

        {/* Right Column: Notifications, Source Management, Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Notification Settings */}
          <div
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>
                <Bell size={18} color="#38BDF8" />
                Notification Settings
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Get notified when frameworks are updated or new changes are detected.
              </p>
            </div>

            {/* Email Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Email Notifications</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Receive updates via email (if configured).</div>
              </div>
              <div
                onClick={() => setEmailNotifications(!emailNotifications)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: emailNotifications ? '#2563EB' : '#334155',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>New Framework Updates</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Notify when a new framework version is available.</div>
              </div>
              <div
                onClick={() => setNewFrameworkUpdates(!newFrameworkUpdates)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: newFrameworkUpdates ? '#2563EB' : '#334155',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Critical Changes Only</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Only notify for high-priority or breaking changes.</div>
              </div>
              <div
                onClick={() => setCriticalOnly(!criticalOnly)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: criticalOnly ? '#2563EB' : '#334155',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #14213D' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>Summary Frequency</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>How often to receive summary emails.</div>
              </div>
              <select style={{ backgroundColor: '#070D1C', border: '1px solid #162444', borderRadius: '8px', padding: '6px 14px', color: '#F8FAFC', fontSize: '12px' }}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Immediate</option>
              </select>
            </div>
          </div>

          {/* Card 2: Framework Source Management */}
          <div
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid #162444',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>Framework Source Management</h2>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Configure which frameworks to track.</p>
              </div>
              <button
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: '#38BDF8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Settings size={12} />
                Manage Sources
              </button>
            </div>

            {/* Sources list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sources.map(src => (
                <div
                  key={src.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#070E1C',
                    borderRadius: '8px',
                    border: '1px solid #14213D',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FrameworkLogo slug={src.slug} name={src.name} size={30} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{src.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{src.count} frameworks</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: src.active ? '#10B981' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: src.active ? '#10B981' : '#64748B' }} />
                      {src.active ? 'Active' : 'Disabled'}
                    </span>

                    <div
                      onClick={() => toggleSource(src.id)}
                      style={{
                        width: '38px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: src.active ? '#2563EB' : '#334155',
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
                    <ChevronRight size={14} color="#64748B" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Danger Zone */}
          <div
            style={{
              backgroundColor: '#0A1224',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Danger Zone
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
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
              }}
              onClick={() => alert('Demo protection: Clear All Data is disabled to preserve historical audit logs.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trash2 size={16} color="#EF4444" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>Clear All Data</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>This will permanently delete all stored data and logs.</div>
                </div>
              </div>
              <ChevronRight size={14} color="#EF4444" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
