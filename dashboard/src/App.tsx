import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './pages/DashboardHome';
import { FrameworksPage } from './pages/FrameworksPage';
import { ChangeLogPage } from './pages/ChangeLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { FrameworkDetailPage } from './pages/FrameworkDetailPage';
import { FrameworkOverview, getFrameworkOverview } from './lib/api';

export type ActiveTab = NavigationTab | 'detail';

export function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkOverview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [, setLoading] = useState(true);

  // Load real data from Supabase backend
  const loadData = async () => {
    setLoading(true);
    try {
      const fwList = await getFrameworkOverview();
      setFrameworks(fwList);
    } catch (err) {
      console.error('Error loading framework overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut listener for ⌘ K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
      }
      return next;
    });
  };

  const handleSelectFramework = (slug: string) => {
    setSelectedFrameworkSlug(slug);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavSelect = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (tab !== 'frameworks') {
      setSelectedFrameworkSlug(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // If user starts searching from dashboard or settings, navigate them to Frameworks
    if (query.trim().length > 0 && currentTab !== 'frameworks' && currentTab !== 'changelog') {
      setCurrentTab('frameworks');
    }
  };

  const selectedFramework = frameworks.find(f => f.slug === selectedFrameworkSlug);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#070C18',
        color: '#F8FAFC',
      }}
    >
      {/* Fixed Left Navigation Sidebar matching Mockups */}
      <Sidebar
        currentTab={currentTab === 'detail' ? 'frameworks' : currentTab}
        onSelectTab={handleNavSelect}
        lastCheckedText="2h ago"
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: '#070C18',
        }}
      >
        {/* Sticky Top Header matching Mockups */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Tab Content Views */}
        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            backgroundColor: '#070C18',
          }}
        >
          {/* Tab 1: Dashboard Overview (Image 1) */}
          {currentTab === 'dashboard' && (
            <DashboardHome
              frameworks={frameworks}
              onSelectTab={handleNavSelect}
              onSelectFramework={handleSelectFramework}
            />
          )}

          {/* Tab 2: Security Frameworks (Image 2) */}
          {currentTab === 'frameworks' && (
            <FrameworksPage
              frameworks={frameworks}
              onSelectFramework={handleSelectFramework}
              initialSearch={searchQuery}
            />
          )}

          {/* Tab 3: Change Log & Inspector (Image 3) */}
          {currentTab === 'changelog' && (
            <ChangeLogPage
              frameworks={frameworks}
              onSelectFramework={handleSelectFramework}
              initialFrameworkSlug={selectedFrameworkSlug || undefined}
            />
          )}

          {/* Tab 4: Application Settings (Image 4) */}
          {currentTab === 'settings' && (
            <SettingsPage
              isDark={isDark}
              onToggleTheme={toggleTheme}
            />
          )}

          {/* Framework Detail View (Drilldown) */}
          {currentTab === 'detail' && selectedFramework && (
            <FrameworkDetailPage
              framework={selectedFramework}
              onBack={() => setCurrentTab('frameworks')}
              onViewChanges={() => setCurrentTab('changelog')}
            />
          )}
        </main>

        {/* Status Footer */}
        <footer
          style={{
            borderTop: '1px solid #141F36',
            padding: '16px 36px',
            backgroundColor: '#070C18',
            fontSize: '12px',
            color: '#64748B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Framework Update Tracker • Production Ready v1.0.0</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Append-Only Version History</span>
            <span>Grounded Summaries</span>
            <span>Supabase RLS Protected</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
