/**
 * uploadService.ts
 * Handles file upload and data pre-processing pipeline.
 * Falls back to local parsing when the backend is unavailable.
 */
import { postForm } from './api';
import { parseFile, anonymiseRecords, ParseResult } from '../utils/fileParser';
import { PatientRecord } from '../types/results';

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

/**
 * Parse files locally (no backend required).
 * Returns anonymised patient records suitable for simulation.
 */
export async function parseFilesLocally(files: File[]): Promise<{
  records: PatientRecord[];
  uploadedFiles: UploadedFile[];
  totalErrors: string[];
}> {
  const results: ParseResult[] = [];
  const uploadedFiles: UploadedFile[] = [];
  const totalErrors: string[] = [];

  for (const file of files) {
    const result = await parseFile(file);
    results.push(result);
    uploadedFiles.push({
      name: file.name,
      size: file.size,
      recordCount: result.records.length,
      errors: result.errors,
      status: result.errors.length > 0 && result.records.length === 0 ? 'error' : 'ready',
    });
    totalErrors.push(...result.errors);
  }

  const allRecords = results.flatMap(r => r.records);
  const anonymised = anonymiseRecords(allRecords);

  return { records: anonymised, uploadedFiles, totalErrors };
}

/**
 * Upload files to the backend for server-side processing.
 * Falls back to local parsing on failure.
 */
export async function uploadFiles(files: File[]): Promise<UploadSession> {
  try {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    const res = await postForm<UploadSession>('/upload', form);
    return res.data;
  } catch {
    // Offline / no backend — parse locally and mock a session
    const { records, uploadedFiles } = await parseFilesLocally(files);
    return {
      sessionId: `local-${Date.now()}`,
      files: uploadedFiles,
      totalRecords: records.length,
      createdAt: new Date(),
    };
  }
}

/** Generate and download a sample CSV for testing */
export function downloadSampleCSV(): void {
  const header = 'patient_id,arrival_time,service_start,service_end,department,priority';
  const rows = Array.from({ length: 20 }, (_, i) => {
    const arrH = 8 + Math.floor(i / 4);
    const arrM = (i * 7) % 60;
    const svcStart = arrM + Math.floor(Math.random() * 5);
    const svcEnd   = svcStart + 5 + Math.floor(Math.random() * 10);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `P-${String(i+1).padStart(4,'0')},${pad(arrH)}:${pad(arrM)},${pad(arrH)}:${pad(svcStart % 60)},${pad(arrH)}:${pad(svcEnd % 60)},General,${1 + (i % 5)}`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'hospital_queue_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}
