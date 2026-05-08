import React, { useReducer, useEffect, useCallback } from 'react';
import { OSContext } from './OSContextDefinition';
import { windowActions, createWindow } from '../store/windowStore';
import { fileSystemActions } from '../store/fileSystemStore';
import { processActions } from '../store/processStore';
import { memoryActions } from '../store/memoryStore';
import { schedulerActions } from '../store/schedulerStore';
import { ioActions } from '../store/ioStore';
import { persistenceService, throttle } from '../utils/persistence';
import { DEFAULT_ACCENT_COLOR } from '../utils/constants';
import { fileSystemApi } from '../utils/fileSystemApi';

const windowReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_WINDOWS':
      return windowActions.loadWindows(state, action.payload);
    case 'ADD_WINDOW':
      return windowActions.addWindow(state, action.payload);
    case 'REMOVE_WINDOW':
      return windowActions.removeWindow(state, action.payload);
    case 'FOCUS_WINDOW':
      return windowActions.focusWindow(state, action.payload);
    case 'UPDATE_POSITION':
      return windowActions.updateWindowPosition(state, action.payload.windowId, action.payload.x, action.payload.y);
    case 'UPDATE_SIZE':
      return windowActions.updateWindowSize(state, action.payload.windowId, action.payload.width, action.payload.height);
    case 'MINIMIZE':
      return windowActions.minimizeWindow(state, action.payload);
    case 'MAXIMIZE':
      return windowActions.maximizeWindow(state, action.payload);
    case 'FULLSCREEN':
      return windowActions.fullscreenWindow(state, action.payload);
    case 'SNAP_LEFT':
      return windowActions.snapWindowLeft(state, action.payload.windowId, action.payload.width);
    case 'SNAP_RIGHT':
      return windowActions.snapWindowRight(state, action.payload.windowId, action.payload.width);
    case 'RESTORE':
      return windowActions.restoreWindow(state, action.payload);
    default:
      return state;
  }
};

const fileSystemReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_FILESYSTEM':
      return fileSystemActions.loadFileSystem(state, action.payload);
    case 'CREATE_FOLDER':
      return fileSystemActions.createFolder(state, action.payload.parentPath, action.payload.folderName);
    case 'CREATE_FILE':
      return fileSystemActions.createFile(state, action.payload.parentPath, action.payload.fileName, action.payload.content);
    case 'UPDATE_FILE':
      return fileSystemActions.updateFileContent(state, action.payload.filePath, action.payload.content);
    case 'DELETE_ITEM':
      return fileSystemActions.deleteItem(state, action.payload);
    case 'RENAME_ITEM':
      return fileSystemActions.renameItem(state, action.payload.itemPath, action.payload.newName);
    case 'MOVE_ITEM':
      return fileSystemActions.moveItem(state, action.payload.itemPath, action.payload.targetParentPath);
    case 'COPY_ITEM':
      return fileSystemActions.copyItem(state, action.payload.itemPath, action.payload.targetParentPath);
    default:
      return state;
  }
};

const processReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_PROCESSES':
      return processActions.initState();
    case 'CREATE_PROCESS':
      return processActions.createProcess(state, action.payload);
    case 'UPDATE_PROCESS_STATE':
      return processActions.updateProcessState(state, action.payload.processId, action.payload.state);
    case 'UPDATE_PROCESS_TIMING':
      return processActions.updateProcessTiming(state, action.payload.processId, action.payload);
    case 'DELETE_PROCESS':
      return processActions.deleteProcess(state, action.payload);
    case 'RESET_PROCESSES':
      return processActions.resetProcesses();
    default:
      return state;
  }
};

const memoryReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_MEMORY':
      return memoryActions.initState();
    case 'ALLOCATE_MEMORY':
      return memoryActions.allocateMemory(state, action.payload.processId, action.payload.size);
    case 'DEALLOCATE_MEMORY':
      return memoryActions.deallocateMemory(state, action.payload);
    case 'DEALLOCATE_PROCESS_MEMORY':
      return memoryActions.deallocateProcessMemory(state, action.payload);
    case 'RESET_MEMORY':
      return memoryActions.resetMemory();
    default:
      return state;
  }
};

const schedulerReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_SCHEDULER':
      return schedulerActions.initState();
    case 'EXECUTE_SCHEDULE':
      return schedulerActions.executeSchedule(state, action.payload);
    case 'SET_RUNNING':
      return schedulerActions.setRunning(state, action.payload);
    case 'RESET_SCHEDULER':
      return schedulerActions.resetScheduler();
    default:
      return state;
  }
};

const ioReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_IO':
      return ioActions.initState();
    case 'SUBMIT_PRINT_JOB':
      return ioActions.submitPrintJob(state, action.payload);
    case 'START_NEXT_JOB':
      return ioActions.startNextJob(state);
    case 'ADVANCE_CURRENT_JOB':
      return ioActions.advanceCurrentJob(state, action.payload.jobId, action.payload.progress);
    case 'COMPLETE_CURRENT_JOB':
      return ioActions.completeAndAdvance(state);
    case 'CANCEL_PRINT_JOB':
      return ioActions.cancelJob(state, action.payload);
    case 'RESET_IO':
      return ioActions.resetIO();
    default:
      return state;
  }
};

