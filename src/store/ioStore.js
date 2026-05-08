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
  progress: 0,
  pagesPrinted: 0,
  currentPage: 0,
  estimatedTicks: Math.max(4, pages * 2),
  submittedAt: null,
  startedAt: null,
  completedAt: null,
});

const createEvent = (message, type = 'info') => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  message,
  type,
  timestamp: new Date().toISOString(),
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
    events: [createEvent('Printer spooler initialized', 'system')],
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
      printerStatus: state.currentJobId ? 'Busy' : 'Spooling',
      jobs: [...state.jobs, { ...nextJob, submittedAt: new Date().toISOString() }],
      nextJobCounter: state.nextJobCounter + 1,
      events: [
        ...state.events,
        createEvent(`${processId} queued ${documentName} (${pages} page${pages === 1 ? '' : 's'})`, 'info'),
      ],
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
      printerStatus: 'Busy',
      currentJobId: nextJob.id,
      jobs: state.jobs.map((job) =>
        job.id === nextJob.id
          ? {
              ...job,
              status: 'Printing',
              progress: 0,
              pagesPrinted: 0,
              currentPage: 0,
              startedAt: new Date().toISOString(),
            }
          : job
        ),
      events: [...state.events, createEvent(`${nextJob.id} started on printer`, 'success')],
    };
  },

  advanceCurrentJob: (state, jobId, nextProgress) => {
    const job = state.jobs.find((entry) => entry.id === jobId);
    if (!job) return state;

    const nextPagesPrinted = Math.min(job.pages, Math.max(0, Math.ceil((nextProgress / 100) * job.pages)));
    const previousPagesPrinted = job.pagesPrinted || 0;
    const newEvents = [];

    for (let page = previousPagesPrinted + 1; page <= nextPagesPrinted; page += 1) {
      newEvents.push(createEvent(`${job.id} page ${page}/${job.pages} printed`, 'page'));
      newEvents.push(createEvent('Printer beep', 'sound'));
    }

    return {
      ...state,
      jobs: state.jobs.map((entry) =>
        entry.id === jobId
          ? {
              ...entry,
              progress: Math.min(100, nextProgress),
              pagesPrinted: nextPagesPrinted,
              currentPage: Math.min(entry.pages, Math.max(1, nextPagesPrinted || 1)),
            }
          : entry
      ),
      events: newEvents.length > 0 ? [...state.events, ...newEvents] : state.events,
    };
  },

  completeCurrentJob: (state) => {
    if (!state.currentJobId) return state;

    const completedAt = new Date().toISOString();
    const completedJob = state.jobs.find((job) => job.id === state.currentJobId);
    const completedJobId = state.currentJobId;

    return {
      ...state,
      currentJobId: null,
      printerStatus: state.jobs.some((job) => job.id !== completedJob?.id && job.status === 'Queued')
        ? 'Spooling'
        : 'Idle',
      jobs: state.jobs.map((job) =>
        job.id === completedJobId
          ? { ...job, status: 'Completed', progress: 100, pagesPrinted: job.pages, currentPage: job.pages, completedAt }
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
      events: completedJob
        ? [...state.events, createEvent(`${completedJob.id} completed printing`, 'success')]
        : state.events,
    };
  },

  completeAndAdvance: (state) => {
    const completedState = ioActions.completeCurrentJob(state);
    return ioActions.startNextJob(completedState);
  },

  cancelJob: (state, jobId) => {
    const job = state.jobs.find((entry) => entry.id === jobId);
    if (!job || job.status === 'Completed' || job.id === state.currentJobId) {
      return state;
    }

    return {
      ...state,
      jobs: state.jobs.filter((entry) => entry.id !== jobId),
      events: [...state.events, createEvent(`${jobId} was canceled`, 'warning')],
    };
  },

  resetIO: () => ioActions.initState(),

  getQueuedJobs: (state) => state.jobs.filter((job) => job.status === 'Queued'),
  getCompletedJobs: (state) => state.history,
  getActiveJob: (state) => state.jobs.find((job) => job.id === state.currentJobId) || null,
  getEvents: (state) => state.events,
  getPrinterMetrics: (state) => {
    const activeJob = ioActions.getActiveJob(state);
    const queuedJobs = ioActions.getQueuedJobs(state);

    return {
      deviceStatus: state.printerStatus,
      activeJob,
      queuedCount: queuedJobs.length,
      completedCount: state.history.length,
      progress: activeJob ? activeJob.progress : 0,
      estimatedTicks: activeJob ? activeJob.estimatedTicks : 0,
    };
  },
};
