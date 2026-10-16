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
  // NEW: State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { theme } = useThemeStore();

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  // NEW: Toggle function
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // NEW: Close sidebar on navigation (useful for mobile)
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
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