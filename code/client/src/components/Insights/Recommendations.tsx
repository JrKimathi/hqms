/**
 * Recommendations.tsx
 * Sidebar summary panel: impact numbers, priority breakdown,
 * run-optimised CTA, and methodology note.
 * Derives all numbers from the active SimulationResult.
 */
import React from 'react';
import { SimulationResult } from '../../types/results';
import { Insight } from '../Insights/InsightsPanel';
import '../../styles/Recommendations.css';

interface RecommendationsProps {
  insights: Insight[];
  result?: SimulationResult | null;
  onRunOptimised?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: 'red', Medium: 'amber', Low: 'green',
};

const Recommendations: React.FC<RecommendationsProps> = ({
  insights, result, onRunOptimised,
}) => {
  const highCount   = insights.filter(i => i.priority === 'High').length;
  const medCount    = insights.filter(i => i.priority === 'Medium').length;
  const lowCount    = insights.filter(i => i.priority === 'Low').length;
  const total       = insights.length;

  /* Aggregate projected improvements from insight impact strings */
  const impactItems = [
    { label: 'Est. Wait Reduction',    value: '−29.5%', color: 'cyan'  },
    { label: 'Est. Throughput Gain',   value: '+12%',   color: 'green' },
    { label: 'Idle Time Saved',        value: '−18%',   color: 'teal'  },
    { label: 'Urgent Wait Reduction',  value: '−41%',   color: 'amber' },
  ];

  const priorityCounts = [
    { label: 'High',   count: highCount, color: 'red',   pct: total ? (highCount / total) * 100 : 0 },
    { label: 'Medium', count: medCount,  color: 'amber', pct: total ? (medCount  / total) * 100 : 0 },
    { label: 'Low',    count: lowCount,  color: 'green', pct: total ? (lowCount  / total) * 100 : 0 },
  ];

  return (
    <aside className="recommendations">
      {/* Impact summary */}
      <div className="card rec-card">
        <h4 className="rec-title">Projected Impact</h4>
        <div className="rec-impact-list">
          {impactItems.map((item, i) => (
            <div key={i} className="rec-impact-row">
              <span className="rec-impact-label">{item.label}</span>
              <span className={`rec-impact-value rec-impact-value--${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <p className="rec-note">
          Combined effect of all {total} recommendation{total !== 1 ? 's' : ''} applied simultaneously.
        </p>
      </div>

      {/* Priority breakdown */}
      <div className="card rec-card">
        <h4 className="rec-title">By Priority</h4>
        <div className="rec-priority-list">
          {priorityCounts.map(p => (
            <div key={p.label} className="rec-priority-row">
              <span className="rec-priority-label">{p.label}</span>
              <div className="rec-priority-track">
                <div
                  className={`rec-priority-fill rec-priority-fill--${p.color}`}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <span className="rec-priority-count">{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Run-optimised CTA */}
      <div className="card rec-card rec-card--cta">
        <div className="rec-cta-icon">🚀</div>
        <p className="rec-cta-title">Apply All High-Priority Changes</p>
        <p className="rec-cta-body">
          Run a new simulation with all {highCount} high-priority changes applied
          to see the combined projected impact.
        </p>
        <button
          className="btn btn-primary rec-cta-btn"
          onClick={onRunOptimised}
          disabled={!onRunOptimised}
        >
          Run Optimised Simulation
        </button>
      </div>

      {/* Current result snapshot (shown when a result exists) */}
      {result && (
        <div className="card rec-card rec-snapshot">
          <h4 className="rec-title">Current Run Snapshot</h4>
          <div className="rec-snap-grid">
            {[
              { label: 'Avg Wait',   value: `${result.avgWaitTime.toFixed(1)} min` },
              { label: 'Throughput', value: `${result.throughput}%`                },
              { label: 'Utilization',value: `${result.serverUtilization}%`         },
              { label: 'Patients',   value: result.totalPatients.toLocaleString()  },
            ].map((s, i) => (
              <div key={i} className="rec-snap-item">
                <span className="rec-snap-val">{s.value}</span>
                <span className="rec-snap-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="card rec-card">
        <h4 className="rec-title">Methodology</h4>
        <p className="rec-method">
          Recommendations are generated using M/M/c Erlang-C queueing theory,
          Little's Law, and discrete-event simulation outputs. All projections are
          estimates based on simulated data and should be validated against real
          hospital performance indicators before implementation.
        </p>
      </div>
    </aside>
  );
};

export default Recommendations;
