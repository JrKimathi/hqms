import React, { useState } from 'react';
import '../styles/SimulationPage.css';

const SimulationPage: React.FC = () => {
  const [servers, setServers] = useState(3);
  const [arrivalRate, setArrivalRate] = useState(12);
  const [serviceRate, setServiceRate] = useState(8);
  const [simDuration, setSimDuration] = useState(480);
  const [discipline, setDiscipline] = useState('FCFS');
  const [scenario, setScenario] = useState('peak');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRun = () => {
    setRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setRunning(false); return 100; }
        return p + Math.random() * 8;
      });
    }, 180);
  };

  const presets = [
    { id: 'peak',     label: 'Peak Hours',       desc: 'Morning rush 8am–12pm',      servers: 5, arr: 20, svc: 12 },
    { id: 'offpeak',  label: 'Off-Peak',          desc: 'Afternoon steady state',      servers: 2, arr: 7,  svc: 8  },
    { id: 'emergency',label: 'Emergency Surge',   desc: 'Mass-casualty scenario',      servers: 8, arr: 40, svc: 18 },
    { id: 'baseline', label: 'Current Baseline',  desc: 'Existing system as-is',       servers: 3, arr: 12, svc: 8  },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setScenario(p.id);
    setServers(p.servers);
    setArrivalRate(p.arr);
    setServiceRate(p.svc);
  };

  const rho = (arrivalRate / (servers * serviceRate));
  const utilization = Math.min(rho * 100, 99.9);
  const utilizationColor = utilization > 85 ? 'var(--accent-red)' : utilization > 65 ? 'var(--accent-amber)' : 'var(--accent-green)';

  return (
    <div className="sim-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Simulation Configuration</h2>
          <p className="page-sub">Configure queue parameters, select a scenario, and run the simulation model.</p>
        </div>
        <button
          className={`btn btn-primary run-btn ${running ? 'run-btn--running' : ''}`}
          onClick={handleRun}
          disabled={running}
        >
          {running ? (
            <>
              <span className="run-spinner" />
              Running… {Math.min(Math.round(progress), 100)}%
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 3l9 5-9 5V3z" fill="currentColor"/>
              </svg>
              Run Simulation
            </>
          )}
        </button>
      </div>

      {running && (
        <div className="progress-bar-wrap fade-in">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            <div className="progress-scan" />
          </div>
          <span className="progress-label">Simulating patient flow… {Math.min(Math.round(progress), 100)}%</span>
        </div>
      )}

      <div className="sim-grid">
        {/* Left: config */}
        <div className="sim-config-col">
          {/* Presets */}
          <div className="card config-section">
            <h3 className="section-title">Scenario Presets</h3>
            <div className="presets-grid">
              {presets.map(p => (
                <button
                  key={p.id}
                  className={`preset-card ${scenario === p.id ? 'preset-card--active' : ''}`}
                  onClick={() => applyPreset(p)}
                >
                  <span className="preset-label">{p.label}</span>
                  <span className="preset-desc">{p.desc}</span>
                  <div className="preset-meta">
                    <span>{p.servers} servers</span>
                    <span>{p.arr} arr/hr</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="card config-section">
            <h3 className="section-title">Queue Parameters</h3>
            <div className="params-grid">

              <div className="param-group">
                <label className="param-label">
                  Number of Servers (c)
                  <span className="param-value-badge">{servers}</span>
                </label>
                <input type="range" min={1} max={12} value={servers}
                  onChange={e => setServers(+e.target.value)} className="range-input" />
                <div className="range-ticks">
                  {[1,3,6,9,12].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>

              <div className="param-group">
                <label className="param-label">
                  Arrival Rate λ (patients/hr)
                  <span className="param-value-badge">{arrivalRate}</span>
                </label>
                <input type="range" min={1} max={60} value={arrivalRate}
                  onChange={e => setArrivalRate(+e.target.value)} className="range-input" />
                <div className="range-ticks">
                  {[1,15,30,45,60].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>

              <div className="param-group">
                <label className="param-label">
                  Service Rate μ (patients/hr/server)
                  <span className="param-value-badge">{serviceRate}</span>
                </label>
                <input type="range" min={1} max={30} value={serviceRate}
                  onChange={e => setServiceRate(+e.target.value)} className="range-input" />
                <div className="range-ticks">
                  {[1,8,16,24,30].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>

              <div className="param-group">
                <label className="param-label">
                  Simulation Duration (minutes)
                  <span className="param-value-badge">{simDuration} min</span>
                </label>
                <input type="range" min={60} max={1440} step={60} value={simDuration}
                  onChange={e => setSimDuration(+e.target.value)} className="range-input" />
                <div className="range-ticks">
                  {['1h','4h','8h','16h','24h'].map(v => <span key={v}>{v}</span>)}
                </div>
              </div>

              <div className="param-group">
                <label className="param-label">Queue Discipline</label>
                <div className="discipline-options">
                  {['FCFS','LCFS','Priority','Round Robin'].map(d => (
                    <button
                      key={d}
                      className={`discipline-btn ${discipline === d ? 'discipline-btn--active' : ''}`}
                      onClick={() => setDiscipline(d)}
                    >{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="sim-preview-col">
          <div className="card config-section">
            <h3 className="section-title">Live Preview</h3>
            <div className="preview-metrics">
              <div className="preview-metric">
                <span className="pm-label">Server Utilisation (ρ)</span>
                <div className="pm-gauge-wrap">
                  <div className="pm-gauge-track">
                    <div className="pm-gauge-fill" style={{ width: `${utilization}%`, background: utilizationColor }} />
                  </div>
                  <span className="pm-val" style={{ color: utilizationColor }}>{utilization.toFixed(1)}%</span>
                </div>
              </div>

              {[
                { label: 'Traffic Intensity (ρ)',   val: rho.toFixed(3),                        unit: ''     },
                { label: 'Estimated Avg Wait',      val: rho > 1 ? '∞' : (rho/(1-rho) * 60 / serviceRate).toFixed(1), unit: 'min'  },
                { label: 'Effective Capacity',      val: (servers * serviceRate).toFixed(0),    unit: 'pts/hr' },
                { label: 'Total Servers',           val: servers,                               unit: ''     },
                { label: 'Discipline',              val: discipline,                            unit: ''     },
              ].map((m, i) => (
                <div key={i} className="preview-metric preview-metric--row">
                  <span className="pm-label">{m.label}</span>
                  <span className="pm-val-plain">{m.val} <span className="pm-unit">{m.unit}</span></span>
                </div>
              ))}
            </div>

            {rho >= 1 && (
              <div className="warning-banner">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1L14 13H1L7.5 1z" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M7.5 6v3.5M7.5 11v.5" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Queue is unstable (ρ ≥ 1). Increase servers or reduce arrival rate.
              </div>
            )}
          </div>

          {/* Queue visualisation preview */}
          <div className="card config-section">
            <h3 className="section-title">Queue Structure</h3>
            <div className="queue-viz-preview">
              <div className="qvp-arrival">
                <div className="qvp-arrow-label">λ = {arrivalRate}/hr</div>
                <div className="qvp-arrows">
                  {[...Array(Math.min(servers + 1, 5))].map((_, i) => (
                    <div key={i} className="qvp-patient" style={{ animationDelay: `${i * 0.3}s` }}>
                      <div className="patient-dot" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="qvp-queue-box">
                <span className="qvp-label">Queue</span>
                <div className="qvp-waiting">
                  {[...Array(Math.min(Math.round(rho * 3), 6))].map((_, i) => (
                    <div key={i} className="qvp-waiting-dot" style={{ opacity: 1 - i * 0.12 }} />
                  ))}
                </div>
              </div>
              <div className="qvp-servers">
                {[...Array(servers)].map((_, i) => (
                  <div key={i} className={`qvp-server ${i < Math.round(utilization / 100 * servers) ? 'qvp-server--busy' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1" y="3" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="3.5" cy="6" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                ))}
              </div>
              <div className="qvp-exit">
                <div className="qvp-arrow-label">μ = {serviceRate}/hr</div>
                <div className="qvp-exit-arrow">→</div>
              </div>
            </div>
          </div>

          {/* Advanced options */}
          <div className="card config-section">
            <h3 className="section-title">Advanced Options</h3>
            <div className="advanced-opts">
              {[
                { label: 'Poisson Arrivals',        checked: true  },
                { label: 'Exponential Service Times', checked: true  },
                { label: 'Infinite Queue Capacity',  checked: true  },
                { label: 'Warm-up Period (15 min)',   checked: false },
                { label: 'Replicate Runs (×10)',      checked: false },
              ].map((o, i) => (
                <label key={i} className="toggle-row">
                  <span className="toggle-label">{o.label}</span>
                  <div className={`toggle ${o.checked ? 'toggle--on' : ''}`}>
                    <div className="toggle-thumb" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;