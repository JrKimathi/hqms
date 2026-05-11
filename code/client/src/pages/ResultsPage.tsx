import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import MetricsCards from '../components/Results/MetricsCards';
import Charts from '../components/Results/Charts';
import QueueVisualization from '../components/Results/QueueVisualization';
import ComparisonView from '../components/Results/ComparisonView';
import { useResults } from '../hooks/useResults';
import '../styles/ResultsPage.css';

const ResultsPage: React.FC = () => {
  const [tab, setTab] = useState<'metrics' | 'charts' | 'queue' | 'compare'>('metrics');
  const activeResult = useSimulationStore(state => state.activeResult);
  const allResults = useSimulationStore(state => state.results);
  const { comparisonRows } = useResults();

  // Use the previous simulation as baseline (if any)
  const baselineResult = allResults.length >= 2 ? allResults[allResults.length - 2] : undefined;

  if (!activeResult) {
    return (
      <div className="results-page fade-in">
        <div className="page-header">
          <h2 className="page-title">Simulation Results</h2>
          <p className="page-sub">No simulation run yet. Go to Simulation page and run one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Simulation Results</h2>
          <p className="page-sub">
            {activeResult.runId} — {activeResult.scenarioName} — Completed
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => {
          // Export logic placeholder
          alert('Export functionality coming soon');
        }}>
          Export Report
        </button>
      </div>

      <div className="results-tabs">
        {(['metrics', 'charts', 'queue', 'compare'] as const).map(t => (
          <button
            key={t}
            className={`results-tab ${tab === t ? 'results-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'metrics' && <MetricsCards result={activeResult} />}
      {tab === 'charts' && <Charts result={activeResult} />}
      {tab === 'queue' && <QueueVisualization result={activeResult} />}
      {tab === 'compare' && (
        <ComparisonView rows={comparisonRows} baseline={baselineResult} scenario={activeResult} />
      )}
    </div>
  );
};

export default ResultsPage;