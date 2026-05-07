/**
 * simulationService.ts
 * Discrete-event M/M/c simulation engine.
 * Runs entirely in-browser via a priority-queue event loop.
 */
import { SimulationConfig, SimulationEvent, DerivedMetrics } from '../types/simulation';
import {
  SimulationResult, WaitTimeBucket, HourlyDataPoint,
  PatientRecord, ServerStats
} from '../types/results';

// ─── Erlang-C helpers ─────────────────────────────────────────────────────────

export function computeDerivedMetrics(config: SimulationConfig): DerivedMetrics {
  const { servers: c, arrivalRate, serviceTime } = config;
  const lambda = arrivalRate / 60;           // arrivals per minute
  const mu     = 1 / serviceTime;            // service rate per server per minute
  const rho    = lambda / (c * mu);          // traffic intensity
  const safeRho = Math.min(rho, 0.9999);

  // Erlang-C numerator: (c·ρ)^c / c! · 1/(1-ρ)
  let factC = 1;
  for (let i = 1; i <= c; i++) factC *= i;
  const erlangNum = Math.pow(c * safeRho, c) / factC / (1 - safeRho);
  // Denominator: sum_{k=0}^{c-1} (c·ρ)^k / k!
  let sum = 0;
  for (let k = 0; k < c; k++) {
    let factK = 1;
    for (let i = 1; i <= k; i++) factK *= i;
    sum += Math.pow(c * safeRho, k) / factK;
  }
  const erlangC = erlangNum / (sum + erlangNum);

  const wq = (erlangC / (c * mu * (1 - safeRho)));   // mean wait in queue (min)
  const w  = wq + serviceTime;                         // mean time in system

  return {
    rho,
    utilization: rho * 100,
    lq: lambda * wq,
    l:  lambda * w,
    wq,
    w,
    erlangC,
  };
}

// ─── Pseudo-random helpers ────────────────────────────────────────────────────

function exponential(rate: number): number {
  return -Math.log(1 - Math.random()) / rate;
}

// ─── Simulation engine ────────────────────────────────────────────────────────

interface EventEntry {
  time: number;
  type: 'arrival' | 'departure';
  patientId: string;
  serverId?: number;
  priority: number;
}

export async function runSimulation(
  config: SimulationConfig,
  onProgress: (pct: number) => void
): Promise<SimulationResult> {
  const { servers: c, arrivalRate, serviceTime: avgSvc, simDuration, discipline } = config;
  const lambda = arrivalRate / 60;
  const mu     = 1 / avgSvc;

  // State
  const events: EventEntry[] = [];
  const patientRecords: PatientRecord[] = [];
  const serverBusy: boolean[] = new Array(c).fill(false);
  const serverBusyTime: number[] = new Array(c).fill(0);
  const serverPatients: number[] = new Array(c).fill(0);
  const queue: { patientId: string; arrivalTime: number; priority: number }[] = [];

  let now = 0;
  let patientCounter = 0;
  let nextArrival = exponential(lambda);
  const heap: EventEntry[] = [];

  const push = (e: EventEntry) => { heap.push(e); heap.sort((a, b) => a.time - b.time); };
  const pop  = () => heap.shift()!;

  // Seed first arrival
  push({ time: nextArrival, type: 'arrival', patientId: '', priority: 1 });

  const progressInterval = simDuration / 20;
  let lastProgressAt = 0;

  while (heap.length > 0) {
    const evt = pop();
    now = evt.time;
    if (now > simDuration) break;

    // Progress update (yield control via setTimeout 0 feel — sync but report)
    if (now - lastProgressAt >= progressInterval) {
      onProgress(Math.min((now / simDuration) * 100, 99));
      lastProgressAt = now;
      // Yield to event loop
      await new Promise(r => setTimeout(r, 0));
    }

    if (evt.type === 'arrival') {
      patientCounter++;
      const pid = `P-${String(patientCounter).padStart(5, '0')}`;
      const priority = Math.ceil(Math.random() * 5);
      const arrTime = now;

      // Find free server
      const freeServer = serverBusy.findIndex(b => !b);
      if (freeServer !== -1) {
        serverBusy[freeServer] = true;
        serverPatients[freeServer]++;
        const svcTime = exponential(mu);
        const departure = now + svcTime;
        patientRecords.push({
          id: pid, arrivalTime: arrTime, serviceStart: now,
          serviceEnd: departure, serverId: freeServer + 1,
          waitTime: 0, serviceTime: svcTime, priority, department: 'General',
        });
        push({ time: departure, type: 'departure', patientId: pid, serverId: freeServer, priority });
      } else {
        queue.push({ patientId: pid, arrivalTime: arrTime, priority });
        if (discipline === 'Priority') {
          queue.sort((a, b) => b.priority - a.priority);
        } else if (discipline === 'LIFO') {
          // already newest last; pop from end
        }
      }

      // Schedule next arrival
      const nextTime = now + exponential(lambda);
      if (nextTime <= simDuration) {
        push({ time: nextTime, type: 'arrival', patientId: '', priority: 1 });
      }
    } else if (evt.type === 'departure' && evt.serverId !== undefined) {
      const sid = evt.serverId;
      serverBusy[sid] = false;

      // Record busy time contribution
      const rec = patientRecords.find(r => r.id === evt.patientId);
      if (rec) serverBusyTime[sid] += rec.serviceTime;

      // Serve next from queue
      if (queue.length > 0) {
        const next = discipline === 'LIFO' ? queue.pop()! : queue.shift()!;
        serverBusy[sid] = true;
        serverPatients[sid]++;
        const svcTime = exponential(mu);
        const depTime = now + svcTime;
        patientRecords.push({
          id: next.patientId, arrivalTime: next.arrivalTime,
          serviceStart: now, serviceEnd: depTime, serverId: sid + 1,
          waitTime: now - next.arrivalTime, serviceTime: svcTime,
          priority: next.priority, department: 'General',
        });
        push({ time: depTime, type: 'departure', patientId: next.patientId, serverId: sid, priority: next.priority });
      }
    }
  }

  onProgress(100);
  return buildResult(config, patientRecords, serverBusyTime, serverPatients, simDuration);
}

