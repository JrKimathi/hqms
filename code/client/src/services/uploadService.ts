/**
 * uploadService.ts – Self-contained version (no broken imports)
 */
import type { PatientRecord } from '../types/results';

export interface UploadSession {
  sessionId: string;
  files: UploadedFile[];
  totalRecords: number;
  createdAt: Date;
}

export interface UploadedFile {
  name: string;
  size: number;
  recordCount: number;
  errors: string[];
  status: 'parsing' | 'ready' | 'error';
}

// Simple local CSV parser (no external dependencies)
async function parseFileLocally(file: File): Promise<{ records: PatientRecord[]; errors: string[] }> {
  const text = await file.text();
  const errors: string[] = [];
  const records: PatientRecord[] = [];

  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    errors.push('File must have header and at least one data row');
    return { records, errors };
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const required = ['arrival_time', 'service_start', 'service_end'];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length) {
    errors.push(`Missing required columns: ${missing.join(', ')}`);
    return { records, errors };
  }

  const toMinutes = (t: string) => {
    if (!t) return 0;
    const parts = t.split(':');
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    return h * 60 + m;
  };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

    const arrival = toMinutes(row['arrival_time']);
    const start = toMinutes(row['service_start']);
    const end = toMinutes(row['service_end']);

    if (end <= start) {
      errors.push(`Row ${i + 1}: invalid times (end <= start)`);
      continue;
    }

    records.push({
      id: row['patient_id'] || `P-${i}`,
      arrivalTime: arrival,
      serviceStart: start,
      serviceEnd: end,
      serverId: parseInt(row['server_id'] || '1'),
      waitTime: Math.max(0, start - arrival),
      serviceTime: end - start,
      priority: parseInt(row['priority'] || '1'),
      department: row['department'] || 'General',
    });
  }

  return { records, errors };
}

export async function parseFilesLocally(files: File[]): Promise<{
  records: PatientRecord[];
  uploadedFiles: UploadedFile[];
  totalErrors: string[];
}> {
  const allRecords: PatientRecord[] = [];
  const uploadedFiles: UploadedFile[] = [];
  const totalErrors: string[] = [];

  for (const file of files) {
    const { records, errors } = await parseFileLocally(file);
    allRecords.push(...records);
    uploadedFiles.push({
      name: file.name,
      size: file.size,
      recordCount: records.length,
      errors,
      status: errors.length > 0 && records.length === 0 ? 'error' : 'ready',
    });
    totalErrors.push(...errors);
  }

  // Anonymise IDs
  const anonymised = allRecords.map((r, idx) => ({ ...r, id: `ANON-${idx + 1}` }));
  return { records: anonymised, uploadedFiles, totalErrors };
}

export async function uploadFiles(files: File[]): Promise<UploadSession> {
  // For now, always use local parsing (backend optional)
  const { records, uploadedFiles, totalErrors } = await parseFilesLocally(files);
  console.log('Upload successful', { records: records.length, uploadedFiles, errors: totalErrors });
  return {
    sessionId: `local-${Date.now()}`,
    files: uploadedFiles,
    totalRecords: records.length,
    createdAt: new Date(),
  };
}

export function downloadSampleCSV(): void {
  const header = 'patient_id,arrival_time,service_start,service_end,department,priority';
  const rows = Array.from({ length: 20 }, (_, i) => {
    const arrH = 8 + Math.floor(i / 4);
    const arrM = (i * 7) % 60;
    const svcStart = arrM + Math.floor(Math.random() * 5);
    const svcEnd = svcStart + 5 + Math.floor(Math.random() * 10);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `P-${(i + 1).toString().padStart(4, '0')},${pad(arrH)}:${pad(arrM)},${pad(arrH)}:${pad(svcStart % 60)},${pad(arrH)}:${pad(svcEnd % 60)},General,${1 + (i % 5)}`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hospital_queue_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

console.log('[uploadService] Module loaded');