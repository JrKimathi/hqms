import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { get } from '../services/api';
import type { SimulationResult } from '../types/results';
import '../styles/Dashboard.css';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [recentResults, setRecentResults] = useState<SimulationResult[]>([]);
  const uploadedRecordCount = useSimulationStore(state => state.uploadedRecordCount);
  const allResults = useSimulationStore(state => state.results);
  const [avgWait, setAvgWait] = useState<number | null>(null);

  useEffect(() => {
    // Try to fetch from backend first, fallback to local store
    get<SimulationResult[]>('/results?limit=5')
      .then(res => setRecentResults(res.data))
      .catch(() => {
        // Use results from store if backend is unavailable
        setRecentResults(allResults.slice(-5).reverse());
      });
  }, [allResults]);

  useEffect(() => {
    if (recentResults.length > 0) {
      setAvgWait(recentResults[0].avgWaitTime);
    } else if (allResults.length > 0) {
      setAvgWait(allResults[allResults.length - 1].avgWaitTime);
    }
  }, [recentResults, allResults]);

  const stats = [
    { label: 'Avg Wait Time',    value: avgWait ? `${avgWait.toFixed(1)}` : '—', unit: 'min', delta: '-12%', positive: true, color: 'cyan'  },
    { label: 'Records Uploaded', value: uploadedRecordCount.toLocaleString(), unit: 'records', delta: '', positive: true, color: 'green' },
    { label: 'Simulations Run',  value: allResults.length.toString(), unit: 'runs', delta: '', positive: true, color: 'teal'  },
    { label: 'Recommendations',  value: allResults.length > 0 ? 'Ready' : '—', unit: '', delta: '', positive: true, color: 'amber' },
  ];

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-hero fade-in">
        <div className="hero-content">
          <div className="hero-tag">Hospital Queue Simulation</div>
          <h1 className="hero-title">Optimize Patient Flow.<br /><span className="hero-title-accent">Reduce Wait Times.</span></h1>
          <p className="hero-sub">Simulation-based optimization of hospital queue management – powered by real data and AI insights.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('upload')}>Upload Data</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('simulation')}>Run Simulation</button>
          </div>
        </div>
      </div>

      <div className="stats-grid fade-in fade-in-delay-1">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              {s.delta && <span className={`stat-delta stat-delta--${s.positive ? 'pos' : 'neg'}`}>{s.delta}</span>}
            </div>
            <div className="stat-value">
              <span className={`stat-num stat-num--${s.color}`}>{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-lower">
        <div className="card dash-card dash-card--wide">
          <div className="card-header">
            <h3 className="card-title">Recent Simulations</h3>
            <button className="btn-link" onClick={() => onNavigate('results')}>View All →</button>
          </div>
          {allResults.length === 0 ? (
            <p className="no-data" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No simulations run yet. Go to Simulation page.
            </p>
          ) : (
            <div className="sim-table">
              <div className="sim-table-head">
                <span>ID</span><span>Scenario</span><span>Avg Wait</span><span>Date</span>
              </div>
              {allResults.slice().reverse().slice(0, 5).map((r) => (
                <div className="sim-table-row" key={r.runId}>
                  <span className="sim-id">{r.runId.slice(-8)}</span>
                  <span className="sim-scenario">{r.scenarioName}</span>
                  <span className="sim-time">{r.avgWaitTime.toFixed(1)} min</span>
                  <span className="sim-date">{new Date().toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;