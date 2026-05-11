/**
 * simulationStore.ts
 * Zustand global store for simulation state.
 * Install: npm install zustand
 */
import { create } from 'zustand';
import type { SimulationConfig, Scenario, SimulationRun, QueueDiscipline } from '../types/simulation';
import type { SimulationResult } from '../types/results';

const DEFAULT_CONFIG: SimulationConfig = {
  servers: 3,
  arrivalRate: 12,
  serviceTime: 8,
  simDuration: 480,
  discipline: 'FIFO',
  priorityEnabled: false,
  warmUpPeriod: 30,
};

interface SimulationStore {
  // Config
  config: SimulationConfig;
  setConfig: (patch: Partial<SimulationConfig>) => void;
  setServers: (n: number) => void;
  setArrivalRate: (n: number) => void;
  setServiceTime: (n: number) => void;
  setSimDuration: (n: number) => void;
  setDiscipline: (d: QueueDiscipline) => void;

  // Scenarios
  scenarios: Scenario[];
  activeScenarioId: number;
  addScenario: (name: string) => void;
  removeScenario: (id: number) => void;
  setActiveScenario: (id: number) => void;
  loadScenario: (id: number) => void;

  // Runs
  runs: SimulationRun[];
  currentRun: SimulationRun | null;
  setCurrentRun: (run: SimulationRun | null) => void;
  updateRunProgress: (progress: number) => void;
  completeRun: (result: SimulationResult) => void;

  // Results
  results: SimulationResult[];
  activeResult: SimulationResult | null;
  setActiveResult: (r: SimulationResult | null) => void;
  addResult: (r: SimulationResult) => void;

  // Upload state
  uploadedRecordCount: number;
  setUploadedRecordCount: (n: number) => void;
}

let scenarioIdCounter = 3;

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  config: { ...DEFAULT_CONFIG },

  setConfig: (patch) => set(s => ({ config: { ...s.config, ...patch } })),
  setServers:      (n) => set(s => ({ config: { ...s.config, servers: n } })),
  setArrivalRate:  (n) => set(s => ({ config: { ...s.config, arrivalRate: n } })),
  setServiceTime:  (n) => set(s => ({ config: { ...s.config, serviceTime: n } })),
  setSimDuration:  (n) => set(s => ({ config: { ...s.config, simDuration: n } })),
  setDiscipline:   (d) => set(s => ({ config: { ...s.config, discipline: d } })),

  scenarios: [
    { id: 1, name: 'Baseline — Current System', config: { ...DEFAULT_CONFIG, servers: 2, arrivalRate: 12, serviceTime: 10 }, createdAt: new Date() },
    { id: 2, name: 'Peak Hours — 3 Servers',    config: { ...DEFAULT_CONFIG, servers: 3, arrivalRate: 18, serviceTime: 8  }, createdAt: new Date() },
  ],
  activeScenarioId: 1,

  addScenario: (name) => {
    const id = ++scenarioIdCounter;
    const config = { ...get().config };
    set(s => ({
      scenarios: [...s.scenarios, { id, name, config, createdAt: new Date() }],
      activeScenarioId: id,
    }));
  },

  removeScenario: (id) => set(s => ({
    scenarios: s.scenarios.filter(sc => sc.id !== id),
    activeScenarioId: s.activeScenarioId === id ? (s.scenarios[0]?.id ?? 0) : s.activeScenarioId,
  })),

  setActiveScenario: (id) => set({ activeScenarioId: id }),

  loadScenario: (id) => {
    const sc = get().scenarios.find(s => s.id === id);
    if (sc) set({ config: { ...sc.config }, activeScenarioId: id });
  },

  runs: [],
  currentRun: null,

  setCurrentRun: (run) => set({ currentRun: run }),

  updateRunProgress: (progress) => set(s => ({
    currentRun: s.currentRun ? { ...s.currentRun, progress } : null,
  })),

  completeRun: (result) => set(s => {
    const completed = s.currentRun
      ? { ...s.currentRun, status: 'complete' as const, progress: 100, completedAt: new Date() }
      : null;
    return {
      currentRun: completed,
      runs: completed ? [...s.runs, completed] : s.runs,
      results: [...s.results, result],
      activeResult: result,
    };
  }),

  results: [],
  activeResult: null,
  setActiveResult: (r) => set({ activeResult: r }),
  addResult: (r) => set(s => ({ results: [...s.results, r] })),

  uploadedRecordCount: 0,
  setUploadedRecordCount: (n) => set({ uploadedRecordCount: n }),
}));
