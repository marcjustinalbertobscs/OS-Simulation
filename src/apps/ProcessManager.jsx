import React, { useState } from 'react';
import { useOS } from '../hooks/useOS';
import '../styles/process-scheduler.css';

/**
 * Process Manager App
 * Displays simulated processes with their states: Ready, Running, Waiting, Terminated
 */

const ProcessManager = () => {
  const {
    createProcess,
    deleteProcess,
    updateProcessState,
    getAllProcesses,
  } = useOS();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessBurst, setNewProcessBurst] = useState(3);
  const [newProcessPriority, setNewProcessPriority] = useState(3);

  const processes = getAllProcesses();

  const handleCreateProcess = () => {
    if (newProcessName.trim()) {
      createProcess(newProcessName, parseInt(newProcessBurst), parseInt(newProcessPriority));
      setNewProcessName('');
      setNewProcessBurst(3);
      setNewProcessPriority(3);
      setShowCreateDialog(false);
    }
  };

  const handleDeleteProcess = (processId) => {
    deleteProcess(processId);
  };

  const toggleProcessState = (processId, currentState) => {
    const states = ['Ready', 'Running', 'Waiting', 'Terminated'];
    const currentIndex = states.indexOf(currentState);
    const nextState = states[(currentIndex + 1) % states.length];
    updateProcessState(processId, nextState);
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'Ready':
        return '#0078d4';
      case 'Running':
        return '#107c10';
      case 'Waiting':
        return '#ffc800';
      case 'Terminated':
        return '#8a8a8a';
      default:
        return '#000';
    }
  };

  return (
    <div className="process-manager">
      <div className="process-manager-header">
        <h2>Process Manager</h2>
        <div className="process-controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateDialog(true)}
          >
            + Create Process
          </button>
        </div>
      </div>

      {showCreateDialog && (
        <div className="process-dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="process-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Process</h3>
            <div className="dialog-form">
              <div className="form-group">
                <label>Process Name:</label>
                <input
                  type="text"
                  value={newProcessName}
                  onChange={(e) => setNewProcessName(e.target.value)}
                  placeholder="e.g., My App"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProcess()}
                />
              </div>
              <div className="form-group">
                <label>Burst Time (ms):</label>
                <input
                  type="number"
                  value={newProcessBurst}
                  onChange={(e) => setNewProcessBurst(e.target.value)}
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Priority:</label>
                <select
                  value={newProcessPriority}
                  onChange={(e) => setNewProcessPriority(e.target.value)}
                >
                  <option value="1">High (1)</option>
                  <option value="2">Medium (2)</option>
                  <option value="3">Low (3)</option>
                </select>
              </div>
              <div className="dialog-buttons">
                <button className="btn btn-secondary" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateProcess}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="process-table-container">
        <table className="process-table">
          <thead>
            <tr>
              <th>Process ID</th>
              <th>Name</th>
              <th>State</th>
              <th>Priority</th>
              <th>Burst Time</th>
              <th>Arrival Time</th>
              <th>Wait Time</th>
              <th>Turnaround Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.id}>
                <td className="process-id">{process.id}</td>
                <td>{process.name}</td>
                <td>
                  <span
                    className="state-badge"
                    title={`Click to cycle state (${process.state})`}
                    onClick={() => toggleProcessState(process.id, process.state)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: getStateColor(process.state),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {process.state}
                  </span>
                </td>
                <td>{process.priority}</td>
                <td>{process.estimatedBurstTime} ms</td>
                <td>{process.arrivalTime.toFixed(1)}s</td>
                <td>{process.waitTime.toFixed(1)}s</td>
                <td>{process.turnAroundTime.toFixed(1)}s</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteProcess(process.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {processes.length === 0 && (
        <div className="empty-state">
          <p>No processes. Click "Create Process" to add one.</p>
        </div>
      )}

      <div className="process-summary">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Processes:</span>
            <span className="stat-value">{processes.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Ready:</span>
            <span className="stat-value">{processes.filter((p) => p.state === 'Ready').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Running:</span>
            <span className="stat-value">{processes.filter((p) => p.state === 'Running').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Waiting:</span>
            <span className="stat-value">{processes.filter((p) => p.state === 'Waiting').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Terminated:</span>
            <span className="stat-value">{processes.filter((p) => p.state === 'Terminated').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessManager;