export const OSProvider = ({ children }) => {
  const [windowState, windowDispatch] = useReducer(windowReducer, windowActions.initState());
  const [fileSystemState, fileSystemDispatch] = useReducer(fileSystemReducer, fileSystemActions.initState());
  const [processState, processDispatch] = useReducer(processReducer, processActions.initState());
  const [memoryState, memoryDispatch] = useReducer(memoryReducer, memoryActions.initState());
  const [schedulerState, schedulerDispatch] = useReducer(schedulerReducer, schedulerActions.initState());
  const [ioState, ioDispatch] = useReducer(ioReducer, ioActions.initState());
  const [isDarkMode, setIsDarkModeState] = React.useState(() => persistenceService.loadDarkMode());
  const [accentColor, setAccentColorState] = React.useState(() => persistenceService.loadAccentColor());

  // Load persisted state on mount
  useEffect(() => {
    const persistedWindows = persistenceService.loadWindows();
    if (persistedWindows.length > 0) {
      windowDispatch({ type: 'INIT_WINDOWS', payload: persistedWindows });
    }

    const persistedFileSystem = persistenceService.loadFileSystem();
    if (persistedFileSystem) {
      fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: persistedFileSystem });
    }

    fileSystemApi
      .fetchState()
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to load backend filesystem, using local state:', error);
      });
  }, []);

  // Throttled save for window state (every 500ms)
  useEffect(() => {
    const throttledSave = throttle((windows) => persistenceService.saveWindows(windows), 500);
    throttledSave(windowState.windows);
  }, [windowState.windows]);

  // Throttled save for file system (every 500ms)
  useEffect(() => {
    const throttledSave = throttle((fs) => persistenceService.saveFileSystem(fs), 500);
    throttledSave(fileSystemState);
  }, [fileSystemState]);

  // Apply dark mode theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  // Window operations
  const openWindow = useCallback(
    (appType, appId = '') => {
      const newWindow = createWindow(appType, appId);
      windowDispatch({ type: 'ADD_WINDOW', payload: newWindow });
      return newWindow.id;
    },
    []
  );

  const closeWindow = useCallback((windowId) => {
    windowDispatch({ type: 'REMOVE_WINDOW', payload: windowId });
  }, []);

  const focusWindow = useCallback((windowId) => {
    windowDispatch({ type: 'FOCUS_WINDOW', payload: windowId });
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    windowDispatch({ type: 'MINIMIZE', payload: windowId });
  }, []);

  const maximizeWindow = useCallback((windowId) => {
    windowDispatch({ type: 'MAXIMIZE', payload: windowId });
  }, []);

  const fullscreenWindow = useCallback((windowId) => {
    windowDispatch({ type: 'FULLSCREEN', payload: windowId });
  }, []);

  const updateWindowPosition = useCallback((windowId, x, y) => {
    windowDispatch({ type: 'UPDATE_POSITION', payload: { windowId, x, y } });
  }, []);

  const updateWindowSize = useCallback((windowId, width, height) => {
    windowDispatch({ type: 'UPDATE_SIZE', payload: { windowId, width, height } });
  }, []);

  const snapWindowLeft = useCallback((windowId) => {
    const width = window.innerWidth;
    windowDispatch({ type: 'SNAP_LEFT', payload: { windowId, width } });
  }, []);

  const snapWindowRight = useCallback((windowId) => {
    const width = window.innerWidth;
    windowDispatch({ type: 'SNAP_RIGHT', payload: { windowId, width } });
  }, []);

  const restoreWindow = useCallback((windowId) => {
    windowDispatch({ type: 'RESTORE', payload: windowId });
  }, []);

  const getWindow = useCallback(
    (windowId) => windowActions.getWindow(windowState, windowId),
    [windowState]
  );

  const getFocusedWindow = useCallback(() => windowActions.getFocusedWindow(windowState), [windowState]);

  // File system operations
  const createFolder = useCallback((parentPath, folderName) => {
    fileSystemDispatch({ type: 'CREATE_FOLDER', payload: { parentPath, folderName } });
    fileSystemApi
      .createItem({ parentPath, name: folderName, type: 'folder' })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to create folder:', error);
      });
  }, []);

  const createFile = useCallback((parentPath, fileName, content = '') => {
    fileSystemDispatch({ type: 'CREATE_FILE', payload: { parentPath, fileName, content } });
    fileSystemApi
      .createItem({ parentPath, name: fileName, type: 'file', content })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to create file:', error);
      });
  }, []);

  const updateFileContent = useCallback((filePath, content) => {
    fileSystemDispatch({ type: 'UPDATE_FILE', payload: { filePath, content } });
    fileSystemApi
      .updateFileContent({ filePath, content })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to update file:', error);
      });
  }, []);

  const deleteItem = useCallback((itemPath) => {
    fileSystemDispatch({ type: 'DELETE_ITEM', payload: itemPath });
    fileSystemApi
      .deleteItem(itemPath)
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to delete item:', error);
      });
  }, []);

  const renameItem = useCallback((itemPath, newName) => {
    fileSystemDispatch({ type: 'RENAME_ITEM', payload: { itemPath, newName } });
    fileSystemApi
      .renameItem({ itemPath, newName })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to rename item:', error);
      });
  }, []);

  const moveItem = useCallback((itemPath, targetParentPath) => {
    fileSystemDispatch({ type: 'MOVE_ITEM', payload: { itemPath, targetParentPath } });
    fileSystemApi
      .moveItem({ itemPath, targetParentPath })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to move item:', error);
      });
  }, []);

  const copyItem = useCallback((itemPath, targetParentPath) => {
    fileSystemDispatch({ type: 'COPY_ITEM', payload: { itemPath, targetParentPath } });
    fileSystemApi
      .copyItem({ itemPath, targetParentPath })
      .then((fileSystem) => {
        fileSystemDispatch({ type: 'INIT_FILESYSTEM', payload: fileSystem });
      })
      .catch((error) => {
        console.error('Failed to copy item:', error);
      });
  }, []);

  const getDirectoryContents = useCallback(
    (dirPath) => fileSystemActions.getDirectoryContents(fileSystemState, dirPath),
    [fileSystemState]
  );

  const getFile = useCallback(
    (filePath) => fileSystemActions.getFile(fileSystemState, filePath),
    [fileSystemState]
  );

  const getFolder = useCallback(
    (folderPath) => fileSystemActions.getFolder(fileSystemState, folderPath),
    [fileSystemState]
  );

  // Settings operations
  const setDarkMode = useCallback((isDark) => {
    setIsDarkModeState(isDark);
    persistenceService.saveDarkMode(isDark);
  }, []);

  const setAccentColor = useCallback((color) => {
    setAccentColorState(color);
    persistenceService.saveAccentColor(color);
  }, []);

  // Process operations
  const createProcess = useCallback((name, burstTime, priority = 3) => {
    processDispatch({ type: 'CREATE_PROCESS', payload: { name, burstTime, priority } });
  }, []);

  const updateProcessState = useCallback((processId, state) => {
    processDispatch({ type: 'UPDATE_PROCESS_STATE', payload: { processId, state } });
  }, []);

  const updateProcessTiming = useCallback((processId, timing) => {
    processDispatch({ type: 'UPDATE_PROCESS_TIMING', payload: { processId, ...timing } });
  }, []);

  const deleteProcess = useCallback((processId) => {
    processDispatch({ type: 'DELETE_PROCESS', payload: processId });
  }, []);

  const getAllProcesses = useCallback(() => {
    return processActions.getAllProcesses(processState);
  }, [processState]);

  const getProcessesByState = useCallback((state) => {
    return processActions.getProcessesByState(processState, state);
  }, [processState]);

  const resetProcesses = useCallback(() => {
    processDispatch({ type: 'RESET_PROCESSES' });
  }, []);

  // Memory operations
  const allocateMemory = useCallback((processId, size) => {
    memoryDispatch({ type: 'ALLOCATE_MEMORY', payload: { processId, size } });
  }, []);

  const deallocateMemory = useCallback((processId) => {
    memoryDispatch({ type: 'DEALLOCATE_MEMORY', payload: processId });
  }, []);

  const deallocateProcessMemory = useCallback((processId) => {
    memoryDispatch({ type: 'DEALLOCATE_PROCESS_MEMORY', payload: processId });
  }, []);

  const getMemoryStatus = useCallback(() => {
    return memoryActions.getMemoryStatus(memoryState);
  }, [memoryState]);

  const getMemoryPartitions = useCallback(() => {
    return memoryActions.getPartitions(memoryState);
  }, [memoryState]);

  const getProcessAllocations = useCallback((processId) => {
    return memoryActions.getProcessAllocations(memoryState, processId);
  }, [memoryState]);

  const resetMemory = useCallback(() => {
    memoryDispatch({ type: 'RESET_MEMORY' });
  }, []);

  // Scheduler operations
  const executeSchedule = useCallback((processes) => {
    schedulerDispatch({ type: 'EXECUTE_SCHEDULE', payload: processes });
  }, []);

  const setSchedulerRunning = useCallback((isRunning) => {
    schedulerDispatch({ type: 'SET_RUNNING', payload: isRunning });
  }, []);

  const getSchedulerStatistics = useCallback(() => {
    return schedulerActions.getStatistics(schedulerState);
  }, [schedulerState]);

  const getSchedule = useCallback(() => {
    return schedulerActions.getSchedule(schedulerState);
  }, [schedulerState]);

  const generateGanttChart = useCallback(() => {
    return schedulerActions.generateGanttChart(schedulerState);
  }, [schedulerState]);

  const resetScheduler = useCallback(() => {
    schedulerDispatch({ type: 'RESET_SCHEDULER' });
  }, []);

  // I/O operations
  const submitPrintJob = useCallback((job) => {
    ioDispatch({ type: 'SUBMIT_PRINT_JOB', payload: job });
    processDispatch({ type: 'UPDATE_PROCESS_STATE', payload: { processId: job.processId, state: 'Waiting' } });
  }, []);

  const startNextJob = useCallback(() => {
    const nextJob = ioActions.getQueuedJobs(ioState)[0];
    ioDispatch({ type: 'START_NEXT_JOB' });
    if (nextJob) {
      processDispatch({
        type: 'UPDATE_PROCESS_STATE',
        payload: { processId: nextJob.processId, state: 'Running' },
      });
    }
  }, [ioState]);

  const completeCurrentJob = useCallback(() => {
    const activeJob = ioActions.getActiveJob(ioState);
    ioDispatch({ type: 'COMPLETE_CURRENT_JOB' });
    if (activeJob) {
      processDispatch({
        type: 'UPDATE_PROCESS_STATE',
        payload: {
          processId: activeJob.processId,
          state: 'Ready',
        },
      });
    }
  }, [ioState]);

  const cancelPrintJob = useCallback((jobId) => {
    ioDispatch({ type: 'CANCEL_PRINT_JOB', payload: jobId });
  }, []);

  const resetIO = useCallback(() => {
    ioDispatch({ type: 'RESET_IO' });
  }, []);

  const getQueuedJobs = useCallback(() => ioActions.getQueuedJobs(ioState), [ioState]);
  const getCompletedJobs = useCallback(() => ioActions.getCompletedJobs(ioState), [ioState]);
  const getActiveJob = useCallback(() => ioActions.getActiveJob(ioState), [ioState]);
  const getIOEvents = useCallback(() => ioActions.getEvents(ioState), [ioState]);
  const getPrinterMetrics = useCallback(() => ioActions.getPrinterMetrics(ioState), [ioState]);

  useEffect(() => {
    const activeJob = ioActions.getActiveJob(ioState);
    if (!activeJob) return undefined;

    const tickMs = Math.max(400, activeJob.pages * 300);
    const interval = window.setInterval(() => {
      const current = ioActions.getActiveJob(ioState);
      if (!current) return;

      const nextProgress = Math.min(100, current.progress + Math.ceil(100 / current.estimatedTicks));
      ioDispatch({
        type: 'ADVANCE_CURRENT_JOB',
        payload: { jobId: current.id, progress: nextProgress },
      });

      if (nextProgress >= 100) {
        ioDispatch({ type: 'COMPLETE_CURRENT_JOB' });

        processDispatch({
          type: 'UPDATE_PROCESS_STATE',
          payload: { processId: current.processId, state: 'Ready' },
        });
      }
    }, tickMs);

    return () => window.clearInterval(interval);
  }, [ioState, processDispatch]);

  const value = {
    // Window state & operations
    windowState,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    fullscreenWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindowLeft,
    snapWindowRight,
    restoreWindow,
    getWindow,
    getFocusedWindow,

    // File system state & operations
    fileSystemState,
    createFolder,
    createFile,
    updateFileContent,
    deleteItem,
    renameItem,
    moveItem,
    copyItem,
    getDirectoryContents,
    getFile,
    getFolder,

    // Settings state & operations
    isDarkMode,
    accentColor,
    setDarkMode,
    setAccentColor,

    // Process state & operations
    processState,
    createProcess,
    updateProcessState,
    updateProcessTiming,
    deleteProcess,
    getAllProcesses,
    getProcessesByState,
    resetProcesses,

    // Memory state & operations
    memoryState,
    allocateMemory,
    deallocateMemory,
    deallocateProcessMemory,
    getMemoryStatus,
    getMemoryPartitions,
    getProcessAllocations,
    resetMemory,

    // Scheduler state & operations
    schedulerState,
    executeSchedule,
    setSchedulerRunning,
    getSchedulerStatistics,
    getSchedule,
    generateGanttChart,
    resetScheduler,

    // I/O state & operations
    ioState,
    submitPrintJob,
    startNextJob,
    completeCurrentJob,
    cancelPrintJob,
    resetIO,
    getQueuedJobs,
    getCompletedJobs,
    getActiveJob,
    getIOEvents,
    getPrinterMetrics,
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
};
