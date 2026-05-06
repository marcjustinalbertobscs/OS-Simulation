import React, { useMemo } from 'react';
import Window from './Window';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import ShellIcon from './ShellIcon';
import { desktopApps } from './desktopConfig';
import { useWindow } from '../hooks/useOS';
import { APP_TYPES } from '../utils/constants';
import wallpaperImage from '../assets/Wallpaper.jpg';

import FileExplorer from '../apps/FileExplorer';
import Notepad from '../apps/Notepad';
import WordProcessor from '../apps/WordProcessor';
import Calculator from '../apps/Calculator';
import Settings from '../apps/Settings';
import ProcessManager from '../apps/ProcessManager';
import Scheduler from '../apps/Scheduler';
import MemoryManager from '../apps/MemoryManager';
import TaskManager from '../apps/TaskManager';
import DiskManagement from '../apps/DiskManagement';
import CommandPrompt from '../apps/CommandPrompt';

const Desktop = () => {
  const { windows, openWindow } = useWindow();
  const [showStartMenu, setShowStartMenu] = React.useState(false);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = React.useState(null);
  const desktopRef = React.useRef(null);

  const sortedWindows = useMemo(() => [...windows].sort((a, b) => a.zIndex - b.zIndex), [windows]);

  React.useEffect(() => {
    const isEditableTarget = (target) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName;
      return (
        target.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT'
      );
    };

    const getFullscreenElement = () =>
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      null;

    const requestFullscreen = async () => {
      const element = desktopRef.current || document.documentElement;

      if (getFullscreenElement()) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }

      if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
        return;
      }

      if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    };

    const exitFullscreen = async () => {
      if (!getFullscreenElement()) {
        return;
      }

      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return;
      }

      if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
        return;
      }

      if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    };

    const handleKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isEditableTarget(e.target)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        requestFullscreen().catch(() => {});
        return;
      }

      if (e.key === 'Escape') {
        if (getFullscreenElement()) {
          e.preventDefault();
          exitFullscreen().catch(() => {});
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderAppContent = (windowData) => {
    switch (windowData.appType) {
      case APP_TYPES.FILE_EXPLORER:
        return <FileExplorer />;
      case APP_TYPES.NOTEPAD:
        // We pass the appId as initialFilePath since that's what FileExplorer sends to openWindow
        return <Notepad initialFilePath={windowData.appId} />;
      case APP_TYPES.WORD_PROCESSOR:
        return <WordProcessor initialFilePath={windowData.appId} />;
      case APP_TYPES.CALCULATOR:
        return <Calculator />;
      case APP_TYPES.SETTINGS:
        return <Settings />;
      case APP_TYPES.PROCESS_MANAGER:
        return <ProcessManager />;
      case APP_TYPES.SCHEDULER:
        return <Scheduler />;
      case APP_TYPES.MEMORY_MANAGER:
        return <MemoryManager />;
      case APP_TYPES.TASK_MANAGER:
        return <TaskManager />;
      case APP_TYPES.DISK_MANAGEMENT:
        return <DiskManagement />;
      case APP_TYPES.COMMAND_PROMPT:
        return <CommandPrompt />;
      default:
        return <div className="p-4 text-sm">Unknown App</div>;
    }
  };

  return (
    <div
      id="app"
      ref={desktopRef}
      className="relative h-full w-full overflow-hidden text-[var(--shell-text)]"
      style={{
        backgroundImage: `url(${wallpaperImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      onClick={() => setSelectedDesktopIcon(null)}
    >
      <div className="relative z-10 h-full w-full px-3 pb-20 pt-4 sm:px-5">
        <div className="grid max-h-full w-[96px] auto-rows-max gap-2">
          <button
            type="button"
            className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition ${
              selectedDesktopIcon === 'recycle'
                ? 'bg-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                : 'hover:bg-white/10'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDesktopIcon('recycle');
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl">
              <ShellIcon type="recycle" className="h-9 w-9" />
            </span>
            <span className="line-clamp-2 text-[12px] font-medium leading-4 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.7)]">
              Recycle Bin
            </span>
          </button>

          {desktopApps.map((app) => (
            <button
              key={app.id}
              type="button"
              className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition ${
                selectedDesktopIcon === app.id
                  ? 'bg-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                  : 'hover:bg-white/10'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDesktopIcon(app.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openWindow(app.type, app.id);
              }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[18px]">
                <ShellIcon type={app.type} className="h-9 w-9" />
              </span>
              <span className="line-clamp-2 text-[12px] font-medium leading-4 text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.7)]">
                {app.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {sortedWindows.map((windowData) => (
        <Window key={windowData.id} windowData={windowData}>
          {renderAppContent(windowData)}
        </Window>
      ))}

      {showStartMenu && (
        <div
          className="absolute inset-0 z-[3000] bg-black/10 backdrop-blur-[2px]"
          onClick={() => setShowStartMenu(false)}
        />
      )}

      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}

      <Taskbar
        onStartMenuClick={() => setShowStartMenu((current) => !current)}
        startMenuOpen={showStartMenu}
      />
    </div>
  );
};

export default Desktop;
