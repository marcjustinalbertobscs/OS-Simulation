import React from 'react';
import { APP_TYPES } from '../utils/constants';

const iconMap = {
  start: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="#4cc2ff" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="#7ad7ff" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="#1f9cf0" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" fill="#3eb2ff" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" strokeLinecap="round" />
    </svg>
  ),
  power: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v8" strokeLinecap="round" />
      <path d="M7.5 5.8a8 8 0 1 0 9 0" strokeLinecap="round" />
    </svg>
  ),
  chevronUp: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m6 14 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  volume: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 10h4l5-4v12l-5-4H5z" strokeLinejoin="round" />
      <path d="M18 9a4 4 0 0 1 0 6" strokeLinecap="round" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4.5 9.5a12 12 0 0 1 15 0" strokeLinecap="round" />
      <path d="M7.5 12.5a7.5 7.5 0 0 1 9 0" strokeLinecap="round" />
      <path d="M10.5 15.5a3.2 3.2 0 0 1 3 0" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <rect x="20" y="10" width="1.5" height="4" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="5.5" y="9.5" width="8.5" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  recycle: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M8 4h8l1 3H7z" fill="#f3f7ff" />
      <path d="M7 7h10l-1.2 12H8.2z" fill="#f8fbff" />
      <path d="M12 8.5 9.8 12h1.8l-1.1 1.8M12 15.5l2.2-3.5h-1.8l1.1-1.8" stroke="#21a5ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.4 9.5 8.2 12h1.6" stroke="#21a5ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6 14.5 15.8 12h-1.6" stroke="#21a5ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4h8l1 3H7z" stroke="#d4deef" strokeWidth="1" />
      <path d="M7 7h10l-1.2 12H8.2z" stroke="#d4deef" strokeWidth="1" />
    </svg>
  ),
};

const appIconMap = {
  [APP_TYPES.FILE_EXPLORER]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H10l1.4 1.7H18.5A2.5 2.5 0 0 1 21 10.2V17a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#f6c443" />
      <path d="M3 10a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 10v1H3z" fill="#ffdf7a" />
      <path d="M3 11h18v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#f0b329" />
    </svg>
  ),
  [APP_TYPES.NOTEPAD]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2.5" fill="#fffdfb" />
      <rect x="5" y="3" width="14" height="4" rx="2.5" fill="#2b8eff" />
      <path d="M8 10h8M8 13h8M8 16h5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  [APP_TYPES.WORD_PROCESSOR]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#f5f5f5" />
      <rect x="3" y="3" width="18" height="4" rx="2" fill="#0078d4" />
      <path d="M6 11h12M6 14h12M6 17h8" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  [APP_TYPES.CALCULATOR]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="4" y="2.5" width="16" height="19" rx="3" fill="#2a3547" />
      <rect x="7" y="5.5" width="10" height="4" rx="1.2" fill="#c7f9ff" />
      <g fill="#dbe4f0">
        <rect x="7" y="12" width="3" height="3" rx="0.8" />
        <rect x="11" y="12" width="3" height="3" rx="0.8" />
        <rect x="15" y="12" width="3" height="3" rx="0.8" />
        <rect x="7" y="16" width="3" height="3" rx="0.8" />
        <rect x="11" y="16" width="3" height="3" rx="0.8" />
      </g>
      <rect x="15" y="16" width="3" height="3" rx="0.8" fill="#60a5fa" />
    </svg>
  ),
  [APP_TYPES.SETTINGS]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
      <path d="m12 3 1.3 2.7 3 .6-.8 2.9 2 2-2 2 .8 2.9-3 .6L12 21l-1.3-2.7-3-.6.8-2.9-2-2 2-2-.8-2.9 3-.6z" fill="#7c8aa5" />
      <circle cx="12" cy="12" r="3.2" fill="#e9eef8" />
      <circle cx="12" cy="12" r="1.6" fill="#7c8aa5" />
    </svg>
  ),
  [APP_TYPES.PROCESS_MANAGER]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="#1f2937" />
      <path d="M7 15.5V12l2 1.5 2.5-4 2.5 5 2-2v3" stroke="#47d6ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  [APP_TYPES.SCHEDULER]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#fff5d6" />
      <circle cx="12" cy="12" r="7.5" stroke="#e3a823" strokeWidth="1.5" />
      <path d="M12 8v4.2l3 1.8" stroke="#d08700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  [APP_TYPES.MEMORY_MANAGER]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="10" rx="2" fill="#22c55e" />
      <rect x="6.5" y="9.5" width="11" height="5" rx="1" fill="#d7ffe6" />
      <path d="M8 5v2M12 5v2M16 5v2M8 17v2M12 17v2M16 17v2" stroke="#1f7a3f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  [APP_TYPES.TASK_MANAGER]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#e5e7eb" />
      <rect x="5" y="5" width="4" height="3" rx="1" fill="#60a5fa" />
      <rect x="10" y="5" width="4" height="3" rx="1" fill="#34d399" />
      <rect x="15" y="5" width="3" height="3" rx="1" fill="#fbbf24" />
      <rect x="5" y="9.5" width="4" height="3" rx="1" fill="#a78bfa" />
      <rect x="10" y="9.5" width="4" height="3" rx="1" fill="#fb7185" />
      <rect x="15" y="9.5" width="3" height="3" rx="1" fill="#06b6d4" />
      <rect x="5" y="14" width="4" height="3" rx="1" fill="#8b5cf6" />
      <rect x="10" y="14" width="4" height="3" rx="1" fill="#ec4899" />
      <rect x="15" y="14" width="3" height="3" rx="1" fill="#14b8a6" />
    </svg>
  ),
  [APP_TYPES.COMMAND_PROMPT]: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" fill="#111827" />
      <path d="m6.5 9 3 3-3 3" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 15h5" stroke="#d1fae5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 7h15" stroke="#374151" strokeWidth="1.2" />
    </svg>
  ),
};

export default function ShellIcon({ type, className = '' }) {
  const icon = iconMap[type] || appIconMap[type] || appIconMap[APP_TYPES.FILE_EXPLORER];
  return <span className={`inline-flex items-center justify-center ${className}`}>{icon}</span>;
}
