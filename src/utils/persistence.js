import { STORAGE_KEYS } from './constants';

/**
 * Persistence utilities for localStorage management
 */

export const persistenceService = {
  // Windows state
  saveWindows: (windows) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WINDOWS, JSON.stringify(windows));
    } catch (e) {
      console.error('Failed to save windows state:', e);
    }
  },

  loadWindows: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WINDOWS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load windows state:', e);
      return [];
    }
  },

  // File system state
  saveFileSystem: (fileSystem) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FILESYSTEM, JSON.stringify(fileSystem));
    } catch (e) {
      console.error('Failed to save filesystem:', e);
    }
  },

  loadFileSystem: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FILESYSTEM);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to load filesystem:', e);
      return null;
    }
  },

  // Dark mode setting
  saveDarkMode: (isDarkMode) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
    } catch (e) {
      console.error('Failed to save dark mode:', e);
    }
  },

  loadDarkMode: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      // Default to system preference
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    } catch (e) {
      console.error('Failed to load dark mode:', e);
      return false;
    }
  },

  // Accent color
  saveAccentColor: (color) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
    } catch (e) {
      console.error('Failed to save accent color:', e);
    }
  },

  loadAccentColor: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || '#0078d4';
    } catch (e) {
      console.error('Failed to load accent color:', e);
      return '#0078d4';
    }
  },

  // Notepad files
  saveNotepadFiles: (files) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTEPAD_FILES, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save notepad files:', e);
    }
  },

  loadNotepadFiles: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTEPAD_FILES);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to load notepad files:', e);
      return {};
    }
  },

  // Last opened folders
  saveLastFolders: (folders) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.error('Failed to save last folders:', e);
    }
  },

  loadLastFolders: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_FOLDERS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to load last folders:', e);
      return {};
    }
  },

  // Clear all
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  },
};

// Throttle utility for frequent updates
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Debounce utility
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
