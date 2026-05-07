/**
 * MetricsCards.tsx
 * KPI summary cards + wait time distribution + Erlang-C table + patient flow breakdown.
 */
import React from 'react';
import { SimulationResult } from '../../types/results';
import { formatDuration, formatPct } from '../../utils/formatters';
import './MetricsCards.css';

interface MetricsCardsProps {
  result: SimulationResult;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ result: r }) => (
  <div className="metrics-cards">
    {/* KPI strip */}
    <div className="mc-kpi-row">
      {[
        { label: 'Avg Wait Time',    value: formatDuration(r.avgWaitTime),       color: 'cyan',  positive: true  },
        { label: 'Throughput',       value: formatPct(r.throughput),              color: 'green', positive: true  },
        { label: 'Server Util.',     value: formatPct(r.serverUtilization),       color: 'teal',  positive: true  },
        { label: 'Max Queue Len.',   value: `${r.maxQueueLength} pts`,            color: 'amber', positive: false },
        { label: 'Avg Service Time', value: formatDuration(r.avgServiceTime),     color: 'cyan',  positive: null  },
        { label: 'Total Patients',   value: r.totalPatients.toLocaleString(),     color: 'green', positive: null  },
      ].map((k, i) => (
        <div key={i} className="mc-kpi fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
          <span className="mc-kpi-label">{k.label}</span>
          <span className={`mc-kpi-value mc-kpi-value--${k.color}`}>{k.value}</span>
        </div>
      ))}
    </div>

    {/* Bottom 2-column grid */}
    <div className="mc-grid">
      {/* Wait time bar chart */}
      <div className="card mc-card">
        <h4 className="mc-title">Wait Time Distribution</h4>
        <div className="mc-bar-chart">
          {r.waitTimeBuckets.map((b, i) => (
            <div key={i} className="mc-bc-col">
              <span className="mc-bc-pct">{b.count}</span>
              <div
                className="mc-bc-bar"
                style={{ height: `${Math.max(4, (b.count / Math.max(...r.waitTimeBuckets.map(x => x.count))) * 100)}px` }}
              />
              <span className="mc-bc-label">{b.rangeLabel}</span>
            </div>
          ))}
        </div>
        <p className="mc-note">{r.totalPatients.toLocaleString()} patients · minutes</p>
      </div>

      {/* Erlang-C table */}
      <div className="card mc-card">
        <h4 className="mc-title">Erlang-C Queue Metrics</h4>
        <div className="mc-table">
          {[
            { metric: 'Mean Wait Time (Wq)',       value: formatDuration(r.avgWaitTime)    },
            { metric: 'Mean System Time (W)',       value: formatDuration(r.avgSystemTime)  },
            { metric: 'Mean Queue Length (Lq)',     value: `${r.avgQueueLength} pts`        },
            { metric: 'Mean System Length (L)',     value: `${r.avgSystemLength} pts`       },
            { metric: 'Server Utilization (ρ)',     value: formatPct(r.serverUtilization)   },
            { metric: 'Prob. of Waiting C(c,a)',    value: formatPct(r.probWaiting)         },
          ].map((row, i) => (
            <div key={i} className="mc-table-row">
              <span className="mc-table-metric">{row.metric}</span>
              <span className="mc-table-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow breakdown */}
      <div className="card mc-card">
        <h4 className="mc-title">Patient Flow Breakdown</h4>
        <div className="mc-flow">
          {[
            { label: 'Served immediately', pct: r.servedImmediately, color: 'green' },
            { label: 'Waited < 15 min',    pct: r.waitedUnder15,     color: 'cyan'  },
            { label: 'Waited 15–30 min',   pct: r.waited15to30,      color: 'amber' },
            { label: 'Waited > 30 min',    pct: r.waitedOver30,      color: 'red'   },
          ].map((b, i) => (
            <div key={i} className="mc-flow-row">
              <span className="mc-flow-label">{b.label}</span>
              <div className="mc-flow-track">
                <div className={`mc-flow-fill mc-flow-fill--${b.color}`} style={{ width: `${b.pct}%` }} />
              </div>
              <span className="mc-flow-pct">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Server stats */}
      <div className="card mc-card">
        <h4 className="mc-title">Per-Server Statistics</h4>
        <div className="mc-servers">
          {r.serverStats.map(s => (
            <div key={s.id} className="mc-srv-row">
              <span className="mc-srv-id">Server {s.id}</span>
              <div className="mc-srv-track">
                <div className="mc-srv-fill" style={{ width: `${s.utilization}%` }} />
              </div>
              <span className="mc-srv-util">{s.utilization}%</span>
              <span className="mc-srv-pts">{s.patientsServed} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MetricsCards;