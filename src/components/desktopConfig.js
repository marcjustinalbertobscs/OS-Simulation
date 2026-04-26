import { ALL_APPS, APP_TYPES } from '../utils/constants';

const desktopOrder = [
  APP_TYPES.FILE_EXPLORER,
  APP_TYPES.NOTEPAD,
  APP_TYPES.WORD_PROCESSOR,
  APP_TYPES.CALCULATOR,
  APP_TYPES.SETTINGS,
  APP_TYPES.PROCESS_MANAGER,
  APP_TYPES.SCHEDULER,
  APP_TYPES.MEMORY_MANAGER,
  APP_TYPES.TASK_MANAGER,
];

export const desktopApps = desktopOrder
  .map((type) => ALL_APPS.find((app) => app.type === type))
  .filter(Boolean);
