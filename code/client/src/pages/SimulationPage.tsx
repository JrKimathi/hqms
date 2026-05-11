import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStore } from '../store/simulationStore';
import ConfigPanel from '../components/Simulation/ConfigPanel';
import RunSimulationButton from '../components/Simulation/RunSimulationButton';
import ScenarioBuilder from '../components/Simulation/ScenarioBuilder';
import '../styles/SimulationPage.css';

const SimulationPage: React.FC = () => {
  const {
    config,
    setServers,
    setArrivalRate,
    setServiceTime,
    setSimDuration,
    setDiscipline,
    scenarios,
    activeScenarioId,
    setActiveScenario,
    loadScenario,
    addScenario,
    removeScenario,
    isRunning,
    isDone,
    progress,
    derived,
    start,
    abort,
  } = useSimulation();

  const uploadedRecordCount = useSimulationStore(state => state.uploadedRecordCount);
  const hasData = uploadedRecordCount > 0;

  // For navigation (if using React Router)
  // const navigate = useNavigate();

  return (
    <div className="sim-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Simulation Configuration</h2>
          <p className="page-sub">
            Configure queue parameters, select a scenario, and run the simulation model.
            {!hasData && <span className="warning-text"> ⚠️ No patient data uploaded. Please upload data first.</span>}
          </p>
        </div>
        <RunSimulationButton
          isRunning={isRunning}
          isDone={isDone}
          progress={progress}
          onRun={start}
          onAbort={abort}
          onViewResults={() => {
            // Example: navigate to results page
            // navigate('/results');
            window.location.href = '/results'; // fallback
          }}
          logLines={[]}
          disabled={!hasData}
        />
      </div>

      {!hasData && (
        <div className="alert alert-warning" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,193,7,0.1)', borderLeft: '4px solid #ffc107', borderRadius: '4px' }}>
          📂 You haven't uploaded any patient data.
          <button className="btn-link" onClick={() => { window.location.href = '/upload'; }} style={{ marginLeft: '10px' }}>
            Go to Upload Page →
          </button>
        </div>
      )}

      <div className="sim-grid">
        <div className="sim-config-col">
          <ScenarioBuilder
            scenarios={scenarios}
            activeId={activeScenarioId}
            onSelect={setActiveScenario}
            onAdd={addScenario}
            onRemove={removeScenario}
            onLoad={loadScenario}
          />
          <ConfigPanel
            config={config}
            derived={derived}
            onServers={setServers}
            onArrivalRate={setArrivalRate}
            onServiceTime={setServiceTime}
            onSimDuration={setSimDuration}
            onDiscipline={setDiscipline}
          />
        </div>

        <div className="sim-preview-col">
          <div className="card config-section">
            <h3 className="section-title">Live Preview</h3>
            <div className="preview-metrics">
              <div className="preview-metric">
                <span className="pm-label">Server Utilisation (ρ)</span>
                <div className="pm-gauge-wrap">
                  <div className="pm-gauge-track">
                    <div className="pm-gauge-fill" style={{ width: `${Math.min(derived.utilization, 100)}%`, background: derived.rho >= 0.9 ? 'var(--accent-red)' : derived.rho >= 0.7 ? 'var(--accent-amber)' : 'var(--accent-green)' }} />
                  </div>
                  <span className="pm-val">{derived.utilization.toFixed(1)}%</span>
                </div>
              </div>

              {[
                { label: 'Traffic Intensity (ρ)',   val: derived.rho.toFixed(3), unit: '' },
                { label: 'Estimated Avg Wait',      val: derived.wq.toFixed(1), unit: 'min' },
                { label: 'Effective Capacity',      val: (config.servers * (60 / config.serviceTime)).toFixed(0), unit: 'pts/hr' },
                { label: 'Total Servers',           val: config.servers, unit: '' },
                { label: 'Discipline',              val: config.discipline, unit: '' },
              ].map((m, i) => (
                <div key={i} className="preview-metric preview-metric--row">
                  <span className="pm-label">{m.label}</span>
                  <span className="pm-val-plain">{m.val} <span className="pm-unit">{m.unit}</span></span>
                </div>
              ))}
            </div>

            {derived.rho >= 1 && (
              <div className="warning-banner">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1L14 13H1L7.5 1z" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M7.5 6v3.5M7.5 11v.5" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Queue is unstable (ρ ≥ 1). Increase servers or reduce arrival rate.
              </div>
            )}
          </div>

          <div className="card config-section">
            <h3 className="section-title">Queue Structure Preview</h3>
            <div className="queue-viz-preview">
              <div className="qvp-arrival">
                <div className="qvp-arrow-label">λ = {config.arrivalRate}/hr</div>
                <div className="qvp-arrows">
                  {[...Array(Math.min(config.servers + 1, 5))].map((_, i) => (
                    <div key={i} className="qvp-patient" style={{ animationDelay: `${i * 0.3}s` }}>
                      <div className="patient-dot" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="qvp-queue-box">
                <span className="qvp-label">Queue</span>
                <div className="qvp-waiting">
                  {[...Array(Math.min(Math.round(derived.lq), 6))].map((_, i) => (
                    <div key={i} className="qvp-waiting-dot" style={{ opacity: 1 - i * 0.12 }} />
                  ))}
                </div>
              </div>
              <div className="qvp-servers">
                {[...Array(config.servers)].map((_, i) => (
                  <div key={i} className={`qvp-server ${i < Math.round(derived.utilization / 100 * config.servers) ? 'qvp-server--busy' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1" y="3" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="3.5" cy="6" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                ))}
              </div>
              <div className="qvp-exit">
                <div className="qvp-arrow-label">μ = {(60 / config.serviceTime).toFixed(1)}/hr</div>
                <div className="qvp-exit-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;