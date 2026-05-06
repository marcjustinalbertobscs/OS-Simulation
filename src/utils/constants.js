// Application constants and configuration

export const WINDOW_MIN_WIDTH = 400;
export const WINDOW_MIN_HEIGHT = 300;
export const WINDOW_DEFAULT_WIDTH = 600;
export const WINDOW_DEFAULT_HEIGHT = 400;

export const APP_TYPES = {
  FILE_EXPLORER: 'file-explorer',
  NOTEPAD: 'notepad',
  CALCULATOR: 'calculator',
  SETTINGS: 'settings',
  PROCESS_MANAGER: 'process-manager',
  SCHEDULER: 'scheduler',
  MEMORY_MANAGER: 'memory-manager',
  TASK_MANAGER: 'task-manager',
  WORD_PROCESSOR: 'word-processor',
  DISK_MANAGEMENT: 'disk-management',
  COMMAND_PROMPT: 'command-prompt',
};

export const TASKBAR_HEIGHT = 48;
export const TASKBAR_ICON_SIZE = 40;

export const DEFAULT_ACCENT_COLOR = '#0078d4';
export const DARK_MODE_KEY = 'os-dark-mode';
export const ACCENT_COLOR_KEY = 'os-accent-color';

export const DEFAULT_WINDOWS_STATE = [];
export const DEFAULT_FILESYSTEM_STATE = {
  folders: {
    'C:\\': {
      name: 'C:\\',
      type: 'drive',
      children: ['Users', 'Program Files', 'Windows'],
    },
    'C:\\Users': {
      name: 'C:\\Users',
      parent: 'C:\\',
      type: 'folder',
      children: ['Desktop', 'Documents', 'Downloads'],
    },
    'C:\\Users\\Desktop': {
      name: 'C:\\Users\\Desktop',
      parent: 'C:\\Users',
      type: 'folder',
      children: ['Project Brief.txt', 'Screenshots'],
    },
    'C:\\Users\\Documents': {
      name: 'C:\\Users\\Documents',
      parent: 'C:\\Users',
      type: 'folder',
      children: ['System Notes.md', 'Architecture', 'Scripts'],
    },
    'C:\\Users\\Downloads': {
      name: 'C:\\Users\\Downloads',
      parent: 'C:\\Users',
      type: 'folder',
      children: ['installer.exe', 'report.pdf'],
    },
    'C:\\Users\\Desktop\\Screenshots': {
      name: 'Screenshots',
      parent: 'C:\\Users\\Desktop',
      type: 'folder',
      children: ['desktop-home.png'],
    },
    'C:\\Users\\Documents\\Architecture': {
      name: 'Architecture',
      parent: 'C:\\Users\\Documents',
      type: 'folder',
      children: ['backend-plan.txt'],
    },
    'C:\\Users\\Documents\\Scripts': {
      name: 'Scripts',
      parent: 'C:\\Users\\Documents',
      type: 'folder',
      children: ['backup.bat', 'launch-apps.bat', 'network-check.bat', 'setup-workspace.bat'],
    },
    'C:\\Program Files': {
      name: 'C:\\Program Files',
      parent: 'C:\\',
      type: 'folder',
      children: [],
    },
    'C:\\Windows': {
      name: 'C:\\Windows',
      parent: 'C:\\',
      type: 'folder',
      children: ['System32'],
    },
    'C:\\Windows\\System32': {
      name: 'C:\\Windows\\System32',
      parent: 'C:\\Windows',
      type: 'folder',
      children: [],
    },
  },
  files: {
    'C:\\Users\\Desktop\\Project Brief.txt': {
      name: 'Project Brief.txt',
      path: 'C:\\Users\\Desktop\\Project Brief.txt',
      type: 'file',
      parent: 'C:\\Users\\Desktop',
      content: 'Finalize file explorer integration and persistence layer.',
      createdAt: '2026-04-01T09:00:00.000Z',
      modifiedAt: '2026-04-01T09:00:00.000Z',
      updatedAt: '2026-04-01T09:00:00.000Z',
      size: 56,
    },
    'C:\\Users\\Desktop\\Screenshots\\desktop-home.png': {
      name: 'desktop-home.png',
      path: 'C:\\Users\\Desktop\\Screenshots\\desktop-home.png',
      type: 'file',
      parent: 'C:\\Users\\Desktop\\Screenshots',
      content: '',
      createdAt: '2026-04-02T08:20:00.000Z',
      modifiedAt: '2026-04-02T08:20:00.000Z',
      updatedAt: '2026-04-02T08:20:00.000Z',
      size: 0,
    },
    'C:\\Users\\Documents\\System Notes.md': {
      name: 'System Notes.md',
      path: 'C:\\Users\\Documents\\System Notes.md',
      type: 'file',
      parent: 'C:\\Users\\Documents',
      content: 'Current app is frontend-only. Backend integration still pending.',
      createdAt: '2026-04-03T13:45:00.000Z',
      modifiedAt: '2026-04-03T13:45:00.000Z',
      updatedAt: '2026-04-03T13:45:00.000Z',
      size: 63,
    },
    'C:\\Users\\Documents\\Architecture\\backend-plan.txt': {
      name: 'backend-plan.txt',
      path: 'C:\\Users\\Documents\\Architecture\\backend-plan.txt',
      type: 'file',
      parent: 'C:\\Users\\Documents\\Architecture',
      content: 'SQLite schema: id, name, type, parent_id, content, created_at, updated_at.',
      createdAt: '2026-04-04T10:30:00.000Z',
      modifiedAt: '2026-04-04T10:30:00.000Z',
      updatedAt: '2026-04-04T10:30:00.000Z',
      size: 77,
    },
    'C:\\Users\\Documents\\Scripts\\backup.bat': {
      name: 'backup.bat',
      path: 'C:\\Users\\Documents\\Scripts\\backup.bat',
      type: 'file',
      parent: 'C:\\Users\\Documents\\Scripts',
      content: 'rem Back up project notes\nmkdir C:\\Users\\Documents\\Backup\ncopy C:\\Users\\Desktop\\Project Brief.txt C:\\Users\\Documents\\Backup\necho Backup completed at %DATE% %TIME%',
      createdAt: '2026-04-07T09:00:00.000Z',
      modifiedAt: '2026-04-07T09:00:00.000Z',
      updatedAt: '2026-04-07T09:00:00.000Z',
      size: 156,
    },
    'C:\\Users\\Documents\\Scripts\\launch-apps.bat': {
      name: 'launch-apps.bat',
      path: 'C:\\Users\\Documents\\Scripts\\launch-apps.bat',
      type: 'file',
      parent: 'C:\\Users\\Documents\\Scripts',
      content: 'rem Launch simulated applications\nstart notepad\nstart file-explorer\nstart task-manager\ntasklist',
      createdAt: '2026-04-07T09:10:00.000Z',
      modifiedAt: '2026-04-07T09:10:00.000Z',
      updatedAt: '2026-04-07T09:10:00.000Z',
      size: 86,
    },
    'C:\\Users\\Documents\\Scripts\\network-check.bat': {
      name: 'network-check.bat',
      path: 'C:\\Users\\Documents\\Scripts\\network-check.bat',
      type: 'file',
      parent: 'C:\\Users\\Documents\\Scripts',
      content: 'rem Network diagnostic automation\nipconfig\nping gateway.local\nnetstat\nconnect fileserver.local 445',
      createdAt: '2026-04-07T09:20:00.000Z',
      modifiedAt: '2026-04-07T09:20:00.000Z',
      updatedAt: '2026-04-07T09:20:00.000Z',
      size: 91,
    },
    'C:\\Users\\Documents\\Scripts\\setup-workspace.bat': {
      name: 'setup-workspace.bat',
      path: 'C:\\Users\\Documents\\Scripts\\setup-workspace.bat',
      type: 'file',
      parent: 'C:\\Users\\Documents\\Scripts',
      content: 'rem Create folders and reusable files\nset PROJECT=OSDemo\nmkdir C:\\Users\\Desktop\\%PROJECT%\nwrite C:\\Users\\Desktop\\%PROJECT%\\readme.txt Project workspace created\nif exist C:\\Users\\Desktop\\%PROJECT%\\readme.txt echo Workspace ready',
      createdAt: '2026-04-07T09:30:00.000Z',
      modifiedAt: '2026-04-07T09:30:00.000Z',
      updatedAt: '2026-04-07T09:30:00.000Z',
      size: 210,
    },
    'C:\\Users\\Downloads\\installer.exe': {
      name: 'installer.exe',
      path: 'C:\\Users\\Downloads\\installer.exe',
      type: 'file',
      parent: 'C:\\Users\\Downloads',
      content: '',
      createdAt: '2026-04-05T12:00:00.000Z',
      modifiedAt: '2026-04-05T12:00:00.000Z',
      updatedAt: '2026-04-05T12:00:00.000Z',
      size: 0,
    },
    'C:\\Users\\Downloads\\report.pdf': {
      name: 'report.pdf',
      path: 'C:\\Users\\Downloads\\report.pdf',
      type: 'file',
      parent: 'C:\\Users\\Downloads',
      content: '',
      createdAt: '2026-04-06T15:10:00.000Z',
      modifiedAt: '2026-04-06T15:10:00.000Z',
      updatedAt: '2026-04-06T15:10:00.000Z',
      size: 0,
    },
  },
};

