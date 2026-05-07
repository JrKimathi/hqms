import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Common/Navbar';
import Sidebar from './components/Common/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import SimulationPage from './pages/SimulationPage';
import ResultsPage from './pages/ResultsPage';
import InsightsPage from './components/Insights/InsightsPanel'; 

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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard onNavigate={(p) => setCurrentPage(p as Page)} />;
      case 'upload':     return <UploadPage />;
      case 'simulation': return <SimulationPage />;
      case 'results':    return <ResultsPage />;
      case 'insights':   return <InsightsPage />;
      default:           return <Dashboard onNavigate={(p) => setCurrentPage(p as Page)} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={currentPage} onNavigate={(p) => setCurrentPage(p as Page)} />
      <Navbar currentPage={PAGE_LABELS[currentPage]} />
      <main className="app-main">
        <div className="app-content">
          {renderPage()}
        </div>
      </main>
      {/* Ambient background decoration */}
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
    </div>
  );
};

export default App;