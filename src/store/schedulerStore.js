/**
 * Scheduler Store - implements FCFS (First-Come, First-Served) CPU scheduling algorithm
 * Calculates execution order, wait times, and turnaround times
 */

export const schedulerActions = {
  // Initial state
  initState: () => ({
    algorithm: 'FCFS',
    isRunning: false,
    schedule: [], // Array of { processId, startTime, endTime, waitTime }
    currentTime: 0,
    statistics: {
      totalWaitTime: 0,
      averageWaitTime: 0,
      totalTurnaroundTime: 0,
      averageTurnaroundTime: 0,
    },
  }),

  // Execute FCFS scheduling algorithm
  executeSchedule: (state, processes) => {
    if (!processes || processes.length === 0) {
      return state;
    }

    // Sort processes by arrival time (FCFS)
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

    const schedule = [];
    let currentTime = 0;
    let totalWaitTime = 0;
    let totalTurnaroundTime = 0;

    // Build schedule
    sortedProcesses.forEach((process) => {
      // Process waits until current time (if arrived late, start at arrival time)
      const startTime = Math.max(currentTime, process.arrivalTime);
      const waitTime = startTime - process.arrivalTime;
      const endTime = startTime + process.estimatedBurstTime;
      const turnaroundTime = endTime - process.arrivalTime;

      schedule.push({
        processId: process.id,
        startTime,
        endTime,
        waitTime,
        turnaroundTime,
        burstTime: process.estimatedBurstTime,
      });

      totalWaitTime += waitTime;
      totalTurnaroundTime += turnaroundTime;
      currentTime = endTime;
    });

    const averageWaitTime = totalWaitTime / processes.length;
    const averageTurnaroundTime = totalTurnaroundTime / processes.length;

    return {
      ...state,
      schedule,
      currentTime,
      statistics: {
        totalWaitTime,
        averageWaitTime: averageWaitTime.toFixed(2),
        totalTurnaroundTime,
        averageTurnaroundTime: averageTurnaroundTime.toFixed(2),
      },
    };
  },

  // Generate Gantt chart representation
  generateGanttChart: (state) => {
    if (state.schedule.length === 0) {
      return '';
    }

    // Build timeline
    let ganttChart = '';
    const timeline = [];

    // Create time markers
    for (let t = 0; t <= state.currentTime; t++) {
      timeline.push(t);
    }

    // Build process blocks
    state.schedule.forEach((entry) => {
      const spaces = entry.startTime > 0 ? ' '.repeat(entry.startTime * 2) : '';
      const block = entry.processId + '[' + entry.startTime + '-' + entry.endTime + ']';
      ganttChart += spaces + block + ' ';
    });

    return ganttChart;
  },

  // Get schedule details
  getSchedule: (state) => {
    return state.schedule;
  },

  // Get statistics
  getStatistics: (state) => {
    return state.statistics;
  },

  // Get ready processes
  getReadyProcesses: (state, processes) => {
    return processes.filter((p) => p.state === 'Ready');
  },

  // Set running state
  setRunning: (state, isRunning) => {
    return {
      ...state,
      isRunning,
    };
  },

  // Reset scheduler
  resetScheduler: () => {
    return schedulerActions.initState();
  },

  // Get current executing process at a given time
  getCurrentProcess: (state, time) => {
    const entry = state.schedule.find(
      (s) => s.startTime <= time && time < s.endTime
    );
    return entry ? entry.processId : null;
  },

  // Get completion time for all processes
  getTotalCompletionTime: (state) => {
    return state.currentTime;
  },
};
