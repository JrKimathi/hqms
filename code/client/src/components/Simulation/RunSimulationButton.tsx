/**
 * RunSimulationButton.tsx
 * Primary CTA button with animated progress bar and log output.
 */
import React from 'react';
import './RunSimulationButton.css';

interface RunSimulationButtonProps {
  isRunning: boolean;
  isDone: boolean;
  progress: number;
  onRun: () => void;
  onAbort?: () => void;
  onViewResults?: () => void;
  logLines?: string[];
}

const RunSimulationButton: React.FC<RunSimulationButtonProps> = ({
  isRunning, isDone, progress, onRun, onAbort, onViewResults, logLines = [],
}) => (
  <div className="rsb-wrap">
    {/* Progress */}
    {(isRunning || isDone) && (
      <div className={`rsb-progress fade-in ${isDone ? 'rsb-progress--done' : ''}`}>
        <div className="rsb-prog-header">
          <span className="rsb-prog-label">
            {isDone ? '✓ Simulation Complete' : 'Simulation running…'}
          </span>
          <span className="rsb-prog-pct">{Math.round(progress)}%</span>
        </div>
        <div className="rsb-prog-track">
          <div className="rsb-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )}

    {/* Buttons */}
    <div className="rsb-btn-row">
      <button
        className={`btn btn-primary rsb-btn ${isRunning ? 'rsb-btn--running' : ''}`}
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <><span className="rsb-spinner" /> Running…</>
        ) : (
          <><PlayIcon /> {isDone ? 'Run Again' : 'Run Simulation'}</>
        )}
      </button>

      {isRunning && onAbort && (
        <button className="btn btn-secondary rsb-abort" onClick={onAbort}>
          ■ Abort
        </button>
      )}

      {isDone && onViewResults && (
        <button className="btn btn-secondary rsb-results fade-in" onClick={onViewResults}>
          View Results →
        </button>
      )}
    </div>

    {/* Log */}
    {(isRunning || isDone) && (
      <div className="rsb-log fade-in">
        <div className="rsb-log-header">
          <span className="rsb-log-title">Simulation Log</span>
          <span className={`rsb-log-status ${isDone ? 'rsb-log-status--done' : 'rsb-log-status--run'}`}>
            {isDone ? 'Complete' : 'Running'}
          </span>
        </div>
        <div className="rsb-log-body">
          {logLines.map((line, i) => (
            <div key={i} className="rsb-log-line fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="rsb-log-time">{String(i).padStart(2, '0')}:{String(i * 2 % 60).padStart(2, '0')}</span>
              <span>{line}</span>
            </div>
          ))}
          {isRunning && (
            <div className="rsb-log-line rsb-log-line--live">
              <span className="rsb-log-time">live</span>
              <span><span className="rsb-cursor">▋</span> Processing events…</span>
            </div>
          )}
        </div>
      </div>
    )}

    {isDone && onViewResults && (
      <div className="rsb-done-card card fade-in">
        <p className="rsb-done-title">Results Ready</p>
        <p className="rsb-done-sub">Simulation complete. View metrics, charts, and queue visualizations.</p>
        <button className="btn btn-primary rsb-done-btn" onClick={onViewResults}>
          View Full Results →
        </button>
      </div>
    )}
  </div>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 1.5l9 5.5-9 5.5V1.5z" fill="currentColor"/>
  </svg>
);

export default RunSimulationButton;
