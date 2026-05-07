export interface WaitTimeBucket {
  rangeLabel: string;   // e.g. "0-5 min"
  count: number;
  percentage: number;
}

export interface HourlyDataPoint {
  hour: string;         // e.g. "08:00"
  arrivals: number;
  queueLength: number;
  utilization: number;  // 0-100
}

export interface PatientRecord {
  id: string;
  arrivalTime: number;  // minutes from sim start
  serviceStart: number;
  serviceEnd: number;
  serverId: number;
  waitTime: number;
  serviceTime: number;
  priority: number;
  department: string;
}

export interface ServerStats {
  id: number;
  busyTime: number;
  idleTime: number;
  utilization: number;
  patientsServed: number;
}

export interface SimulationResult {
  runId: string;
  scenarioName: string;
  config: import('./simulation').SimulationConfig;
  // Core metrics
  avgWaitTime: number;
  avgServiceTime: number;
  avgSystemTime: number;
  avgQueueLength: number;
  avgSystemLength: number;
  throughput: number;           // percentage
  patientsPerHour: number;
  totalPatients: number;
  maxQueueLength: number;
  maxQueueTime: number;         // when peak occurred (minutes)
  serverUtilization: number;
  idleServerTime: number;
  probWaiting: number;          // Erlang-C
  // Distributions
  waitTimeBuckets: WaitTimeBucket[];
  hourlyData: HourlyDataPoint[];
  patientRecords: PatientRecord[];
  serverStats: ServerStats[];
  // Flow breakdown
  servedImmediately: number;    // %
  waitedUnder15: number;
  waited15to30: number;
  waitedOver30: number;
}

export interface ComparisonRow {
  metric: string;
  baseline: string;
  scenario: string;
  delta: string;
  deltaPositive: boolean;
}
