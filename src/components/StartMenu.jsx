import React, { useState, useMemo, useEffect } from 'react';
import { useWindow } from '../hooks/useOS';
import { ALL_APPS } from '../utils/constants';
import ShellIcon from './ShellIcon';

const StartMenu = ({ onClose }) => {
  const { openWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) {
      return ALL_APPS;
    }

    return ALL_APPS.filter((app) => app.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleAppClick = (app) => {
    openWindow(app.type, app.id);
    onClose();
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div className="fixed bottom-16 left-[140px] z-[3500] flex justify-start px-4">
      <div 
        className="w-full w-[640px] overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-white/10 to-transparent text-[var(--shell-text)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(255,255,255,0.1),0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-[60px] backdrop-saturate-[200%] transition-all duration-300 ease-out"
        style={{
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <style>
          {`
            @keyframes slideUp {
              0% { opacity: 0; transform: translateY(30px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}
        </style>
        <div className="border-b border-white/8 px-6 pb-5 pt-6">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--shell-text-muted)]">
              <ShellIcon type="search" className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search for apps, files, and settings"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="h-12 w-full rounded-2xl border border-white/12 bg-white/10 pl-11 pr-4 text-sm text-[var(--shell-text)] outline-none ring-0 placeholder:text-[var(--shell-text-muted)] focus:border-white/20 focus:bg-white/12"
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-[15px] font-semibold tracking-[0.02em]">Pinned</h1>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs text-[var(--shell-text-muted)] transition hover:bg-white/12 hover:text-[var(--shell-text)]"
            >
              All apps
            </button>
          </div>

          <div className="grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <button
                  key={app.id}
                  className="flex items-center gap-3 rounded-2xl border border-transparent bg-white/5 px-3 py-3 text-left transition hover:border-white/10 hover:bg-white/10"
                  onClick={() => handleAppClick(app)}
                  title={app.label}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <ShellIcon type={app.type} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{app.label}</div>
                    <div className="truncate text-xs text-[var(--shell-text-muted)]">Desktop app</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/12 bg-white/5 px-4 py-8 text-center text-sm text-[var(--shell-text-muted)]">
                No apps found
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/8 bg-black/10 px-6 py-4">
          <div>
            <div className="text-sm font-medium">Student Workspace</div>
            <div className="text-xs text-[var(--shell-text-muted)]">OS Final Project</div>
          </div>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[var(--shell-text)] transition hover:bg-white/15"
            title="Power menu"
            aria-label="Power menu"
            type="button"
          >
            <ShellIcon type="power" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
