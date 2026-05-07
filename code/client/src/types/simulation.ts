export type QueueDiscipline = 'FIFO' | 'Priority' | 'LIFO' | 'Round Robin';

export interface SimulationConfig {
  servers: number;
  arrivalRate: number;       // patients per hour (λ)
  serviceTime: number;       // minutes per patient (1/μ)
  simDuration: number;       // minutes
  discipline: QueueDiscipline;
  priorityEnabled: boolean;
  warmUpPeriod: number;      // minutes
}

export interface Scenario {
  id: number;
  name: string;
  config: SimulationConfig;
  createdAt: Date;
}

export interface SimulationEvent {
  time: number;
  type: 'arrival' | 'service_start' | 'service_end' | 'departure';
  patientId: string;
  serverId?: number;
  queueLength: number;
}

export interface SimulationRun {
  id: string;
  scenarioId: number;
  scenarioName: string;
  config: SimulationConfig;
  status: 'idle' | 'running' | 'complete' | 'error';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  events: SimulationEvent[];
}

export interface DerivedMetrics {
  rho: number;          // traffic intensity ρ = λ / (c·μ)
  utilization: number;  // as percentage
  lq: number;           // mean queue length
  l: number;            // mean system length
  wq: number;           // mean wait time in queue (min)
  w: number;            // mean system time (min)
  erlangC: number;      // probability of waiting
}
