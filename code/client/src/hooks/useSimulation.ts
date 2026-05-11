import { useCallback, useRef, useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { SimulationConfig, SimulationRun } from '../types/simulation';
import { post } from '../services/api';
import type { SimulationResult } from '../types/results';
import { computeDerivedMetrics } from '../services/simulationService';

export function useSimulation() {
  const store = useSimulationStore();
  const abortRef = useRef(false);

  // Compute derived metrics from current config
  const derived = useMemo(() => computeDerivedMetrics(store.config), [store.config]);

  const start = useCallback(async (overrideConfig?: Partial<SimulationConfig>) => {
    abortRef.current = false;
    const config = { ...store.config, ...overrideConfig };

    const run: SimulationRun = {
      id: `sim-${Date.now()}`,
      scenarioId: store.activeScenarioId,
      scenarioName: store.scenarios.find(s => s.id === store.activeScenarioId)?.name ?? 'Custom',
      config,
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      events: [],
    };

    store.setCurrentRun(run);

    try {
      const response = await post<SimulationResult>('/simulate', config);
      const result = response.data;

      if (!abortRef.current) {
        result.scenarioName = run.scenarioName;
        result.runId = run.id;
        store.completeRun(result);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      alert('Simulation failed. Make sure the backend is running (python main.py)');
      store.setCurrentRun({ ...run, status: 'error', progress: 0 });
    }


  }, [store]);

  const abort = useCallback(() => {
    abortRef.current = true;
    if (store.currentRun) {
      store.setCurrentRun({ ...store.currentRun, status: 'idle', progress: 0 });
    }
  }, [store]);

  return {
    config: store.config,
    setServers: store.setServers,
    setArrivalRate: store.setArrivalRate,
    setServiceTime: store.setServiceTime,
    setSimDuration: store.setSimDuration,
    setDiscipline: store.setDiscipline,
    scenarios: store.scenarios,
    activeScenarioId: store.activeScenarioId,
    setActiveScenario: store.setActiveScenario,
    loadScenario: store.loadScenario,
    addScenario: store.addScenario,
    removeScenario: store.removeScenario, 
    currentRun: store.currentRun,
    isRunning: store.currentRun?.status === 'running',
    isDone: store.currentRun?.status === 'complete',
    progress: store.currentRun?.progress ?? 0,
    derived,
    start,
    abort,
  };
}