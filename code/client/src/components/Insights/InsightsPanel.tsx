import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { post } from '../../services/api';
import Recommendations from './Recommendations';
import '../../styles/InsightsPanel.css';

export interface Insight {
  id: number;
  priority: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  impact: string;
  effort: string;
  category: string;
}

const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const activeResult = useSimulationStore(state => state.activeResult);

  useEffect(() => {
    if (activeResult) {
      setLoading(true);
      post<{ recommendations: Insight[] }>('/insights', activeResult)
        .then(res => setInsights(res.data.recommendations))
        .catch(err => console.error('Failed to load insights', err))
        .finally(() => setLoading(false));
    } else {
      setInsights([]);
      setLoading(false);
    }
  }, [activeResult]);

  if (loading) return <div className="insights-page">Loading insights...</div>;
  if (!activeResult) return <div className="insights-page">Run a simulation first to see insights.</div>;

  return (
    <div className="insights-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI-Driven Insights</h2>
          <p className="page-sub">Evidence-based recommendations derived from simulation outputs.</p>
        </div>
      </div>
      <div className="insights-layout">
        <Recommendations insights={insights} result={activeResult} />
        {/* You can keep the detailed view if you like – or integrate it into Recommendations */}
      </div>
    </div>
  );
};

export default InsightsPage;