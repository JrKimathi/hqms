import React from 'react';
import FileUploader from '../components/Upload/FileUploader';
import FilePreview from '../components/Upload/FilePreview';
import { useUpload } from '../hooks/useUpload';
import '../styles/UploadPage.css';

const UploadPage: React.FC = () => {
  const {
    files,
    uploadedFiles,
    records,
    errors,
    isDragOver,
    setIsDragOver,
    isParsing,
    isReady,
    inputRef,
    handleDrop,
    handleFileInput,
    openFilePicker,
    removeFile,
    clearAll,
    downloadSample,
  } = useUpload();

  // Submit files to backend
  const handleSubmit = async () => {
    if (files.length === 0) return;
    // The useUpload hook doesn't automatically upload; we need to call uploadFiles
    // Import uploadFiles from '../services/uploadService'
    const { uploadFiles } = await import('../services/uploadService');
    try {
      const session = await uploadFiles(files);
      console.log('Upload successful:', session);
      // Show success feedback (you can add a toast or state)
      alert(`Uploaded ${session.totalRecords} records successfully!`);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check console for details.');
    }
  };

  return (
    <div className="upload-page fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Upload Hospital Data</h2>
          <p className="page-sub">
            Import patient arrival records, service time logs, and queue metrics for simulation input.
          </p>
        </div>
      </div>

      <div className="upload-grid">
        <div className="upload-main">
          <FileUploader
            isDragOver={isDragOver}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={openFilePicker}
            isParsing={isParsing}
          />
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.json"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />

          {files.length > 0 && (
            <FilePreview
              files={files}
              uploadedFiles={uploadedFiles}
              onRemove={removeFile}
              onClear={clearAll}
              onSubmit={handleSubmit}
              isParsing={isParsing}
            />
          )}
        </div>

        <div className="upload-side">
          {/* Expected format card */}
          <div className="card info-card">
            <h4 className="info-title">Expected Data Format</h4>
            <div className="format-list">
              {[
                { col: 'patient_id', type: 'string', desc: 'Unique patient identifier' },
                { col: 'arrival_time', type: 'datetime', desc: 'Time of patient arrival' },
                { col: 'service_start', type: 'datetime', desc: 'Service commencement time' },
                { col: 'service_end', type: 'datetime', desc: 'Service completion time' },
                { col: 'department', type: 'string', desc: 'Hospital department/unit' },
                { col: 'priority', type: 'int', desc: '1–5 urgency level' },
              ].map((c) => (
                <div key={c.col} className="format-row">
                  <code className="format-col">{c.col}</code>
                  <span className={`format-type format-type--${c.type}`}>{c.type}</span>
                  <span className="format-desc">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy card */}
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

          {/* Sample dataset card */}
          <div className="card info-card info-card--tip">
            <div>
              <p className="tip-title">Sample Dataset</p>
              <p className="tip-body">
                Don't have data yet? Download our sample hospital queue dataset to explore the simulation features.
              </p>
              <button className="btn-link" onClick={downloadSample} style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                Download Sample CSV →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;