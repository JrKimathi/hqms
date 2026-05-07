import React, { useState, useRef } from 'react';
import '../styles/UploadPage.css';

const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv')  return '📊';
    if (ext === 'xlsx' || ext === 'xls') return '📋';
    if (ext === 'json') return '{ }';
    return '📄';
  };

  return (
    <div className="upload-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Upload Hospital Data</h2>
          <p className="page-sub">Import patient arrival records, service time logs, and queue metrics for simulation input.</p>
        </div>
      </div>

      <div className="upload-grid">
        {/* Drop zone */}
        <div className="upload-main">
          <div
            className={`dropzone ${dragOver ? 'dropzone--over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
            <div className="dropzone-icon">
              <div className="dz-icon-ring" />
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 19v2.5A2.5 2.5 0 006.5 24h15a2.5 2.5 0 002.5-2.5V19M14 4v14M10 7.5L14 4l4 3.5" stroke="var(--accent-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="dz-title">Drop files here or <span className="dz-link">browse</span></p>
            <p className="dz-sub">Supports CSV, XLSX, XLS, JSON — Max 50MB per file</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <span className="file-list-title">Uploaded Files ({files.length})</span>
                <button className="btn-link" onClick={() => setFiles([])}>Clear All</button>
              </div>
              {files.map((f, i) => (
                <div key={i} className="file-item fade-in">
                  <span className="file-icon">{getFileIcon(f.name)}</span>
                  <div className="file-info">
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{formatBytes(f.size)}</span>
                  </div>
                  <div className="file-status">
                    <span className="status-ready">● Ready</span>
                  </div>
                  <button className="file-remove" onClick={() => removeFile(i)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button className="btn btn-primary upload-submit" disabled={files.length === 0}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 9v2.5A1.5 1.5 0 003.5 13h8a1.5 1.5 0 001.5-1.5V9M7.5 2v8M5 4.5L7.5 2 10 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Process & Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Side info */}
        <div className="upload-side">
          <div className="card info-card">
            <h4 className="info-title">Expected Data Format</h4>
            <div className="format-list">
              {[
                { col: 'patient_id',    type: 'string', desc: 'Unique patient identifier'       },
                { col: 'arrival_time',  type: 'datetime', desc: 'Time of patient arrival'       },
                { col: 'service_start', type: 'datetime', desc: 'Service commencement time'     },
                { col: 'service_end',   type: 'datetime', desc: 'Service completion time'       },
                { col: 'department',    type: 'string', desc: 'Hospital department/unit'        },
                { col: 'priority',      type: 'int',    desc: '1–5 urgency level'               },
              ].map((c) => (
                <div key={c.col} className="format-row">
                  <code className="format-col">{c.col}</code>
                  <span className={`format-type format-type--${c.type}`}>{c.type}</span>
                  <span className="format-desc">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card info-card">
            <h4 className="info-title">Data Privacy</h4>
            <div className="privacy-items">
              {[
                'All patient identifiers are anonymized upon upload',
                'Data is used exclusively for academic simulation',
                'No records are stored beyond session',
              ].map((t, i) => (
                <div key={i} className="privacy-item">
                  <span className="privacy-check">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card info-card info-card--tip">
            <div className="tip-icon">💡</div>
            <div>
              <p className="tip-title">Sample Dataset</p>
              <p className="tip-body">Don't have data yet? Download our sample hospital queue dataset to explore the simulation features.</p>
              <button className="btn-link" style={{ marginTop: '10px', fontSize: '0.82rem' }}>Download Sample CSV →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;