/**
 * useUpload.ts
 * Manages drag-and-drop file upload state and parsing pipeline.
 */
import { useState, useCallback, useRef } from 'react';
import { parseFilesLocally, downloadSampleCSV } from '../services/uploadService';
import type { UploadedFile } from '../services/uploadService';
import type { PatientRecord } from '../types/results';
import { useSimulationStore } from '../store/simulationStore';

export interface UploadState {
  files: File[];
  uploadedFiles: UploadedFile[];
  records: PatientRecord[];
  errors: string[];
  isDragOver: boolean;
  isParsing: boolean;
  isReady: boolean;
}

export function useUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const setCount = useSimulationStore(s => s.setUploadedRecordCount);

  const addFiles = useCallback(async (incoming: File[]) => {
    const valid = incoming.filter(f => /\.(csv|xlsx|xls|json)$/i.test(f.name));
    if (valid.length === 0) return;
    setFiles(prev => [...prev, ...valid]);
    setIsParsing(true);
    try {
      const { records: parsed, uploadedFiles: uf, totalErrors } = await parseFilesLocally(valid);
      setUploadedFiles(prev => [...prev, ...uf]);
      setRecords(prev => [...prev, ...parsed]);
      setErrors(prev => [...prev, ...totalErrors]);
      setCount(records.length + parsed.length);
    } finally {
      setIsParsing(false);
    }
  }, [records.length, setCount]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  }, [addFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploadedFiles([]);
    setRecords([]);
    setErrors([]);
    setCount(0);
  }, [setCount]);

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  return {
    files, uploadedFiles, records, errors,
    isDragOver, setIsDragOver,
    isParsing,
    isReady: files.length > 0 && !isParsing,
    inputRef,
    handleDrop, handleFileInput,
    openFilePicker, removeFile, clearAll,
    downloadSample: downloadSampleCSV,
  };
}
