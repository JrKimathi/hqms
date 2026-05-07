/**
 * FilePreview.tsx
 * List of uploaded files with parse status, size, and remove button.
 */
import React from 'react';
import { UploadedFile } from '../../services/uploadService';
import { formatBytes } from '../../utils/formatters';
import './FilePreview.css';

interface FilePreviewProps {
  files: File[];
  uploadedFiles: UploadedFile[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  isParsing?: boolean;
}

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'csv')  return '📊';
  if (ext === 'xlsx' || ext === 'xls') return '📋';
  if (ext === 'json') return '{ }';
  return '📄';
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files, uploadedFiles, onRemove, onClear, onSubmit, isParsing
}) => (
  <div className="file-preview">
    <div className="fp-header">
      <span className="fp-title">Uploaded Files ({files.length})</span>
      <button className="btn-link" onClick={onClear}>Clear All</button>
    </div>

    <div className="fp-list">
      {files.map((f, i) => {
        const uf = uploadedFiles[i];
        const hasErrors = uf?.errors?.length > 0;
        const status = uf?.status ?? 'parsing';
        return (
          <div key={i} className={`fp-item fade-in ${hasErrors ? 'fp-item--warn' : ''}`}>
            <span className="fp-icon">{fileIcon(f.name)}</span>
            <div className="fp-info">
              <span className="fp-name">{f.name}</span>
              <div className="fp-meta">
                <span className="fp-size">{formatBytes(f.size)}</span>
                {uf && <span className="fp-records">{uf.recordCount.toLocaleString()} records</span>}
              </div>
              {hasErrors && (
                <div className="fp-errors">
                  {uf.errors.slice(0, 2).map((e, ei) => (
                    <span key={ei} className="fp-error">⚠ {e}</span>
                  ))}
                </div>
              )}
            </div>
            <span className={`fp-status fp-status--${status}`}>
              {status === 'ready'   && '● Ready'}
              {status === 'error'   && '✕ Error'}
              {status === 'parsing' && '⟳ Parsing'}
            </span>
            <button className="fp-remove" onClick={() => onRemove(i)} title="Remove file">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>

    <button
      className="btn btn-primary fp-submit"
      onClick={onSubmit}
      disabled={files.length === 0 || isParsing}
    >
      {isParsing ? (
        <><span className="fp-spinner"/>Processing…</>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 9v2.5A1.5 1.5 0 003.5 13h8a1.5 1.5 0 001.5-1.5V9M7.5 2v8M5 4.5L7.5 2 10 4.5"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Process &amp; Upload {files.length} File{files.length !== 1 ? 's' : ''}
        </>
      )}
    </button>
  </div>
);

export default FilePreview;
