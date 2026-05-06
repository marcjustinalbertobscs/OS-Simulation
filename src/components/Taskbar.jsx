import React, { useState, useEffect } from 'react';
import { useWindow } from '../hooks/useOS';
import { PINNED_APPS } from '../utils/constants';
import ShellIcon from './ShellIcon';

const Taskbar = ({ onStartMenuClick, startMenuOpen }) => {
  const { windows, focusedWindowId, focusWindow, openWindow, minimizeWindow } = useWindow();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });

  const getAppInstances = (appType) => windows.filter((windowItem) => windowItem.appType === appType);

  const handleAppClick = (appType, appId) => {
    const instances = getAppInstances(appType);

    if (instances.length === 0) {
      openWindow(appType, appId);
      return;
    }

    const lastInstance = instances[instances.length - 1];

    if (lastInstance.isMinimized) {
      minimizeWindow(lastInstance.id);
      focusWindow(lastInstance.id);
      return;
    }

    if (focusedWindowId === lastInstance.id) {
      minimizeWindow(lastInstance.id);
      return;
    }

    focusWindow(lastInstance.id);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[4000]">
      <div className="pointer-events-auto flex h-14 items-center gap-2 border-t border-[var(--shell-taskbar-border)] bg-[var(--shell-taskbar-bg)] px-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="hidden min-w-[124px] items-center rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs font-medium text-white/70 md:flex">
          OS Simulator
        </div>

        <div className="mx-1 hidden h-8 w-px bg-white/10 md:block" />

        <button
          className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
            startMenuOpen ? 'bg-[var(--shell-taskbar-active)]' : 'hover:bg-[var(--shell-taskbar-hover)]'
          }`}
          onClick={onStartMenuClick}
          title="Start"
          aria-label="Start menu"
        >
          <ShellIcon type="start" className="h-6 w-6" />
        </button>

        <button
          className={`hidden h-10 min-w-[124px] items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm transition sm:flex ${
            startMenuOpen 
              ? 'bg-[var(--shell-taskbar-active)] text-white shadow-inner scale-[0.98]' 
              : 'bg-white/10 text-[var(--shell-text-muted)] hover:bg-white/15'
          }`}
          type="button"
          onClick={onStartMenuClick}
        >
          <ShellIcon type="search" className="h-4 w-4" />
          <span>Search</span>
        </button>

        <div className="mx-1 h-8 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          {PINNED_APPS.map((app) => {
            const instances = getAppInstances(app.type);
            const isOpen = instances.length > 0;
            const hasFocus = instances.some((instance) => instance.id === focusedWindowId && !instance.isMinimized);

            return (
              <div key={app.id} className="group relative">
                <button
                  className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    hasFocus
                      ? 'bg-[var(--shell-taskbar-active)]'
                      : isOpen
                        ? 'bg-white/10 hover:bg-[var(--shell-taskbar-hover)]'
                        : 'hover:bg-[var(--shell-taskbar-hover)]'
                  }`}
                  onClick={() => handleAppClick(app.type, app.id)}
                  title={app.label}
                  aria-label={app.label}
                >
                  <ShellIcon type={app.type} className="h-6 w-6" />
                  {isOpen && (
                    <span className={`absolute bottom-1 h-1.5 rounded-full bg-[var(--accent-color)] ${hasFocus ? 'w-4' : 'w-2'}`} />
                  )}
                </button>

                {isOpen && (
                  <div className="pointer-events-none absolute bottom-14 left-1/2 z-20 hidden min-w-52 -translate-x-1/2 rounded-2xl border border-[var(--shell-panel-border)] bg-[var(--shell-panel-bg)] p-2 text-left shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl group-hover:block">
                    {instances.map((instance) => (
                      <button
                        key={instance.id}
                        className="pointer-events-auto flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--shell-text)] transition hover:bg-[var(--shell-panel-soft)]"
                        onClick={() => {
                          focusWindow(instance.id);
                          if (instance.isMinimized) {
                            minimizeWindow(instance.id);
                          }
                        }}
                      >
                        <ShellIcon type={app.type} className="h-5 w-5" />
                        <span className="truncate">{instance.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button className="flex h-10 w-8 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-taskbar-hover)]" type="button">
            <ShellIcon type="chevronUp" className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-8 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-taskbar-hover)]" type="button">
            <ShellIcon type="wifi" className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-8 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-taskbar-hover)]" type="button">
            <ShellIcon type="volume" className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-8 items-center justify-center rounded-xl text-[var(--shell-text-muted)] transition hover:bg-[var(--shell-taskbar-hover)]" type="button">
            <ShellIcon type="battery" className="h-4 w-4" />
          </button>
          <div className="mx-1 h-8 w-px bg-white/10" />
          <div className="rounded-xl px-2 py-1 text-right leading-tight transition hover:bg-[var(--shell-taskbar-hover)]">
            <div className="text-[13px] font-medium">{formatTime(currentTime)}</div>
            <div className="text-[11px] text-[var(--shell-text-muted)]">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
