# simulation_engine.py
import math
import random
import heapq
from typing import List, Tuple, Dict
from collections import deque

from models import SimulationConfig, SimulationResult, PatientRecord, ServerStats, WaitTimeBucket, HourlyDataPoint


def compute_derived_metrics(config: SimulationConfig) -> dict:
    """Erlang-C derived metrics for preview and result enrichment."""
    c = config.servers
    lambda_rate = config.arrivalRate / 60.0  # arrivals per minute
    mu = 1.0 / config.serviceTime  # service rate per server per minute
    rho = lambda_rate / (c * mu)
    
    if rho >= 1.0:
        return {
            "rho": rho,
            "utilization": min(rho * 100, 99.9),
            "lq": float('inf'),
            "l": float('inf'),
            "wq": float('inf'),
            "w": float('inf'),
            "erlangC": 1.0
        }
    
    # Erlang-C calculation
    safe_rho = min(rho, 0.9999)
    fact_c = math.factorial(c)
    erlang_num = (c * safe_rho) ** c / fact_c / (1 - safe_rho)
    
    # Sum for k=0 to c-1 of (c·ρ)^k / k!
    sum_k = 0.0
    for k in range(c):
        fact_k = math.factorial(k)
        sum_k += (c * safe_rho) ** k / fact_k
    
    erlang_c = erlang_num / (sum_k + erlang_num)
    
    wq = erlang_c / (c * mu * (1 - safe_rho))
    w = wq + config.serviceTime
    lq = lambda_rate * wq
    l = lambda_rate * w
    
    return {
        "rho": rho,
        "utilization": rho * 100,
        "lq": lq,
        "l": l,
        "wq": wq,
        "w": w,
        "erlangC": erlang_c
    }


def exponential(rate: float) -> float:
    """Generate exponential random variate with given rate (per minute)."""
    if rate <= 0:
        return float('inf')
    return -math.log(1 - random.random()) / rate


def run_simulation(config: SimulationConfig) -> SimulationResult:
    """Discrete-event M/M/c simulation with multiple queue disciplines."""
    random.seed(42)  # Reproducibility
    
    c = config.servers
    lambda_rate = config.arrivalRate / 60.0  # per minute
    mu = 1.0 / config.serviceTime  # service rate per server per minute
    duration = config.simDuration
    discipline = config.discipline
    
    # State
    server_busy = [False] * c
    server_busy_time = [0.0] * c
    server_patients = [0] * c
    queue: List[Tuple[float, int, str]] = []  # (priority, arrival_time, patient_id) for priority; else simple queue
    
    # For FIFO/LIFO: simple deque
    fifo_queue = deque()
    lifo_queue = []  # list used as stack
    
    # For Round Robin: store next server index
    rr_next_server = 0
    
    events = []  # heap of (time, type, patient_id, server_id)
    patient_records: List[PatientRecord] = []
    patient_counter = 0
    
    # Schedule first arrival
    next_arrival = exponential(lambda_rate)
    heapq.heappush(events, (next_arrival, 'arrival', '', -1))
    
    now = 0.0
    
    while events and now <= duration:
        event_time, event_type, patient_id, server_id = heapq.heappop(events)
        now = event_time
        if now > duration:
            break
        
        if event_type == 'arrival':
            # Generate new patient
            patient_counter += 1
            pid = f"P-{patient_counter:05d}"
            priority = random.randint(1, 5)  # 1=lowest, 5=highest
            arrival_time = now
            
            # Find free server
            free_server = None
            for i, busy in enumerate(server_busy):
                if not busy:
                    free_server = i
                    break
            
            if free_server is not None:
                # Serve immediately
                server_busy[free_server] = True
                server_patients[free_server] += 1
                service_duration = exponential(mu)
                departure = now + service_duration
                
                patient_records.append(PatientRecord(
                    id=pid,
                    arrivalTime=arrival_time,
                    serviceStart=now,
                    serviceEnd=departure,
                    serverId=free_server + 1,
                    waitTime=0.0,
                    serviceTime=service_duration,
                    priority=priority,
                    department="General"
                ))
                heapq.heappush(events, (departure, 'departure', pid, free_server))
            else:
                # Add to queue based on discipline
                if discipline == 'Priority':
                    # priority higher value = higher priority (treat as negative for heapq)
                    heapq.heappush(queue, (-priority, arrival_time, pid))
                elif discipline == 'LIFO':
                    lifo_queue.append((arrival_time, pid, priority))
                else:  # FIFO or Round Robin (RR handled same as FIFO for queue)
                    fifo_queue.append((arrival_time, pid, priority))
            
            # Schedule next arrival
            interarrival = exponential(lambda_rate)
            if now + interarrival <= duration:
                heapq.heappush(events, (now + interarrival, 'arrival', '', -1))
        
        elif event_type == 'departure':
            # Free server
            sid = server_id
            server_busy[sid] = False
            
            # Find and record service time (from patient record)
            for rec in patient_records:
                if rec.id == patient_id:
                    server_busy_time[sid] += rec.serviceTime
                    break
            
            # Serve next patient from queue
            next_patient = None
            next_arrival_time = None
            next_pid = None
            next_priority = None
            
            if discipline == 'Priority' and queue:
                neg_priority, arr_time, pid = heapq.heappop(queue)
                next_patient = pid
                next_arrival_time = arr_time
                next_priority = -neg_priority
            elif discipline == 'LIFO' and lifo_queue:
                arr_time, pid, prio = lifo_queue.pop()
                next_patient = pid
                next_arrival_time = arr_time
                next_priority = prio
            elif fifo_queue:
                arr_time, pid, prio = fifo_queue.popleft()
                next_patient = pid
                next_arrival_time = arr_time
                next_priority = prio
            
            if next_patient:
                server_busy[sid] = True
                server_patients[sid] += 1
                service_duration = exponential(mu)
                departure = now + service_duration
                
                patient_records.append(PatientRecord(
                    id=next_patient,
                    arrivalTime=next_arrival_time,
                    serviceStart=now,
                    serviceEnd=departure,
                    serverId=sid + 1,
                    waitTime=now - next_arrival_time,
                    serviceTime=service_duration,
                    priority=next_priority,
                    department="General"
                ))
                heapq.heappush(events, (departure, 'departure', next_patient, sid))
    
    # Build result from patient records
    return build_result(config, patient_records, server_busy_time, server_patients, duration)


