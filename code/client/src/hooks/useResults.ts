/**
 * useResults.ts
 * Selects and derives data from the active simulation result.
 */
import { useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { SimulationResult, ComparisonRow } from '../types/results';
import { formatDuration, formatPct, formatDelta } from '../utils/formatters';

export function useResults() {
  const { results, activeResult, setActiveResult, runs } = useSimulationStore();

  const comparisonRows: ComparisonRow[] = useMemo(() => {
    if (results.length < 2) return [];
    const base = results[0];
    const test = results[results.length - 1];

    const delta = (b: number, t: number, higher = false): string => {
      const d = ((t - b) / b) * 100;
      return formatDelta(d);
    };
    const pos = (b: number, t: number, lowerIsBetter = true): boolean =>
      lowerIsBetter ? t < b : t > b;

    return [
      { metric: 'Avg Wait Time',    baseline: formatDuration(base.avgWaitTime),    scenario: formatDuration(test.avgWaitTime),    delta: delta(base.avgWaitTime, test.avgWaitTime),       deltaPositive: pos(base.avgWaitTime, test.avgWaitTime)    },
      { metric: 'Throughput',       baseline: formatPct(base.throughput),           scenario: formatPct(test.throughput),           delta: delta(base.throughput, test.throughput),          deltaPositive: pos(base.throughput, test.throughput, false)},
      { metric: 'Server Util.',     baseline: formatPct(base.serverUtilization),    scenario: formatPct(test.serverUtilization),    delta: delta(base.serverUtilization, test.serverUtilization), deltaPositive: pos(base.serverUtilization, test.serverUtilization) },
      { metric: 'Max Queue Length', baseline: `${base.maxQueueLength} pts`,         scenario: `${test.maxQueueLength} pts`,         delta: delta(base.maxQueueLength, test.maxQueueLength),  deltaPositive: pos(base.maxQueueLength, test.maxQueueLength)},
      { metric: 'Avg Service Time', baseline: formatDuration(base.avgServiceTime),  scenario: formatDuration(test.avgServiceTime),  delta: delta(base.avgServiceTime, test.avgServiceTime),  deltaPositive: pos(base.avgServiceTime, test.avgServiceTime)},
      { metric: 'Idle Server Time', baseline: formatPct(base.idleServerTime),       scenario: formatPct(test.idleServerTime),       delta: delta(base.idleServerTime, test.idleServerTime),  deltaPositive: pos(base.idleServerTime, test.idleServerTime, false) },
    ];
  }, [results]);

  const kpis = useMemo(() => {
    if (!activeResult) return [];
    const r = activeResult;
    return [
      { label: 'Avg Wait Time',    value: formatDuration(r.avgWaitTime),    positive: true  },
      { label: 'Throughput',       value: formatPct(r.throughput),           positive: true  },
      { label: 'Server Util.',     value: formatPct(r.serverUtilization),    positive: true  },
      { label: 'Max Queue Len.',   value: `${r.maxQueueLength} pts`,         positive: false },
      { label: 'Avg Service Time', value: formatDuration(r.avgServiceTime),  positive: null  },
      { label: 'Total Patients',   value: String(r.totalPatients),           positive: null  },
    ];
  }, [activeResult]);

  return {
    results, activeResult, setActiveResult,
    runs, comparisonRows, kpis,
    hasComparison: results.length >= 2,
  };
}
