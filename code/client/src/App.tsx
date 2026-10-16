import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Common/Navbar';
import Sidebar from './components/Common/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import SimulationPage from './pages/SimulationPage';
import ResultsPage from './pages/ResultsPage';
import InsightsPage from './components/Insights/InsightsPanel';
import { useThemeStore } from './store/themeStore';

type Page = 'dashboard' | 'upload' | 'simulation' | 'results' | 'insights';

const PAGE_LABELS: Record<Page, string> = {
  dashboard:  'Dashboard',
  upload:     'Upload Data',
  simulation: 'Simulation',
  results:    'Results',
  insights:   'Insights',
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);   // sidebar drawer state

  const { theme } = useThemeStore();

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    // Auto-close drawer on mobile after navigation
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard onNavigate={handleNavigate} />;
      case 'upload':     return <UploadPage />;
      case 'simulation': return <SimulationPage />;
      case 'results':    return <ResultsPage />;
      case 'insights':   return <InsightsPage />;
      default:           return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={currentPage}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <Navbar
        currentPage={PAGE_LABELS[currentPage]}
        toggleSidebar={toggleSidebar}
      />
      <main className="app-main">
        <div className="app-content">
          {renderPage()}
        </div>
      </main>
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
    </div>
  );
};

export default App;