# file_parser.py
import pandas as pd
import io
from typing import List
from fastapi import UploadFile
import uuid

from models import PatientRecord


class ParsedFileResult:
    def __init__(self, filename: str, size: int, records: List[PatientRecord], errors: List[str]):
        self.filename = filename
        self.size = size
        self.records = records
        self.errors = errors


async def parse_uploaded_files(files: List[UploadFile]) -> List[ParsedFileResult]:
    """Parse multiple uploaded files (CSV, XLSX, JSON)."""
    results = []
    for file in files:
        content = await file.read()
        size = len(content)
        ext = file.filename.split('.')[-1].lower()
        
        if ext == 'csv':
            records, errors = parse_csv(content, file.filename)
        elif ext in ['xlsx', 'xls']:
            records, errors = parse_excel(content, file.filename)
        elif ext == 'json':
            records, errors = parse_json(content, file.filename)
        else:
            records, errors = [], [f"Unsupported file type: .{ext}"]
        
        results.append(ParsedFileResult(file.filename, size, records, errors))
    
    return results


def parse_csv(content: bytes, filename: str) -> tuple:
    """Parse CSV file into PatientRecord list."""
    try:
        df = pd.read_csv(io.BytesIO(content))
        return df_to_records(df, filename)
    except Exception as e:
        return [], [f"CSV parsing error: {str(e)}"]


def parse_excel(content: bytes, filename: str) -> tuple:
    """Parse Excel file into PatientRecord list."""
    try:
        df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
        return df_to_records(df, filename)
    except Exception as e:
        return [], [f"Excel parsing error: {str(e)}"]


def parse_json(content: bytes, filename: str) -> tuple:
    """Parse JSON file into PatientRecord list."""
    try:
        import json
        data = json.loads(content.decode('utf-8'))
        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict) and 'records' in data:
            df = pd.DataFrame(data['records'])
        else:
            return [], ["JSON must be an array of records or have 'records' field"]
        return df_to_records(df, filename)
    except Exception as e:
        return [], [f"JSON parsing error: {str(e)}"]


def df_to_records(df: pd.DataFrame, filename: str) -> tuple:
    """Convert DataFrame to PatientRecord list with validation."""
    errors = []
    records = []
    
    # Normalize column names
    df.columns = [str(c).lower().strip().replace(' ', '_') for c in df.columns]
    
    # Required column mappings
    required = ['arrival_time', 'service_start', 'service_end']
    missing = [r for r in required if r not in df.columns]
    if missing:
        errors.append(f"Missing columns: {', '.join(missing)}")
        return [], errors
    
    # Fill optional columns with defaults
    if 'patient_id' not in df.columns:
        df['patient_id'] = [f"IMP-{i:05d}" for i in range(len(df))]
    if 'priority' not in df.columns:
        df['priority'] = 3
    if 'department' not in df.columns:
        df['department'] = 'General'
    if 'server_id' not in df.columns:
        df['server_id'] = 1
    
    for idx, row in df.iterrows():
        try:
            arrival = time_to_minutes(row['arrival_time'])
            service_start = time_to_minutes(row['service_start'])
            service_end = time_to_minutes(row['service_end'])
            
            if service_end <= service_start:
                errors.append(f"Row {idx+2}: Invalid service times (end <= start)")
                continue
            
            record = PatientRecord(
                id=str(row['patient_id']),
                arrivalTime=float(arrival),
                serviceStart=float(service_start),
                serviceEnd=float(service_end),
                serverId=int(row.get('server_id', 1)),
                waitTime=max(0.0, service_start - arrival),
                serviceTime=service_end - service_start,
                priority=int(row.get('priority', 3)),
                department=str(row.get('department', 'General'))
            )
            records.append(record)
        except Exception as e:
            errors.append(f"Row {idx+2}: {str(e)}")
            if len(errors) > 20:
                errors.append("... more errors truncated")
                break
    
    return records, errors[:20]


def time_to_minutes(time_val) -> float:
    """Convert various time formats to minutes since midnight."""
    if isinstance(time_val, (int, float)):
        return float(time_val)
    
    time_str = str(time_val).strip()
    # Handle HH:MM:SS or HH:MM
    if ':' in time_str:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        seconds = int(parts[2]) if len(parts) > 2 else 0
        return hours * 60 + minutes + seconds / 60.0
    
    # Try as numeric string
    try:
        return float(time_str)
    except:
        return 0.0


def anonymize_records(records: List[PatientRecord]) -> List[PatientRecord]:
    """Remove PII by replacing IDs with anonymized tokens."""
    anonymized = []
    for i, rec in enumerate(records):
        anonymized.append(PatientRecord(
            id=f"ANON-{i+1:06d}",
            arrivalTime=rec.arrivalTime,
            serviceStart=rec.serviceStart,
            serviceEnd=rec.serviceEnd,
            serverId=rec.serverId,
            waitTime=rec.waitTime,
            serviceTime=rec.serviceTime,
            priority=rec.priority,
            department=rec.department
        ))
    return anonymized