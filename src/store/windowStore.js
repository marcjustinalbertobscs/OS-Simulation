import { WINDOW_DEFAULT_WIDTH, WINDOW_DEFAULT_HEIGHT, DEFAULT_WINDOW_POSITIONS, ALL_APPS } from '../utils/constants';

/**
 * Window store - manages all open windows and their state
 */

export const createWindow = (appType, appId) => {
  const windowId = `${appType}-${appId}-${Date.now()}`;
  const position = DEFAULT_WINDOW_POSITIONS[appType] || {};

  let offsetX = 0;
  let offsetY = 0;

  // Add slight offset if multiple instances
  const instanceCount = parseInt(appId.split('-').pop()) || 1;
  offsetX = (instanceCount - 1) * 30;
  offsetY = (instanceCount - 1) * 30;

  return {
    id: windowId,
    appType,
    appId,
    title: getWindowTitle(appType),
    x: (position.x || 0) + offsetX,
    y: (position.y || 0) + offsetY,
    width: position.width || WINDOW_DEFAULT_WIDTH,
    height: position.height || WINDOW_DEFAULT_HEIGHT,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1000,
    createdAt: Date.now(),
  };
};

export const getWindowTitle = (appType) => {
  const app = ALL_APPS.find((a) => a.type === appType);
  return app ? app.label : 'Window';
};

export const windowActions = {
  // Initialize windows state
  initState: () => ({
    windows: [],
    focusedWindowId: null,
    zIndexCounter: 1000,
  }),

  // Add/open a window
  addWindow: (state, newWindow) => {
    const newZIndexCounter = state.zIndexCounter + 1;
    const updatedWindows = [
      ...state.windows.map((w) => ({
        ...w,
        zIndex: w.id === newWindow.id ? newZIndexCounter : w.zIndex,
      })),
      { ...newWindow, zIndex: newZIndexCounter },
    ];
    return {
      ...state,
      windows: updatedWindows,
      focusedWindowId: newWindow.id,
      zIndexCounter: newZIndexCounter,
    };
  },

  // Remove/close a window
  removeWindow: (state, windowId) => ({
    ...state,
    windows: state.windows.filter((w) => w.id !== windowId),
    focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
  }),

  // Focus a window (bring to front)
  focusWindow: (state, windowId) => {
    const newZIndexCounter = state.zIndexCounter + 1;
    return {
      ...state,
      focusedWindowId: windowId,
      zIndexCounter: newZIndexCounter,
      windows: state.windows.map((w) => ({
        ...w,
        zIndex: w.id === windowId ? newZIndexCounter : w.zIndex,
      })),
    };
  },

  // Update window position
  updateWindowPosition: (state, windowId, x, y) => ({
    ...state,
    windows: state.windows.map((w) => (w.id === windowId ? { ...w, x, y } : w)),
  }),

  // Update window size
  updateWindowSize: (state, windowId, width, height) => ({
    ...state,
    windows: state.windows.map((w) => (w.id === windowId ? { ...w, width, height } : w)),
  }),

  // Toggle minimize
  minimizeWindow: (state, windowId) => ({
    ...state,
    windows: state.windows.map((w) =>
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ),
  }),

  // Toggle maximize
  maximizeWindow: (state, windowId) => ({
    ...state,
    windows: state.windows.map((w) => (w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w)),
  }),

  // Toggle fullscreen
  fullscreenWindow: (state, windowId) => ({
    ...state,
    windows: state.windows.map((w) => (w.id === windowId ? { ...w, isFullscreen: !w.isFullscreen } : w)),
  }),

  // Update entire window state
  updateWindow: (state, windowId, updates) => ({
    ...state,
    windows: state.windows.map((w) => (w.id === windowId ? { ...w, ...updates } : w)),
  }),

  // Get all non-minimized windows
  getVisibleWindows: (state) => state.windows.filter((w) => !w.isMinimized),

  // Get window by ID
  getWindow: (state, windowId) => state.windows.find((w) => w.id === windowId),

  // Get focused window
  getFocusedWindow: (state) => {
    if (!state.focusedWindowId) return null;
    return state.windows.find((w) => w.id === state.focusedWindowId);
  },

  // Snap window left
  snapWindowLeft: (state, windowId, viewportWidth) => ({
    ...state,
    windows: state.windows.map((w) =>
      w.id === windowId
        ? { ...w, x: 0, y: 0, width: viewportWidth / 2, height: window.innerHeight - 48, isMaximized: false }
        : w
    ),
  }),

  // Snap window right
  snapWindowRight: (state, windowId, viewportWidth) => ({
    ...state,
    windows: state.windows.map((w) =>
      w.id === windowId
        ? { ...w, x: viewportWidth / 2, y: 0, width: viewportWidth / 2, height: window.innerHeight - 48, isMaximized: false }
        : w
    ),
  }),

  // Restore window to default size
  restoreWindow: (state, windowId) => ({
    ...state,
    windows: state.windows.map((w) =>
      w.id === windowId ? { ...w, isMaximized: false, isMinimized: false } : w
    ),
  }),

  // Load windows from persistence
  loadWindows: (state, windows) => ({
    ...state,
    windows,
    focusedWindowId: windows.length > 0 ? windows[windows.length - 1].id : null,
    zIndexCounter: Math.max(...windows.map((w) => w.zIndex), 1000) + 1,
  }),
};
