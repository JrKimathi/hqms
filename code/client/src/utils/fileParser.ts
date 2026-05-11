/**
 * fileParser.ts
 * Parses CSV / JSON hospital queue data files into PatientRecord arrays.
 */
import type { PatientRecord } from '../types/results';

export interface ParseResult {
  records: PatientRecord[];
  errors: string[];
  rowCount: number;
  skippedRows: number;
}

export interface RawRow {
  patient_id?: string;
  arrival_time?: string;
  service_start?: string;
  service_end?: string;
  department?: string;
  priority?: string;
  server_id?: string;
  [key: string]: string | undefined;
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
export function parseCSV(text: string): RawRow[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: RawRow = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

// ─── JSON ────────────────────────────────────────────────────────────────────
export function parseJSON(text: string): RawRow[] {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : data.records ?? data.patients ?? [];
  } catch {
    return [];
  }
}

// ─── Validation & mapping ────────────────────────────────────────────────────
function toMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.includes('T')
    ? timeStr.split('T')[1].split(':')
    : timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function mapRowToPatient(row: RawRow, index: number): PatientRecord | null {
  const id = row.patient_id ?? row.id ?? `P-${String(index + 1).padStart(4, '0')}`;
  const arrival = toMinutes(row.arrival_time ?? '');
  const start   = toMinutes(row.service_start ?? row.start_time ?? '');
  const end     = toMinutes(row.service_end ?? row.end_time ?? '');
  if (end <= start) return null;
  return {
    id,
    arrivalTime:  arrival,
    serviceStart: start,
    serviceEnd:   end,
    serverId:     parseInt(row.server_id ?? row.server ?? '1', 10),
    waitTime:     Math.max(0, start - arrival),
    serviceTime:  end - start,
    priority:     parseInt(row.priority ?? '1', 10),
    department:   row.department ?? row.unit ?? 'General',
  };
}

// ─── Main entry ──────────────────────────────────────────────────────────────
export async function parseFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  const errors: string[] = [];
  let rawRows: RawRow[] = [];

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    rawRows = parseCSV(text);
  } else if (ext === 'json') {
    rawRows = parseJSON(text);
  } else if (ext === 'xlsx' || ext === 'xls') {
    // For Excel, we would need a library; but your backend handles Excel.
    // If you want client-side Excel parsing, add xlsx library.
    errors.push(`Client-side Excel parsing not supported. Use backend or convert to CSV.`);
    return { records: [], errors, rowCount: 0, skippedRows: 0 };
  } else {
    errors.push(`Unsupported file type: .${ext}. Use CSV or JSON.`);
    return { records: [], errors, rowCount: 0, skippedRows: 0 };
  }

  const records: PatientRecord[] = [];
  let skipped = 0;
  rawRows.forEach((row, i) => {
    const patient = mapRowToPatient(row, i);
    if (patient) {
      records.push(patient);
    } else {
      skipped++;
      if (skipped <= 5) errors.push(`Row ${i + 2}: Invalid or missing time data — skipped.`);
    }
  });
  if (skipped > 5) errors.push(`…and ${skipped - 5} more rows skipped.`);

  return { records, errors, rowCount: rawRows.length, skippedRows: skipped };
}

// ─── Anonymisation ───────────────────────────────────────────────────────────
export function anonymiseRecords(records: PatientRecord[]): PatientRecord[] {
  return records.map((r, i) => ({
    ...r,
    id: `ANON-${String(i + 1).padStart(5, '0')}`,
  }));
}