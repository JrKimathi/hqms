import React from 'react';
import type { DerivedMetrics, SimulationConfig, QueueDiscipline } from '../../types/simulation';
import '../../styles/ConfigPanel.css';


interface ConfigPanelProps {
  config: SimulationConfig;
  derived: DerivedMetrics;
  onServers:     (v: number) => void;
  onArrivalRate: (v: number) => void;
  onServiceTime: (v: number) => void;
  onSimDuration: (v: number) => void;
  onDiscipline:  (d: QueueDiscipline) => void;
}

const DISCIPLINES: QueueDiscipline[] = ['FIFO', 'Priority', 'LIFO', 'Round Robin'];

const DISCIPLINE_DESC: Record<QueueDiscipline, string> = {
  'FIFO':        'First-In-First-Out: patients served in order of arrival.',
  'Priority':    'Priority queue: patients triaged by urgency level (1–5).',
  'LIFO':        'Last-In-First-Out: most recent arrival served first.',
  'Round Robin': 'Round Robin: patients distributed evenly across servers.',
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config, derived, onServers, onArrivalRate, onServiceTime, onSimDuration, onDiscipline,
}) => (
  <div className="config-panel card">
    <div className="card-header">
      <h3 className="card-title">Parameters</h3>
      <span className="kendall-tag">M/M/{config.servers}</span>
    </div>

    <div className="cp-sliders">
      <Slider
        label="Number of Servers (c)"
        value={config.servers} min={1} max={10} step={1}
        unit="servers" color="cyan"
        onChange={onServers}
      />
      <Slider
        label="Patient Arrival Rate (λ)"
        value={config.arrivalRate} min={1} max={60} step={1}
        unit="patients/hr" color="teal"
        onChange={onArrivalRate}
      />
      <Slider
        label="Avg. Service Time (1/μ)"
        value={config.serviceTime} min={1} max={60} step={1}
        unit="minutes" color="amber"
        onChange={onServiceTime}
      />
      <Slider
        label="Simulation Duration"
        value={config.simDuration} min={60} max={1440} step={30}
        unit="minutes" color="green"
        onChange={onSimDuration}
      />
    </div>

    {/* Queue discipline */}
    <div className="cp-discipline">
      <label className="cp-section-label">Queue Discipline</label>
      <div className="cp-disc-grid">
        {DISCIPLINES.map(d => (
          <button
            key={d}
            className={`cp-disc-btn ${config.discipline === d ? 'cp-disc-btn--active' : ''}`}
            onClick={() => onDiscipline(d)}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="cp-disc-note">{DISCIPLINE_DESC[config.discipline]}</p>
    </div>

    {/* Derived metrics */}
    <div className="cp-derived">
      <div className="cp-derived-title">Erlang-C Derived Metrics</div>
      <div className="cp-derived-grid">
        <DerivedItem label="Traffic Intensity (ρ)" value={derived.rho.toFixed(3)}  warn={derived.rho >= 1} />
        <DerivedItem label="Utilization"            value={`${Math.min(derived.utilization, 99.9).toFixed(1)}%`} />
        <DerivedItem label="Mean Queue Length Lq"   value={derived.lq.toFixed(2)} />
        <DerivedItem label="Prob. of Waiting C(c,a)" value={`${(derived.erlangC * 100).toFixed(1)}%`} />
        <DerivedItem label="Mean Wait Time Wq"       value={`${derived.wq.toFixed(1)} min`} />
        <DerivedItem label="Sim Duration"            value={`${(config.simDuration / 60).toFixed(1)} hrs`} />
      </div>
    </div>
  </div>
);

interface SliderProps {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; color: string; onChange: (v: number) => void;
}
const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, unit, color, onChange }) => (
  <div className="cp-slider">
    <div className="cp-slider-header">
      <span className="cp-slider-label">{label}</span>
      <span className={`cp-slider-val cp-slider-val--${color}`}>
        {value} <span className="cp-slider-unit">{unit}</span>
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      className={`cp-range cp-range--${color}`}
      onChange={e => onChange(Number(e.target.value))}
    />
    <div className="cp-slider-ticks"><span>{min}</span><span>{max}</span></div>
  </div>
);

interface DerivedItemProps { label: string; value: string; warn?: boolean; }
const DerivedItem: React.FC<DerivedItemProps> = ({ label, value, warn }) => (
  <div className={`cp-di ${warn ? 'cp-di--warn' : ''}`}>
    <span className="cp-di-val">{value}</span>
    <span className="cp-di-lbl">{label}</span>
    {warn && <span className="cp-di-badge">Unstable</span>}
  </div>
);

export default ConfigPanel;
