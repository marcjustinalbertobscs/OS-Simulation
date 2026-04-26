/**
 * Process Store - manages process lifecycle and state management
 * Process states: Ready, Running, Waiting, Terminated
 */

export const processActions = {
  // Initialize state with 3 default processes
  initState: () => ({
    processes: [
      {
        id: 'P1',
        name: 'System Process',
        state: 'Ready',
        priority: 1,
        estimatedBurstTime: 4,
        arrivalTime: 0,
        waitTime: 0,
        turnAroundTime: 0,
        startTime: null,
        endTime: null,
      },
      {
        id: 'P2',
        name: 'User Application',
        state: 'Ready',
        priority: 2,
        estimatedBurstTime: 3,
        arrivalTime: 1,
        waitTime: 0,
        turnAroundTime: 0,
        startTime: null,
        endTime: null,
      },
      {
        id: 'P3',
        name: 'Background Service',
        state: 'Ready',
        priority: 3,
        estimatedBurstTime: 5,
        arrivalTime: 2,
        waitTime: 0,
        turnAroundTime: 0,
        startTime: null,
        endTime: null,
      },
    ],
    processCounter: 4,
  }),

  // Create a new process
  createProcess: (state, { name, burstTime, priority = 3 }) => {
    const newProcess = {
      id: `P${state.processCounter}`,
      name,
      state: 'Ready',
      priority,
      estimatedBurstTime: burstTime,
      arrivalTime: Date.now() / 1000,
      waitTime: 0,
      turnAroundTime: 0,
      startTime: null,
      endTime: null,
    };

    return {
      ...state,
      processes: [...state.processes, newProcess],
      processCounter: state.processCounter + 1,
    };
  },

  // Update process state
  updateProcessState: (state, processId, newState) => {
    return {
      ...state,
      processes: state.processes.map((p) =>
        p.id === processId ? { ...p, state: newState } : p
      ),
    };
  },

  // Update process timing information
  updateProcessTiming: (state, processId, { startTime, endTime, waitTime }) => {
    return {
      ...state,
      processes: state.processes.map((p) => {
        if (p.id === processId) {
          return {
            ...p,
            startTime,
            endTime,
            waitTime,
            turnAroundTime: endTime ? endTime - p.arrivalTime : 0,
          };
        }
        return p;
      }),
    };
  },

  // Delete process
  deleteProcess: (state, processId) => {
    return {
      ...state,
      processes: state.processes.filter((p) => p.id !== processId),
    };
  },

  // Get a single process
  getProcess: (state, processId) => {
    return state.processes.find((p) => p.id === processId);
  },

  // Get all processes
  getAllProcesses: (state) => {
    return state.processes;
  },

  // Get processes by state
  getProcessesByState: (state, filterState) => {
    return state.processes.filter((p) => p.state === filterState);
  },

  // Reset all processes to initial state
  resetProcesses: () => {
    return processActions.initState();
  },
};
