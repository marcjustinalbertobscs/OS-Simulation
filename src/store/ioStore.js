/**
 * I/O Store - simulates a printer with spooling and a waiting queue
 */

const createJob = ({ id, processId, documentName, pages, notes = '' }) => ({
  id,
  processId,
  documentName,
  pages,
  notes,
  status: 'Queued',
  submittedAt: null,
  startedAt: null,
  completedAt: null,
});

export const ioActions = {
  initState: () => ({
    printerStatus: 'Idle',
    currentJobId: null,
    nextJobCounter: 4,
    jobs: [
      createJob({ id: 'J1', processId: 'P1', documentName: 'system-report.txt', pages: 2, notes: 'Ready to print' }),
      createJob({ id: 'J2', processId: 'P2', documentName: 'invoice.pdf', pages: 4, notes: 'Waiting in spooler' }),
      createJob({ id: 'J3', processId: 'P3', documentName: 'backup-log.txt', pages: 1, notes: 'Low priority' }),
    ],
    history: [],
  }),

  submitPrintJob: (state, { processId, documentName, pages, notes = '' }) => {
    const nextJob = createJob({
      id: `J${state.nextJobCounter}`,
      processId,
      documentName,
      pages,
      notes,
    });

    return {
      ...state,
      jobs: [...state.jobs, { ...nextJob, submittedAt: new Date().toISOString() }],
      nextJobCounter: state.nextJobCounter + 1,
    };
  },

  startNextJob: (state) => {
    if (state.currentJobId) return state;

    const nextJob = state.jobs.find((job) => job.status === 'Queued');
    if (!nextJob) {
      return {
        ...state,
        printerStatus: 'Idle',
      };
    }

    return {
      ...state,
      printerStatus: 'Printing',
      currentJobId: nextJob.id,
      jobs: state.jobs.map((job) =>
        job.id === nextJob.id
          ? { ...job, status: 'Printing', startedAt: new Date().toISOString() }
          : job
      ),
    };
  },

  completeCurrentJob: (state) => {
    if (!state.currentJobId) return state;

    const completedAt = new Date().toISOString();
    const completedJob = state.jobs.find((job) => job.id === state.currentJobId);

    return {
      ...state,
      currentJobId: null,
      printerStatus: 'Idle',
      jobs: state.jobs.map((job) =>
        job.id === state.currentJobId
          ? { ...job, status: 'Completed', completedAt }
          : job
      ),
      history: completedJob
        ? [
            ...state.history,
            {
              ...completedJob,
              status: 'Completed',
              completedAt,
            },
          ]
        : state.history,
    };
  },

  cancelJob: (state, jobId) => {
    const job = state.jobs.find((entry) => entry.id === jobId);
    if (!job || job.status === 'Completed' || job.id === state.currentJobId) {
      return state;
    }

    return {
      ...state,
      jobs: state.jobs.filter((entry) => entry.id !== jobId),
    };
  },

  resetIO: () => ioActions.initState(),

  getQueuedJobs: (state) => state.jobs.filter((job) => job.status === 'Queued'),
  getCompletedJobs: (state) => state.history,
  getActiveJob: (state) => state.jobs.find((job) => job.id === state.currentJobId) || null,
};
