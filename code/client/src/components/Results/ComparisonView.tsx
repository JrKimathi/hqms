/**
 * ComparisonView.tsx
 * Side-by-side scenario comparison table + verdict card.
 */
import React from 'react';
import type { ComparisonRow, SimulationResult } from '../../types/results';
import './../../styles/ComparisonView.css';

interface ComparisonViewProps {
  rows: ComparisonRow[];
  baseline?: SimulationResult;
  scenario?: SimulationResult;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ rows, baseline, scenario }) => {
  if (!baseline || !scenario || rows.length === 0) {
    return (
      <div className="cv-empty card">
        <div className="cv-empty-icon">⚖️</div>
        <p className="cv-empty-title">No comparison available yet</p>
        <p className="cv-empty-sub">Run at least two simulations to compare scenarios side by side.</p>
      </div>
    );
  }

  const improvements = rows.filter(r => r.deltaPositive).length;
  const regressions  = rows.filter(r => !r.deltaPositive).length;

  return (
    <div className="cv-wrap">
      {/* Header legend */}
      <div className="cv-legend">
        <div className="cv-leg-item">
          <span className="cv-leg-dot cv-leg-dot--base" />
          <span className="cv-leg-label">Baseline: {baseline.scenarioName}</span>
        </div>
        <div className="cv-leg-item">
          <span className="cv-leg-dot cv-leg-dot--test" />
          <span className="cv-leg-label">Test: {scenario.scenarioName}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card cv-table-card">
        <div className="cv-table">
          <div className="cv-head">
            <span>Metric</span>
            <span>Baseline</span>
            <span>Scenario</span>
            <span>Δ Change</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="cv-row">
              <span className="cv-metric">{r.metric}</span>
              <span className="cv-val">{r.baseline}</span>
              <span className="cv-val cv-val--highlight">{r.scenario}</span>
              <span className={`cv-delta ${r.deltaPositive ? 'cv-delta--pos' : 'cv-delta--neg'}`}>
                {r.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary badges */}
      <div className="cv-badges">
        <div className="cv-badge cv-badge--pos">
          <span className="cv-badge-num">{improvements}</span>
          <span className="cv-badge-lbl">Improvements</span>
        </div>
        <div className="cv-badge cv-badge--neg">
          <span className="cv-badge-num">{regressions}</span>
          <span className="cv-badge-lbl">Regression{regressions !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="card cv-verdict">
        <div className="cv-verdict-icon">📊</div>
        <div>
          <p className="cv-verdict-title">Simulation Verdict</p>
          <p className="cv-verdict-body">
            Comparing <strong>{scenario.scenarioName}</strong> vs. <strong>{baseline.scenarioName}</strong>:{' '}
            {improvements > regressions
              ? `${improvements} of ${rows.length} metrics improved. The new configuration is recommended for deployment during peak hours.`
              : `Results are mixed — ${improvements} improvements and ${regressions} regressions. Further tuning is advised before deployment.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