export const PINNED_APPS = [
  { id: 'file-explorer', type: APP_TYPES.FILE_EXPLORER, label: 'File Explorer', icon: '📁' },
  { id: 'notepad', type: APP_TYPES.NOTEPAD, label: 'Notepad', icon: '📝' },
  { id: 'word-processor', type: APP_TYPES.WORD_PROCESSOR, label: 'Word Processor', icon: '📄' },
  { id: 'calculator', type: APP_TYPES.CALCULATOR, label: 'Calculator', icon: '🧮' },
  { id: 'settings', type: APP_TYPES.SETTINGS, label: 'Settings', icon: '⚙️' },
  { id: 'process-manager', type: APP_TYPES.PROCESS_MANAGER, label: 'Process Manager', icon: '🔄' },
  { id: 'scheduler', type: APP_TYPES.SCHEDULER, label: 'CPU Scheduler', icon: '⏱️' },
  { id: 'memory-manager', type: APP_TYPES.MEMORY_MANAGER, label: 'Memory Manager', icon: '💾' },
  { id: 'task-manager', type: APP_TYPES.TASK_MANAGER, label: 'Task Manager', icon: '📊' },
  { id: 'disk-management', type: APP_TYPES.DISK_MANAGEMENT, label: 'Disk Management', icon: '💽' },
  { id: 'command-prompt', type: APP_TYPES.COMMAND_PROMPT, label: 'Command Prompt', icon: '>' },
];