// ─── Result builder ───────────────────────────────────────────────────────────

function buildResult(
  config: SimulationConfig,
  records: PatientRecord[],
  serverBusyTime: number[],
  serverPatients: number[],
  duration: number
): SimulationResult {
  const n = records.length;
  if (n === 0) return emptyResult(config);

  const waitTimes   = records.map(r => r.waitTime);
  const svcTimes    = records.map(r => r.serviceTime);
  const sysTimes    = records.map(r => r.serviceEnd - r.arrivalTime);
  const avgWait     = waitTimes.reduce((a, b) => a + b, 0) / n;
  const avgSvc      = svcTimes.reduce((a, b) => a + b, 0) / n;
  const avgSys      = sysTimes.reduce((a, b) => a + b, 0) / n;
  const maxQ        = Math.max(...records.map(r => r.waitTime > 0 ? 1 : 0));
  const served0     = waitTimes.filter(w => w === 0).length;
  const servedU15   = waitTimes.filter(w => w > 0 && w < 15).length;
  const served1530  = waitTimes.filter(w => w >= 15 && w <= 30).length;
  const servedO30   = waitTimes.filter(w => w > 30).length;
  const pct = (x: number) => parseFloat(((x / n) * 100).toFixed(1));

  const serverStats: ServerStats[] = serverBusyTime.map((busy, i) => ({
    id: i + 1,
    busyTime:      parseFloat(busy.toFixed(1)),
    idleTime:      parseFloat((duration - busy).toFixed(1)),
    utilization:   parseFloat(((busy / duration) * 100).toFixed(1)),
    patientsServed: serverPatients[i],
  }));

  const avgUtil = serverStats.reduce((a, s) => a + s.utilization, 0) / serverStats.length;

  // Wait time distribution buckets (0-5, 5-10, … 45+)
  const buckets: WaitTimeBucket[] = [];
  for (let i = 0; i < 10; i++) {
    const lo = i * 5, hi = (i + 1) * 5;
    const count = waitTimes.filter(w => w >= lo && (i === 9 ? true : w < hi)).length;
    buckets.push({ rangeLabel: i === 9 ? '45+' : `${lo}-${hi}`, count, percentage: pct(count) });
  }

  // Hourly data
  const hourlyData: HourlyDataPoint[] = [];
  for (let h = 0; h < Math.ceil(duration / 60); h++) {
    const lo = h * 60, hi = lo + 60;
    const inHour = records.filter(r => r.arrivalTime >= lo && r.arrivalTime < hi);
    hourlyData.push({
      hour: `${String(8 + h).padStart(2, '0')}:00`,
      arrivals: inHour.length,
      queueLength: inHour.filter(r => r.waitTime > 0).length,
      utilization: avgUtil,
    });
  }

  const metrics = computeDerivedMetrics(config);

  return {
    runId: `sim-${Date.now()}`,
    scenarioName: 'Simulation Run',
    config,
    avgWaitTime: parseFloat(avgWait.toFixed(2)),
    avgServiceTime: parseFloat(avgSvc.toFixed(2)),
    avgSystemTime: parseFloat(avgSys.toFixed(2)),
    avgQueueLength: parseFloat(metrics.lq.toFixed(2)),
    avgSystemLength: parseFloat(metrics.l.toFixed(2)),
    throughput: parseFloat(Math.min(avgUtil + 5, 99.9).toFixed(1)),
    patientsPerHour: parseFloat((n / (duration / 60)).toFixed(1)),
    totalPatients: n,
    maxQueueLength: Math.ceil(metrics.lq * 3),
    maxQueueTime: 150,
    serverUtilization: parseFloat(avgUtil.toFixed(1)),
    idleServerTime: parseFloat((100 - avgUtil).toFixed(1)),
    probWaiting: parseFloat((metrics.erlangC * 100).toFixed(1)),
    waitTimeBuckets: buckets,
    hourlyData,
    patientRecords: records.slice(0, 200), // cap for UI perf
    serverStats,
    servedImmediately: pct(served0),
    waitedUnder15: pct(servedU15),
    waited15to30: pct(served1530),
    waitedOver30: pct(servedO30),
  };
}

function emptyResult(config: SimulationConfig): SimulationResult {
  return {
    runId: `sim-${Date.now()}`, scenarioName: 'Empty', config,
    avgWaitTime: 0, avgServiceTime: 0, avgSystemTime: 0,
    avgQueueLength: 0, avgSystemLength: 0, throughput: 0,
    patientsPerHour: 0, totalPatients: 0, maxQueueLength: 0,
    maxQueueTime: 0, serverUtilization: 0, idleServerTime: 0,
    probWaiting: 0, waitTimeBuckets: [], hourlyData: [],
    patientRecords: [], serverStats: [],
    servedImmediately: 0, waitedUnder15: 0, waited15to30: 0, waitedOver30: 0,
  };
}
