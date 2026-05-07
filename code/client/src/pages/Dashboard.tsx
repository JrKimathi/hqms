import React from 'react';
import '../styles/Dashboard.css';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const stats = [
  { label: 'Avg Wait Time',    value: '18.4',  unit: 'min',  delta: '-12%',  positive: true,  color: 'cyan'  },
  { label: 'Queue Throughput', value: '94.2',  unit: '%',    delta: '+5.1%', positive: true,  color: 'green' },
  { label: 'Patients/Hour',    value: '47',    unit: 'pts',  delta: '+8',    positive: true,  color: 'teal'  },
  { label: 'Idle Server Time', value: '6.3',   unit: '%',    delta: '-3.2%', positive: true,  color: 'amber' },
];

const recentRuns = [
  { id: 'SIM-041', scenario: 'Peak Hours — 3 Servers',    status: 'Completed', time: '2m 14s', date: 'Today 09:41'    },
  { id: 'SIM-040', scenario: 'Off-Peak — 2 Servers',      status: 'Completed', time: '1m 48s', date: 'Today 08:22'    },
  { id: 'SIM-039', scenario: 'Emergency Surge Scenario',   status: 'Completed', time: '3m 07s', date: 'Yesterday'      },
  { id: 'SIM-038', scenario: 'Baseline — Current System',  status: 'Completed', time: '1m 55s', date: 'Yesterday'      },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="dashboard fade-in">
      {/* Hero */}
      <div className="dashboard-hero fade-in">
        <div className="hero-content">
          <div className="hero-tag">Hospital Queue Simulation</div>
          <h1 className="hero-title">
            Optimize Patient Flow.<br />
            <span className="hero-title-accent">Reduce Wait Times.</span>
          </h1>
          <p className="hero-sub">
            Simulation-based optimization of hospital queue management. 
            Upload historical data, configure scenarios, and run predictive models 
            to enhance service delivery.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('upload')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 11v1.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V11M8 1v9M5.5 3.5L8 1l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload Data
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('simulation')}>
              Run Simulation
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="queue-diagram">
            {[5,3,4,6,2].map((h, i) => (
              <div key={i} className="queue-bar" style={{ '--bar-h': `${h * 14}px`, animationDelay: `${i * 0.12}s` } as React.CSSProperties} />
            ))}
            <div className="queue-server">
              <div className="server-pulse" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="10" rx="2" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
                <circle cx="6" cy="10" r="1.5" fill="var(--accent-cyan)"/>
                <path d="M10 8h4M10 12h4" stroke="var(--accent-cyan)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="hero-badge">
            <span className="badge-num">↓ 31%</span>
            <span className="badge-lbl">Wait reduction</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid fade-in fade-in-delay-1">
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              <span className={`stat-delta stat-delta--${s.positive ? 'pos' : 'neg'}`}>{s.delta}</span>
            </div>
            <div className="stat-value">
              <span className={`stat-num stat-num--${s.color}`}>{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
            <div className={`stat-bar-track`}>
              <div className={`stat-bar-fill stat-bar-fill--${s.color}`} style={{ width: `${Math.random() * 40 + 55}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lower grid */}
      <div className="dashboard-lower fade-in fade-in-delay-2">
        {/* Recent simulations */}
        <div className="card dash-card dash-card--wide">
          <div className="card-header">
            <h3 className="card-title">Recent Simulations</h3>
            <button className="btn-link" onClick={() => onNavigate('results')}>View All →</button>
          </div>
          <div className="sim-table">
            <div className="sim-table-head">
              <span>ID</span><span>Scenario</span><span>Duration</span><span>Run</span><span>Status</span>
            </div>
            {recentRuns.map((r) => (
              <div className="sim-table-row" key={r.id}>
                <span className="sim-id">{r.id}</span>
                <span className="sim-scenario">{r.scenario}</span>
                <span className="sim-time">{r.time}</span>
                <span className="sim-date">{r.date}</span>
                <span className="sim-status sim-status--done">● {r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick start */}
        <div className="card dash-card">
          <div className="card-header">
            <h3 className="card-title">Quick Start</h3>
          </div>
          <div className="quickstart-steps">
            {[
              { n: '01', title: 'Upload Data',       sub: 'CSV or Excel hospital records',   page: 'upload'     },
              { n: '02', title: 'Configure Scenario', sub: 'Set servers, arrival rates',      page: 'simulation' },
              { n: '03', title: 'Run & Analyze',      sub: 'View metrics and queue charts',   page: 'results'    },
              { n: '04', title: 'Get Insights',       sub: 'AI-driven recommendations',       page: 'insights'   },
            ].map((s) => (
              <button key={s.n} className="qs-step" onClick={() => onNavigate(s.page)}>
                <span className="qs-num">{s.n}</span>
                <div className="qs-content">
                  <span className="qs-title">{s.title}</span>
                  <span className="qs-sub">{s.sub}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="qs-arrow">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;