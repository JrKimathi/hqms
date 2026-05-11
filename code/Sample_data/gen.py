import pandas as pd

# Define the data (same as CSV)
data = [
    ["ANON-0001", "08:05", "08:12", "08:18", "Emergency", 5, 1],
    ["ANON-0002", "08:12", "08:15", "08:25", "Outpatient", 2, 2],
    ["ANON-0003", "08:18", "08:20", "08:30", "Radiology", 3, 1],
    ["ANON-0004", "08:22", "08:28", "08:35", "Emergency", 4, 3],
    ["ANON-0005", "08:28", "08:30", "08:42", "Pharmacy", 1, 2],
]

df = pd.DataFrame(data, columns=["patient_id", "arrival_time", "service_start", "service_end", "department", "priority", "server_id"])

# Save as XLSX
df.to_excel("sample_data.xlsx", index=False)

# Save as XLS (requires xlwt library)
df.to_excel("sample_data.xls", index=False, engine="xlwt")