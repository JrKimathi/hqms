/**
 * Charts.tsx
 * SVG-based charts: arrivals bar chart, queue length sparkline,
 * service time distribution, and utilization sparkline.
 * Zero external dependencies — pure SVG/CSS.
 */
import React from 'react';
import type { SimulationResult } from '../../types/results';
import '../../styles/Charts.css';

interface ChartsProps { result: SimulationResult; }

const Charts: React.FC<ChartsProps> = ({ result: r }) => {
  const maxArrivals = Math.max(...r.hourlyData.map(d => d.arrivals), 1);
  const maxQueue    = Math.max(...r.hourlyData.map(d => d.queueLength), 1);

  // SVG sparkline path from data array (normalized 0-1)
  const makePath = (values: number[], w = 300, h = 80): string => {
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * h * 0.85;
      return `${x},${y}`;
    });
    // Bezier through points
    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M${pt}`;
      const prev = arr[i - 1].split(',');
      const curr = pt.split(',');
      const cpx1 = (+prev[0] + +curr[0]) / 2;
      return `${acc} C${cpx1},${prev[1]} ${cpx1},${curr[1]} ${pt}`;
    }, '');
  };

  const arrivalVals = r.hourlyData.map(d => d.arrivals);
  const queueVals   = r.hourlyData.map(d => d.queueLength);
  const utilVals    = r.hourlyData.map(d => d.utilization);
  const svcBuckets  = r.waitTimeBuckets.map(b => b.count);

  const linePath  = makePath(queueVals);
  const utilPath  = makePath(utilVals);
  const closePath = (path: string, h = 80) =>
    `${path} L${300},${h} L0,${h} Z`;

  return (
    <div className="charts-wrap">
      {/* Arrivals bar chart */}
      <div className="card ch-card ch-card--wide">
        <h4 className="ch-title">Hourly Patient Arrivals (λ)</h4>
        <div className="ch-bar-chart">
          {r.hourlyData.map((d, i) => (
            <div key={i} className="ch-bc-col">
              <span className="ch-bc-val">{d.arrivals}</span>
              <div
                className="ch-bc-bar"
                style={{ height: `${Math.max(4, (d.arrivals / maxArrivals) * 130)}px` }}
              />
              <span className="ch-bc-label">{d.hour}</span>
            </div>
          ))}
        </div>
        <p className="ch-note">
          Peak: {Math.max(...arrivalVals)} pts/hr — Total: {r.totalPatients} patients
        </p>
      </div>

      {/* Queue length sparkline */}
      <div className="card ch-card">
        <h4 className="ch-title">Queue Length Over Time</h4>
        <div className="ch-spark">
          <div className="ch-spark-labels">
            <span>{maxQueue}</span>
            <span>0</span>
          </div>
          <svg className="ch-svg" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-amber)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="var(--accent-amber)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={linePath} fill="none" stroke="var(--accent-amber)" strokeWidth="2"/>
            <path d={closePath(linePath)} fill="url(#queueGrad)"/>
          </svg>
        </div>
        <div className="ch-axis">
          {r.hourlyData.filter((_, i) => i % 2 === 0).map(d => (
            <span key={d.hour}>{d.hour}</span>
          ))}
        </div>
        <p className="ch-note">Peak: {r.maxQueueLength} patients</p>
      </div>

      {/* Server utilization */}
      <div className="card ch-card">
        <h4 className="ch-title">Server Utilization Over Time</h4>
        <div className="ch-spark">
          <div className="ch-spark-labels"><span>100%</span><span>0%</span></div>
          <svg className="ch-svg" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={utilPath} fill="none" stroke="var(--accent-cyan)" strokeWidth="2"/>
            <path d={closePath(utilPath)} fill="url(#utilGrad)"/>
          </svg>
        </div>
        <div className="ch-axis">
          {r.hourlyData.filter((_, i) => i % 2 === 0).map(d => (
            <span key={d.hour}>{d.hour}</span>
          ))}
        </div>
        <p className="ch-note">Avg utilization: {r.serverUtilization}%</p>
      </div>

      {/* Service time distribution */}
      <div className="card ch-card">
        <h4 className="ch-title">Wait Time Distribution (buckets)</h4>
        <div className="ch-bar-chart ch-bar-chart--sm">
          {r.waitTimeBuckets.map((b, i) => {
            const maxC = Math.max(...svcBuckets, 1);
            return (
              <div key={i} className="ch-bc-col">
                <div
                  className="ch-bc-bar ch-bc-bar--teal"
                  style={{ height: `${Math.max(4, (b.count / maxC) * 90)}px` }}
                />
                <span className="ch-bc-label">{b.rangeLabel}</span>
              </div>
            );
          })}
        </div>
        <p className="ch-note">Exponential service distribution (1/μ = {r.avgServiceTime.toFixed(1)} min)</p>
      </div>
    </div>
  );
};

export default Charts;
