import React, { useState, useEffect, useRef } from 'react';
import '../styles/ResultsPage.css';

/* ── tiny sparkline canvas ── */
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const last = data[data.length - 1];
    const lastY = h - ((last - min) / range) * (h - 4) - 2;
    ctx.lineTo(w, lastY); ctx.lineTo(w, h); ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} width={120} height={40} className="sparkline" />;
};

/* ── bar chart ── */
const BarChart: React.FC<{ labels: string[]; values: number[]; color: string; unit: string }> =
  ({ labels, values, color, unit }) => {
    const max = Math.max(...values);
    return (
      <div className="bar-chart">
        {labels.map((lbl, i) => (
          <div key={i} className="bar-row">
            <span className="bar-lbl">{lbl}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(values[i] / max) * 100}%`, background: color }}
              />
            </div>
            <span className="bar-val">{values[i]}{unit}</span>
          </div>
        ))}
      </div>
    );
  };

/* ── queue animation ── */
const QueueViz: React.FC<{ queueLength: number; servers: number; utilization: number }> =
  ({ queueLength, servers, utilization }) => (
    <div className="queue-anim">
      <div className="qa-section">
        <p className="qa-label">Waiting Queue</p>
        <div className="qa-dots">
          {[...Array(Math.min(queueLength, 12))].map((_, i) => (
            <div
              key={i}
              className="qa-dot qa-dot--wait"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
          {queueLength > 12 && <span className="qa-overflow">+{queueLength - 12}</span>}
        </div>
      </div>
      <div className="qa-arrow">→</div>
      <div className="qa-section">
        <p className="qa-label">Servers ({servers})</p>
        <div className="qa-servers">
          {[...Array(servers)].map((_, i) => {
            const busy = i < Math.round((utilization / 100) * servers);
            return (
              <div key={i} className={`qa-server ${busy ? 'qa-server--busy' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="4" cy="7" r="1.2" fill="currentColor" />
                </svg>
                {busy && <div className="qa-server-patient" />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="qa-arrow">→</div>
      <div className="qa-section">
        <p className="qa-label">Departed</p>
        <div className="qa-departed">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="qa-dot qa-dot--done" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

/* ═══════════ MAIN PAGE ═══════════ */
const ResultsPage: React.FC = () => {
  const [tab, setTab] = useState<'metrics' | 'charts' | 'queue' | 'compare'>('metrics');

  const waitData    = [22,19,18,21,17,15,14,16,13,12,14,11,10,12,11];
  const throughput  = [38,42,41,45,47,44,48,46,50,49,51,48,52,50,53];
  const utilData    = [72,74,75,70,76,78,79,77,80,82,81,83,80,82,84];

  const metricCards = [
    { label: 'Avg Wait Time',      value: '12.4',  unit: 'min',  delta: '-33%',  color: '#00d4ff', spark: waitData    },
    { label: 'Queue Throughput',   value: '94.8',  unit: '%',    delta: '+5.6%', color: '#00e5a0', spark: throughput  },
    { label: 'Server Utilisation', value: '81.2',  unit: '%',    delta: '+6.4%', color: '#00b4a0', spark: utilData    },
    { label: 'Patients Served',    value: '4,217', unit: '',     delta: '+381',  color: '#ffb347', spark: throughput  },
    { label: 'Max Queue Length',   value: '28',    unit: 'pts',  delta: '-14',   color: '#00d4ff', spark: waitData    },
    { label: 'Avg Service Time',   value: '7.5',   unit: 'min',  delta: '-0.9',  color: '#00e5a0', spark: utilData    },
  ];

  const compareRows = [
    { metric: 'Avg Wait Time',       current: '18.4 min', optimized: '12.4 min', improvement: '32.6%', better: true  },
    { metric: 'Throughput',          current: '89.6%',    optimized: '94.8%',    improvement: '5.8%',  better: true  },
    { metric: 'Server Utilisation',  current: '76.3%',    optimized: '81.2%',    improvement: '6.4%',  better: true  },
    { metric: 'Max Queue Length',    current: '42 pts',   optimized: '28 pts',   improvement: '33.3%', better: true  },
    { metric: 'Idle Server Time',    current: '23.7%',    optimized: '18.8%',    improvement: '20.7%', better: true  },
    { metric: 'Avg Service Time',    current: '8.4 min',  optimized: '7.5 min',  improvement: '10.7%', better: true  },
  ];

  return (
    <div className="results-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Simulation Results</h2>
          <p className="page-sub">SIM-041 — Peak Hours (3 servers) — Completed in 2m 14s</p>
        </div>
        <div className="results-actions">
          <button className="btn btn-secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export Report
          </button>
          <button className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Scenario
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        {(['metrics','charts','queue','compare'] as const).map(t => (
          <button
            key={t}
            className={`results-tab ${tab === t ? 'results-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── METRICS ── */}
      {tab === 'metrics' && (
        <div className="metrics-grid fade-in">
          {metricCards.map((m, i) => (
            <div className="metric-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="mc-top">
                <div>
                  <p className="mc-label">{m.label}</p>
                  <div className="mc-value">
                    <span className="mc-num" style={{ color: m.color }}>{m.value}</span>
                    <span className="mc-unit">{m.unit}</span>
                  </div>
                </div>
                <Sparkline data={m.spark} color={m.color} />
              </div>
              <div className="mc-bottom">
                <span className="mc-delta mc-delta--pos">{m.delta} vs baseline</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHARTS ── */}
      {tab === 'charts' && (
        <div className="charts-grid fade-in">
          <div className="card chart-card chart-card--wide">
            <h4 className="chart-title">Waiting Time Over Simulation Period (minutes)</h4>
            <div className="line-chart-wrap">
              <svg viewBox="0 0 600 160" className="line-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0,1,2,3].map(i => (
                  <line key={i} x1="0" y1={i*40+10} x2="600" y2={i*40+10}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                {/* Area */}
                <path
                  d={`M ${waitData.map((v,i)=>`${i*(600/(waitData.length-1))},${160-((v/25)*140)}`).join(' L ')} L 600,160 L 0,160 Z`}
                  fill="url(#grad1)"
                />
                {/* Line */}
                <polyline
                  points={waitData.map((v,i)=>`${i*(600/(waitData.length-1))},${160-((v/25)*140)}`).join(' ')}
                  fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* Dots */}
                {waitData.map((v,i)=>(
                  <circle key={i}
                    cx={i*(600/(waitData.length-1))} cy={160-((v/25)*140)}
                    r="3.5" fill="#00d4ff" stroke="var(--bg-card)" strokeWidth="1.5"/>
                ))}
              </svg>
              <div className="chart-x-labels">
                {['0','2h','4h','6h','8h','10h','12h','14h','16h','18h','20h','22h','24h','26h','28h'].map((l,i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card chart-card">
            <h4 className="chart-title">Wait Time by Department</h4>
            <BarChart
              labels={['Emergency','Outpatient','Radiology','Pharmacy','Lab','Triage']}
              values={[8.2, 14.6, 18.3, 11.4, 9.7, 6.1]}
              color="var(--accent-cyan)"
              unit=" min"
            />
          </div>

          <div className="card chart-card">
            <h4 className="chart-title">Patients Served per Hour</h4>
            <BarChart
              labels={['6am','8am','10am','12pm','2pm','4pm','6pm']}
              values={[22, 47, 53, 49, 41, 38, 28]}
              color="var(--accent-green)"
              unit=""
            />
          </div>
        </div>
      )}

      {/* ── QUEUE ── */}
      {tab === 'queue' && (
        <div className="queue-tab fade-in">
          <div className="card queue-viz-card">
            <h4 className="chart-title">Live Queue State — t = 4h 30m</h4>
            <QueueViz queueLength={9} servers={3} utilization={81} />
          </div>

          <div className="queue-stats-grid">
            {[
              { label: 'Current Queue Length', value: '9 patients',  color: 'var(--accent-amber)' },
              { label: 'Avg Queue Length (Lq)', value: '6.3 pts',    color: 'var(--accent-cyan)'  },
              { label: 'Avg Patients in System', value: '8.7 pts',   color: 'var(--accent-teal)'  },
              { label: 'Prob. Empty System',     value: '4.2%',      color: 'var(--accent-green)' },
            ].map((s,i)=>(
              <div key={i} className="card qs-stat">
                <p className="qs-stat-label">{s.label}</p>
                <p className="qs-stat-value" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="card queue-timeline">
            <h4 className="chart-title">Queue Length Over Time</h4>
            <div className="qt-bars">
              {[3,5,9,14,12,8,6,9,11,7,5,4,6,8,7].map((v,i)=>(
                <div key={i} className="qt-bar-wrap">
                  <div
                    className="qt-bar"
                    style={{ height: `${(v/14)*100}%`, background: v>10?'var(--accent-red)':v>7?'var(--accent-amber)':'var(--accent-teal)' }}
                  />
                  <span className="qt-bar-lbl">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPARE ── */}
      {tab === 'compare' && (
        <div className="compare-tab fade-in">
          <div className="card compare-card">
            <div className="compare-header">
              <span>Metric</span>
              <span>Current System</span>
              <span>Optimized (3 Servers)</span>
              <span>Improvement</span>
            </div>
            {compareRows.map((row, i) => (
              <div key={i} className="compare-row">
                <span className="cr-metric">{row.metric}</span>
                <span className="cr-current">{row.current}</span>
                <span className="cr-optimized">{row.optimized}</span>
                <span className={`cr-improvement ${row.better ? 'cr-improvement--good' : ''}`}>
                  ↑ {row.improvement}
                </span>
              </div>
            ))}
          </div>

          <div className="compare-summary card">
            <div className="cs-icon">✦</div>
            <div>
              <h4 className="cs-title">Optimization Summary</h4>
              <p className="cs-body">
                The 3-server optimized configuration reduces average patient wait time by <strong style={{color:'var(--accent-cyan)'}}>32.6%</strong> compared
                to the current manual baseline. Queue throughput improves to <strong style={{color:'var(--accent-green)'}}>94.8%</strong> while
                server utilization increases to an efficient <strong style={{color:'var(--accent-teal)'}}>81.2%</strong>, indicating
                near-optimal resource allocation without risk of queue instability.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;