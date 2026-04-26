import { useContext } from 'react';
import { OSContext } from '../context/OSContextDefinition';

/**
 * Custom hook for window operations
 * Provides convenient methods to interact with the window system
 */

export const useWindow = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useWindow must be used within OSProvider');
  }

  return {
    // Window state
    windows: context.windowState.windows,
    focusedWindowId: context.windowState.focusedWindowId,

    // Window operations
    openWindow: context.openWindow,
    closeWindow: context.closeWindow,
    focusWindow: context.focusWindow,
    minimizeWindow: context.minimizeWindow,
    maximizeWindow: context.maximizeWindow,
    fullscreenWindow: context.fullscreenWindow,
    updateWindowPosition: context.updateWindowPosition,
    updateWindowSize: context.updateWindowSize,
    snapWindowLeft: context.snapWindowLeft,
    snapWindowRight: context.snapWindowRight,
    restoreWindow: context.restoreWindow,
    getWindow: context.getWindow,
    getFocusedWindow: context.getFocusedWindow,
  };
};

/**
 * Custom hook for file system operations
 */
export const useFileSystem = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useFileSystem must be used within OSProvider');
  }

  return {
    // File system state
    fileSystem: context.fileSystemState,

    // File system operations
    createFolder: context.createFolder,
    createFile: context.createFile,
    updateFileContent: context.updateFileContent,
    deleteItem: context.deleteItem,
    renameItem: context.renameItem,
    moveItem: context.moveItem,
    copyItem: context.copyItem,
    getDirectoryContents: context.getDirectoryContents,
    getFile: context.getFile,
    getFolder: context.getFolder,
  };
};

/**
 * Custom hook for settings (theme, accent color, etc.)
 */
export const useSettings = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useSettings must be used within OSProvider');
  }

  return {
    // Settings state
    isDarkMode: context.isDarkMode,
    accentColor: context.accentColor,

    // Settings operations
    setDarkMode: context.setDarkMode,
    setAccentColor: context.setAccentColor,
  };
};

/**
 * Custom hook for process management
 */
export const useProcesses = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useProcesses must be used within OSProvider');
  }

  return {
    // Process state
    processState: context.processState,

    // Process operations
    createProcess: context.createProcess,
    updateProcessState: context.updateProcessState,
    updateProcessTiming: context.updateProcessTiming,
    deleteProcess: context.deleteProcess,
    getAllProcesses: context.getAllProcesses,
    getProcessesByState: context.getProcessesByState,
    resetProcesses: context.resetProcesses,
  };
};

/**
 * Custom hook for memory management
 */
export const useMemory = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useMemory must be used within OSProvider');
  }

  return {
    // Memory state
    memoryState: context.memoryState,

    // Memory operations
    allocateMemory: context.allocateMemory,
    deallocateMemory: context.deallocateMemory,
    deallocateProcessMemory: context.deallocateProcessMemory,
    getMemoryStatus: context.getMemoryStatus,
    getMemoryPartitions: context.getMemoryPartitions,
    getProcessAllocations: context.getProcessAllocations,
    resetMemory: context.resetMemory,
  };
};

/**
 * Custom hook for CPU scheduling
 */
export const useScheduler = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useScheduler must be used within OSProvider');
  }

  return {
    // Scheduler state
    schedulerState: context.schedulerState,

    // Scheduler operations
    executeSchedule: context.executeSchedule,
    setSchedulerRunning: context.setSchedulerRunning,
    getSchedulerStatistics: context.getSchedulerStatistics,
    getSchedule: context.getSchedule,
    generateGanttChart: context.generateGanttChart,
    resetScheduler: context.resetScheduler,
  };
};

/**
 * Combined hook for all OS operations (processes, memory, scheduler)
 */
export const useOS = () => {
  const context = useContext(OSContext);

  if (!context) {
    throw new Error('useOS must be used within OSProvider');
  }

  return context;
};