export const ALL_APPS = PINNED_APPS;

export const STORAGE_KEYS = {
  WINDOWS: 'os-windows',
  FILESYSTEM: 'os-filesystem',
  DARK_MODE: 'os-dark-mode',
  ACCENT_COLOR: 'os-accent-color',
  NOTEPAD_FILES: 'os-notepad-files',
  LAST_FOLDERS: 'os-last-folders',
};

// Default window positions for apps
export const DEFAULT_WINDOW_POSITIONS = {
  'file-explorer': { x: 100, y: 80, width: 800, height: 600 },
  'notepad': { x: 150, y: 150, width: 700, height: 500 },
  'word-processor': { x: 120, y: 100, width: 900, height: 650 },
  'calculator': { x: 200, y: 200, width: 360, height: 450 },
  'settings': { x: 250, y: 250, width: 850, height: 600 },
  'process-manager': { x: 50, y: 50, width: 900, height: 600 },
  'scheduler': { x: 80, y: 80, width: 950, height: 650 },
  'memory-manager': { x: 120, y: 120, width: 800, height: 550 },
  'task-manager': { x: 140, y: 110, width: 980, height: 640 },
  'disk-management': { x: 180, y: 140, width: 700, height: 500 },
  'command-prompt': { x: 180, y: 120, width: 860, height: 560 },
};

export const KEYBOARD_SHORTCUTS = {
  ALT_TAB: 'alt+tab',
  ALT_F4: 'alt+f4',
  ESCAPE: 'escape',
  WIN_V: 'meta+v',
  CTRL_C: 'ctrl+c',
  CTRL_V: 'ctrl+v',
  CTRL_Z: 'ctrl+z',
  CTRL_Y: 'ctrl+y',
};
