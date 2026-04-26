import React from 'react';
import { useOS } from '../hooks/useOS';
import '../styles/process-scheduler.css';

/**
 * CPU Scheduler App
 * Implements FCFS (First-Come, First-Served) scheduling algorithm
 * Shows execution order, Gantt chart, and wait times
 */

const Scheduler = () => {
  const {
    getAllProcesses,
    executeSchedule,
    setSchedulerRunning,
    getSchedulerStatistics,
    getSchedule,
    resetScheduler,
  } = useOS();

  const processes = getAllProcesses();
  const readyProcesses = processes.filter((p) => p.state === 'Ready');
  const schedule = getSchedule();
  const statistics = getSchedulerStatistics();

  const handleExecuteSchedule = () => {
    executeSchedule(processes);
    setSchedulerRunning(true);
  };

  const handleReset = () => {
    resetScheduler();
    setSchedulerRunning(false);
  };

  const renderGanttVisualization = () => {
    if (schedule.length === 0) {
      return <div className="gantt-empty">Run schedule to generate Gantt chart</div>;
    }

    // Find max time for scaling
    const maxTime = Math.max(...schedule.map((s) => s.endTime));

    return (
      <div className="gantt-visualization">
        <div className="gantt-container">
          {/* Time axis */}
          <div className="gantt-axis">
            <div className="gantt-time-labels">
              {Array.from({ length: maxTime + 1 }, (_, i) => (
                <span key={i} className="time-label">
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Process blocks */}
          <div className="gantt-blocks">
            {schedule.map((entry, idx) => (
              <div
                key={idx}
                className="gantt-block"
                style={{
                  left: `${(entry.startTime / maxTime) * 100}%`,
                  width: `${((entry.endTime - entry.startTime) / maxTime) * 100}%`,
                }}
              >
                <div className="block-label">
                  {entry.processId}
                  <br />
                  <span className="block-time">
                    {entry.startTime}-{entry.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderScheduleTable = () => {
    if (schedule.length === 0) {
      return null;
    }

    return (
      <div className="schedule-table-container">
        <h3>Execution Schedule</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Wait Time</th>
              <th>Turnaround Time</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, idx) => (
              <tr key={idx}>
                <td className="process-col">{entry.processId}</td>
                <td>{entry.startTime}</td>
                <td>{entry.endTime}</td>
                <td>{entry.waitTime}</td>
                <td>{entry.turnaroundTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="scheduler">
      <div className="scheduler-header">
        <h2>CPU Scheduler (FCFS)</h2>
        <div className="scheduler-controls">
          <button className="btn btn-primary" onClick={handleExecuteSchedule}>
            Execute Schedule
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="scheduler-content">
        <div className="scheduler-left">
          {/* Algorithm Info */}
          <div className="algorithm-info">
            <h3>Algorithm: First-Come, First-Served (FCFS)</h3>
            <p>Processes are executed in the order they arrive in the ready queue.</p>
          </div>

          {/* Ready Queue */}
          <div className="ready-queue">
            <h3>Ready Queue</h3>
            {readyProcesses.length > 0 ? (
              <div className="queue-display">
                {readyProcesses.map((p, idx) => (
                  <div key={idx} className="queue-item">
                    <span className="queue-process-id">{p.id}</span>
                    <span className="queue-process-name">{p.name}</span>
                    <span className="queue-burst">Burst: {p.estimatedBurstTime}ms</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-queue">No processes in ready state</p>
            )}
          </div>
        </div>

        <div className="scheduler-right">
          {/* Statistics */}
          <div className="statistics">
            <h3>Scheduling Statistics</h3>
            {schedule.length > 0 ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-name">Total Completion Time:</span>
                  <span className="stat-value">{statistics.totalTurnaroundTime || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Total Wait Time:</span>
                  <span className="stat-value">{statistics.totalWaitTime || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Average Wait Time:</span>
                  <span className="stat-value">{statistics.averageWaitTime || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Average Turnaround Time:</span>
                  <span className="stat-value">{statistics.averageTurnaroundTime || 0}</span>
                </div>
              </div>
            ) : (
              <p className="empty-stats">Execute schedule to see statistics</p>
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-section">
        <h3>Gantt Chart</h3>
        {renderGanttVisualization()}
      </div>

      {/* Schedule Table */}
      {renderScheduleTable()}
    </div>
  );
};

export default Scheduler;
