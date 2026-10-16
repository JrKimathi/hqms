import csv
import random
from datetime import datetime, timedelta

# Configuration
start_time = datetime(2025, 5, 20, 6, 0, 0)  # 6 AM
hours = 48  # 2 days
patients = []

departments = ['Emergency', 'Outpatient', 'Radiology', 'Pharmacy', 'Lab', 'Triage']
priority_weights = [0.1, 0.15, 0.25, 0.3, 0.2]  # priority 1-5 (5 = highest)

# Arrival rate per hour (patients per hour) – busy hospital
arrival_rates = []
for h in range(hours):
    hour_of_day = (start_time + timedelta(hours=h)).hour
    if 8 <= hour_of_day <= 12:   # morning peak
        rate = 35
    elif 17 <= hour_of_day <= 20: # evening peak
        rate = 30
    elif 23 <= hour_of_day <= 5:  # night
        rate = 8
    else:
        rate = 18
    arrival_rates.append(rate)

# Generate patients
patient_id = 1
for hour_idx in range(hours):
    hour_time = start_time + timedelta(hours=hour_idx)
    rate = arrival_rates[hour_idx]
    num_patients = int(random.uniform(rate * 0.7, rate * 1.3))
    for _ in range(num_patients):
        # Arrival time within the hour
        arr_minute = random.randint(0, 59)
        arr_second = random.randint(0, 59)
        arrival = hour_time + timedelta(minutes=arr_minute, seconds=arr_second)

        # Service time (minutes) – department dependent
        dept = random.choice(departments)
        if dept == 'Emergency':
            svc_time = random.expovariate(1/12)  # mean 12 min
        elif dept == 'Radiology':
            svc_time = random.expovariate(1/20)
        else:
            svc_time = random.expovariate(1/8)

        svc_time = max(3, min(90, int(svc_time)))
        # Service start (arrival + random wait)
        wait = random.expovariate(1/5) if random.random() > 0.3 else 0
        service_start = arrival + timedelta(minutes=wait)
        service_end = service_start + timedelta(minutes=svc_time)

        # Priority (higher = more urgent)
        priority = random.choices([1,2,3,4,5], weights=priority_weights)[0]

        patients.append([
            f"P-{patient_id:05d}",
            arrival.strftime("%H:%M:%S"),
            service_start.strftime("%H:%M:%S"),
            service_end.strftime("%H:%M:%S"),
            dept,
            priority,
            random.randint(1, 6)  # server_id
        ])
        patient_id += 1

# Write CSV
with open('hospital_2days_queue_records.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['patient_id','arrival_time','service_start','service_end','department','priority','server_id'])
    writer.writerows(patients)

print(f"Generated {len(patients)} patient records over {hours} hours.")