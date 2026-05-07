/**
 * ScenarioBuilder.tsx
 * Manages the list of simulation scenarios.
 */
import React, { useState } from 'react';
import { Scenario } from '../../types/simulation';
import './ScenarioBuilder.css';

interface ScenarioBuilderProps {
  scenarios: Scenario[];
  activeId: number;
  onSelect: (id: number) => void;
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
  onLoad: (id: number) => void;
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  scenarios, activeId, onSelect, onAdd, onRemove, onLoad,
}) => {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const confirmAdd = () => {
    const name = newName.trim() || `Scenario ${scenarios.length + 1}`;
    onAdd(name);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="scenario-builder card">
      <div className="card-header">
        <h3 className="card-title">Scenarios</h3>
        <span className="sb-count">{scenarios.length} defined</span>
      </div>

      <div className="sb-list">
        {scenarios.map(sc => (
          <div
            key={sc.id}
            className={`sb-item ${activeId === sc.id ? 'sb-item--active' : ''}`}
            onClick={() => { onSelect(sc.id); onLoad(sc.id); }}
          >
            <div className="sb-bullet" />
            <div className="sb-info">
              <span className="sb-name">{sc.name}</span>
              <span className="sb-meta">
                {sc.config.servers} srv · λ={sc.config.arrivalRate}/hr · μ={sc.config.serviceTime} min
              </span>
            </div>
            <div className="sb-actions" onClick={e => e.stopPropagation()}>
              {activeId === sc.id && (
                <span className="sb-active-badge">Active</span>
              )}
              {scenarios.length > 1 && (
                <button className="sb-remove" onClick={() => onRemove(sc.id)} title="Remove scenario">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="sb-new-form">
          <input
            className="sb-input"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Scenario name…"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false); }}
          />
          <div className="sb-form-actions">
            <button className="btn btn-primary sb-confirm" onClick={confirmAdd}>Add</button>
            <button className="btn btn-secondary sb-cancel" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="sb-add-btn" onClick={() => setAdding(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Scenario
        </button>
      )}
    </div>
  );
};

export default ScenarioBuilder;
