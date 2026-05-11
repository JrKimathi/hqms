/**
 * FileUploader.tsx
 * Drag-and-drop zone wired to useUpload hook.
 */
import React from 'react';
import "../../styles/UploadPage.css";

interface FileUploaderProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  isParsing?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  isDragOver, onDragOver, onDragLeave, onDrop, onClick, isParsing
}) => (
  <div
    className={`file-uploader ${isDragOver ? 'file-uploader--over' : ''} ${isParsing ? 'file-uploader--parsing' : ''}`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label="File upload area"
    onKeyDown={e => e.key === 'Enter' && onClick()}
  >
    {isParsing ? (
      <div className="fu-parsing">
        <div className="fu-spinner" />
        <p className="fu-parsing-text">Parsing and anonymising data…</p>
      </div>
    ) : (
      <>
        <div className="fu-icon-wrap">
          <div className="fu-icon-ring" />
          <svg className="fu-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 19v2.5A2.5 2.5 0 006.5 24h15a2.5 2.5 0 002.5-2.5V19M14 4v14M10 7.5L14 4l4 3.5"
              stroke="var(--accent-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="fu-title">
          Drop files here or <span className="fu-link">browse</span>
        </p>
        <p className="fu-sub">CSV, XLSX, XLS, JSON — max 50 MB per file</p>
        <div className="fu-badges">
          {['CSV', 'XLSX', 'JSON'].map(f => (
            <span key={f} className="fu-badge">{f}</span>
          ))}
        </div>
      </>
    )}
  </div>
);

export default FileUploader;