def build_result(config: SimulationConfig, records: List[PatientRecord],
                 server_busy_time: List[float], server_patients: List[int],
                 duration: float) -> SimulationResult:
    """Convert simulation logs to typed result."""
    n = len(records)
    if n == 0:
        # Return empty result
        return SimulationResult(
            runId="empty",
            scenarioName="Empty Run",
            config=config,
            avgWaitTime=0, avgServiceTime=0, avgSystemTime=0,
            avgQueueLength=0, avgSystemLength=0, throughput=0,
            patientsPerHour=0, totalPatients=0, maxQueueLength=0,
            maxQueueTime=0, serverUtilization=0, idleServerTime=0,
            probWaiting=0, waitTimeBuckets=[], hourlyData=[],
            patientRecords=[], serverStats=[],
            servedImmediately=0, waitedUnder15=0, waited15to30=0, waitedOver30=0
        )
    
    wait_times = [r.waitTime for r in records]
    service_times = [r.serviceTime for r in records]
    system_times = [r.serviceEnd - r.arrivalTime for r in records]
    
    avg_wait = sum(wait_times) / n
    avg_svc = sum(service_times) / n
    avg_sys = sum(system_times) / n
    
    # Immediate vs waited
    served_imm = sum(1 for w in wait_times if w == 0)
    under15 = sum(1 for w in wait_times if 0 < w < 15)
    btwn15_30 = sum(1 for w in wait_times if 15 <= w <= 30)
    over30 = sum(1 for w in wait_times if w > 30)
    
    pct = lambda x: round((x / n) * 100, 1)
    
    # Server stats
    server_stats = []
    for i in range(len(server_busy_time)):
        util = (server_busy_time[i] / duration) * 100 if duration > 0 else 0
        server_stats.append(ServerStats(
            id=i+1,
            busyTime=round(server_busy_time[i], 1),
            idleTime=round(duration - server_busy_time[i], 1),
            utilization=round(util, 1),
            patientsServed=server_patients[i]
        ))
    
    avg_util = sum(s.utilization for s in server_stats) / len(server_stats)
    
    # Wait time buckets (0-5, 5-10, ...)
    buckets = []
    for i in range(10):
        lo = i * 5
        hi = (i + 1) * 5
        if i == 9:
            count = sum(1 for w in wait_times if w >= lo)
        else:
            count = sum(1 for w in wait_times if lo <= w < hi)
        buckets.append(WaitTimeBucket(
            rangeLabel=f"{lo}-{hi}" if i < 9 else "45+",
            count=count,
            percentage=pct(count)
        ))
    
    # Hourly data
    hourly_data = []
    for hour_idx in range(int(duration / 60) + 1):
        start = hour_idx * 60
        end = start + 60
        arrivals_in_hour = [r for r in records if start <= r.arrivalTime < end]
        queue_len_hour = sum(1 for r in arrivals_in_hour if r.waitTime > 0)
        hourly_data.append(HourlyDataPoint(
            hour=f"{8 + hour_idx:02d}:00",
            arrivals=len(arrivals_in_hour),
            queueLength=queue_len_hour,
            utilization=round(avg_util, 1)
        ))
    
    derived = compute_derived_metrics(config)
    
    # Compute max queue length (approximate from wait time > 0)
    max_queue = max((sum(1 for r in records if r.arrivalTime <= t and r.serviceStart > t) 
                     for t in range(0, int(duration), 10)), default=0)
    
    return SimulationResult(
        runId="pending",
        scenarioName=config.discipline.value,
        config=config,
        avgWaitTime=round(avg_wait, 2),
        avgServiceTime=round(avg_svc, 2),
        avgSystemTime=round(avg_sys, 2),
        avgQueueLength=round(derived["lq"], 2),
        avgSystemLength=round(derived["l"], 2),
        throughput=round(min(avg_util + 5, 99.9), 1),
        patientsPerHour=round(n / (duration / 60), 1),
        totalPatients=n,
        maxQueueLength=max_queue,
        maxQueueTime=max(wait_times) if wait_times else 0,
        serverUtilization=round(avg_util, 1),
        idleServerTime=round(100 - avg_util, 1),
        probWaiting=round(derived["erlangC"] * 100, 1),
        waitTimeBuckets=buckets,
        hourlyData=hourly_data,
        patientRecords=records[:200],  # limit for response size
        serverStats=server_stats,
        servedImmediately=pct(served_imm),
        waitedUnder15=pct(under15),
        waited15to30=pct(btwn15_30),
        waitedOver30=pct(over30)
    )