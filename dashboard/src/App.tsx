import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { FrameworkDetailPage } from './pages/FrameworkDetailPage';
import { ChangeLogPage } from './pages/ChangeLogPage';
import { RunsPage } from './pages/RunsPage';
import { FrameworkOverview, getFrameworkOverview, getDashboardMetrics } from './lib/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'detail' | 'changelog' | 'runs'>('overview');
  const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [metrics, setMetrics] = useState({
    totalFrameworks: 10,
    totalControls: 7133,
    totalChanges: 8,
    pipelineHealth: 100,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fwList, mData] = await Promise.all([
        getFrameworkOverview(),
        getDashboardMetrics(),
      ]);
      setFrameworks(fwList);
      setMetrics(mData);
    } catch (err) {
      console.error('Error loading initial overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const selectedFramework = frameworks.find(f => f.slug === selectedFrameworkSlug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="app-container" style={{ flex: 1, paddingTop: '32px' }}>
        {currentTab === 'overview' && (
          <OverviewPage
            frameworks={frameworks}
            loading={loading}
            metrics={metrics}
            onSelectFramework={handleSelectFramework}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'detail' && selectedFramework && (
          <FrameworkDetailPage
            framework={selectedFramework}
            onBack={() => setCurrentTab('overview')}
            onViewChanges={() => setCurrentTab('changelog')}
          />
        )}

        {currentTab === 'changelog' && (
          <ChangeLogPage
            frameworks={frameworks}
            initialFrameworkSlug={selectedFrameworkSlug || undefined}
          />
        )}

        {currentTab === 'runs' && (
          <RunsPage />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 0',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: 0 }}>
          <div>
            Framework Update Tracker • Automated Compliance Intelligence
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Append-Only History</span>
            <span>Grounded LLM Summaries</span>
            <span>Supabase RLS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
