import React, { useState } from 'react';
import '../../styles/InsightsPanel.css';

interface Recommendation {
  id: number;
  priority: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  impact: string;
  effort: string;
  category: string;
}

const recommendations: Recommendation[] = [
  {
    id: 1, priority: 'high',
    title: 'Add a 4th Server During Peak Hours (8am–12pm)',
    body: 'Simulation results indicate the system operates at ρ = 0.93 during morning peak, dangerously close to instability. Adding one additional server during this window would reduce average wait time by an estimated 41% and prevent queue blow-up on high-arrival days.',
    impact: 'Wait ↓ 41%', effort: 'Medium', category: 'Staffing',
  },
  {
    id: 2, priority: 'high',
    title: 'Implement Priority Queuing for Emergency Cases',
    body: 'Current FCFS discipline treats all patients equally. Switching to a 3-tier priority queue (Critical / Urgent / Routine) would dramatically reduce time-to-treatment for emergency patients without significantly degrading routine wait times.',
    impact: 'Critical wait ↓ 68%', effort: 'Low', category: 'Queue Policy',
  },
  {
    id: 3, priority: 'medium',
    title: 'Stagger Staff Shift Start Times',
    body: 'A 30-minute stagger in shift changes (currently simultaneous at 8am, 2pm, 8pm) creates transient under-staffing spikes. Overlapping shifts by 30 minutes would smooth throughput and eliminate the observed wait-time spikes at shift boundaries.',
    impact: 'Throughput ↑ 8%', effort: 'Low', category: 'Scheduling',
  },
  {
    id: 4, priority: 'medium',
    title: 'Pre-Registration Kiosk to Reduce Registration Time',
    body: 'Simulation identifies registration as the bottleneck sub-queue (avg 4.1 min vs 1.2 min target). Introducing self-service kiosks or pre-registration via a mobile app could cut this to under 1 minute, freeing triage staff for clinical tasks.',
    impact: 'Service time ↓ 76%', effort: 'High', category: 'Process',
  },
  {
    id: 5, priority: 'low',
    title: 'Introduce Appointment Scheduling for Outpatient',
    body: 'Outpatient currently runs open-access resulting in highly variable arrivals (CV = 1.8). Controlled appointment scheduling would reduce arrival variance, lower peak queue lengths, and improve server utilization predictability.',
    impact: 'Variance ↓ 55%', effort: 'Medium', category: 'Scheduling',
  },
];

const priorityColors: Record<string, string> = {
  high: 'var(--accent-red)',
  medium: 'var(--accent-amber)',
  low: 'var(--accent-green)',
};

const categoryColors: Record<string, string> = {
  Staffing: 'var(--accent-cyan)',
  'Queue Policy': 'var(--accent-teal)',
  Scheduling: 'var(--accent-amber)',
  Process: '#a78bfa',
};

const InsightsPage: React.FC = () => {
  const [selected, setSelected] = useState<number>(1);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Staffing', 'Queue Policy', 'Scheduling', 'Process'];
  const filtered = filter === 'All' ? recommendations : recommendations.filter(r => r.category === filter);
  const activeRec = recommendations.find(r => r.id === selected) ?? recommendations[0];

  return (
    <div className="insights-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI-Driven Insights</h2>
          <p className="page-sub">Evidence-based recommendations derived from simulation outputs to optimize hospital queue performance.</p>
        </div>
        <button className="btn btn-secondary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Insights
        </button>
      </div>

      {/* Summary strip */}
      <div className="insights-summary">
        {[
          { label: 'Recommendations', value: '5', color: 'var(--accent-cyan)' },
          { label: 'High Priority',    value: '2', color: 'var(--accent-red)'   },
          { label: 'Med Priority',     value: '2', color: 'var(--accent-amber)' },
          { label: 'Low Priority',     value: '1', color: 'var(--accent-green)' },
          { label: 'Est. Avg Impact',  value: '↑34%', color: 'var(--accent-teal)' },
        ].map((s,i) => (
          <div key={i} className="ins-summary-item">
            <span className="ins-sum-val" style={{ color: s.color }}>{s.value}</span>
            <span className="ins-sum-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="category-filter">
        {categories.map(c => (
          <button
            key={c}
            className={`cat-btn ${filter === c ? 'cat-btn--active' : ''}`}
            onClick={() => setFilter(c)}
          >{c}</button>
        ))}
      </div>

      <div className="insights-layout">
        {/* List */}
        <div className="rec-list">
          {filtered.map(rec => (
            <button
              key={rec.id}
              className={`rec-item ${selected === rec.id ? 'rec-item--active' : ''}`}
              onClick={() => setSelected(rec.id)}
            >
              <div className="rec-item-top">
                <span
                  className="rec-priority-dot"
                  style={{ background: priorityColors[rec.priority] }}
                />
                <span
                  className="rec-category"
                  style={{ color: categoryColors[rec.category] }}
                >{rec.category}</span>
                <span className="rec-priority-badge" style={{ color: priorityColors[rec.priority], borderColor: priorityColors[rec.priority] }}>
                  {rec.priority}
                </span>
              </div>
              <p className="rec-title">{rec.title}</p>
              <div className="rec-meta">
                <span className="rec-impact-badge">{rec.impact}</span>
                <span className="rec-effort">Effort: {rec.effort}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="rec-detail fade-in" key={activeRec.id}>
          <div className="card rd-card">
            <div className="rd-header">
              <div className="rd-tags">
                <span className="rd-tag" style={{ color: categoryColors[activeRec.category], borderColor: categoryColors[activeRec.category] }}>
                  {activeRec.category}
                </span>
                <span className="rd-tag rd-tag--priority" style={{
                  color: priorityColors[activeRec.priority],
                  borderColor: priorityColors[activeRec.priority],
                  background: priorityColors[activeRec.priority] + '18'
                }}>
                  {activeRec.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h3 className="rd-title">{activeRec.title}</h3>
            </div>

            <div className="rd-metrics">
              <div className="rd-metric">
                <span className="rd-metric-label">Expected Impact</span>
                <span className="rd-metric-value" style={{ color: 'var(--accent-green)' }}>{activeRec.impact}</span>
              </div>
              <div className="rd-metric">
                <span className="rd-metric-label">Implementation Effort</span>
                <span className="rd-metric-value" style={{ color: 'var(--accent-amber)' }}>{activeRec.effort}</span>
              </div>
              <div className="rd-metric">
                <span className="rd-metric-label">Category</span>
                <span className="rd-metric-value" style={{ color: categoryColors[activeRec.category] }}>{activeRec.category}</span>
              </div>
            </div>

            <div className="rd-body-section">
              <h4 className="rd-body-label">Analysis</h4>
              <p className="rd-body">{activeRec.body}</p>
            </div>

            <div className="rd-simulation-data">
              <h4 className="rd-body-label">Supporting Simulation Data</h4>
              <div className="rd-data-grid">
                {[
                  { k: 'Simulation Run',     v: 'SIM-041'    },
                  { k: 'Scenario',           v: 'Peak Hours' },
                  { k: 'Servers Tested',     v: '3 → 4'      },
                  { k: 'Confidence Level',   v: '95%'        },
                  { k: 'Replications',       v: '10'         },
                  { k: 'Warm-up Period',     v: '30 min'     },
                ].map((d,i)=>(
                  <div key={i} className="rd-data-row">
                    <span className="rd-data-k">{d.k}</span>
                    <span className="rd-data-v">{d.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rd-actions">
              <button className="btn btn-primary">Apply to New Scenario</button>
              <button className="btn btn-secondary">Mark as Reviewed</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;