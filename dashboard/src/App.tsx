import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './pages/DashboardHome';
import { FrameworksPage } from './pages/FrameworksPage';
import { ChangeLogPage } from './pages/ChangeLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { RunsPage } from './pages/RunsPage';
import { FrameworkDetailPage } from './pages/FrameworkDetailPage';
import {
  FrameworkOverview,
  ChangeRecord,
  FetchRun,
  getFrameworkOverview,
  getLatestRun,
  getChanges,
  getFetchRuns,
  formatTimeAgo,
} from './lib/api';

export type ActiveTab = NavigationTab | 'detail';
export type ThemeMode = 'dark' | 'light' | 'system';

export function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkOverview[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [runs, setRuns] = useState<FetchRun[]>([]);
  const [lastCheckedText, setLastCheckedText] = useState<string>('Just now');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state: 'dark' | 'light' | 'system' (persisted in localStorage)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('fw_tracker_theme') as ThemeMode) || 'dark';
  });
  const [isDark, setIsDark] = useState<boolean>(true);
  const [, setLoading] = useState(true);

  // Sync theme to DOM class and localStorage
  useEffect(() => {
    localStorage.setItem('fw_tracker_theme', themeMode);

    const applyTheme = () => {
      let dark = true;
      if (themeMode === 'light') {
        dark = false;
      } else if (themeMode === 'dark') {
        dark = true;
      } else if (themeMode === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Toggle theme directly between dark and light
  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load real data from Supabase backend
  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getFrameworkOverview(),
        getLatestRun(),
        getChanges(undefined, undefined, 100),
        getFetchRuns(50),
      ]);

      if (results[0].status === 'fulfilled') {
        setFrameworks(results[0].value);
      }
      if (results[1].status === 'fulfilled' && results[1].value?.started_at) {
        setLastCheckedText(formatTimeAgo(results[1].value.started_at));
      }
      if (results[2].status === 'fulfilled') {
        setChanges(results[2].value);
      }
      if (results[3].status === 'fulfilled') {
        setRuns(results[3].value);
      }
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
      className="app-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Fixed Left Navigation Sidebar matching Mockups */}
      <Sidebar
        currentTab={currentTab === 'detail' ? 'frameworks' : currentTab}
        onSelectTab={handleNavSelect}
        lastCheckedText={lastCheckedText}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: 'var(--bg-app)',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* Sticky Top Header */}
        <Header
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Tab Content Views */}
        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            backgroundColor: 'var(--bg-app)',
            transition: 'background-color 0.2s ease',
          }}
        >
          {/* Tab 1: Dashboard Overview (Image 1) */}
          {currentTab === 'dashboard' && (
            <DashboardHome
              frameworks={frameworks}
              changes={changes}
              runs={runs}
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
              themeMode={themeMode}
              onSelectThemeMode={setThemeMode}
            />
          )}

          {/* Tab 5: Automated Pipeline Execution Runs */}
          {currentTab === 'runs' && <RunsPage />}

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
            borderTop: '1px solid var(--border-main)',
            padding: '16px 36px',
            backgroundColor: 'var(--bg-sidebar)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ color: 'var(--text-primary)' }}>Framework Update Tracker • Production Ready v1.0.0</span>
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
