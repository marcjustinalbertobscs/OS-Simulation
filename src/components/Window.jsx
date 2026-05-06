import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWindow } from '../hooks/useOS';
import { WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT, TASKBAR_HEIGHT } from '../utils/constants';
import ShellIcon from './ShellIcon';

const Window = ({ windowData, children }) => {
  const {
    focusWindow,
    focusedWindowId,
    updateWindowPosition,
    updateWindowSize,
    minimizeWindow,
    maximizeWindow,
    //fullscreenWindow,
    closeWindow,
  } = useWindow();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const windowRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 });

  const getViewportDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight - TASKBAR_HEIGHT,
  });

  const constrainPosition = useCallback((x, y) => {
    const viewport = getViewportDimensions();
    const minX = 0;
    const maxX = Math.max(0, viewport.width - windowData.width);
    const minY = 0;
    const maxY = Math.max(0, viewport.height - windowData.height);

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, [windowData.width, windowData.height]);

  const handleMouseDown = (e) => {
    if (windowData.isMaximized || e.target.closest('.window-button')) {
      return;
    }

    focusWindow(windowData.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: windowData.x,
      windowY: windowData.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      const nextPosition = constrainPosition(
        dragStartPos.current.windowX + deltaX,
        dragStartPos.current.windowY + deltaY
      );

      updateWindowPosition(windowData.id, nextPosition.x, nextPosition.y);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [constrainPosition, isDragging, updateWindowPosition, windowData.id]);

  const handleResizeStart = (e, direction) => {
    if (windowData.isMaximized) {
      return;
    }

    e.preventDefault();
    focusWindow(windowData.id);
    setIsResizing(true);
    setResizeDirection(direction);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      windowX: windowData.x,
      windowY: windowData.y,
      width: windowData.width,
      height: windowData.height,
    };
  };

  useEffect(() => {
    if (!isResizing || !resizeDirection) return undefined;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      let newWidth = dragStartPos.current.width;
      let newHeight = dragStartPos.current.height;
      let newX = dragStartPos.current.windowX;
      let newY = dragStartPos.current.windowY;

      switch (resizeDirection) {
        case 'e':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width + deltaX);
          break;
        case 's':
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height + deltaY);
          break;
        case 'w':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width - deltaX);
          newX = dragStartPos.current.windowX + deltaX;
          break;
        case 'n':
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height - deltaY);
          newY = dragStartPos.current.windowY + deltaY;
          break;
        case 'se':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width + deltaX);
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width - deltaX);
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height + deltaY);
          newX = dragStartPos.current.windowX + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width + deltaX);
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height - deltaY);
          newY = dragStartPos.current.windowY + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(WINDOW_MIN_WIDTH, dragStartPos.current.width - deltaX);
          newHeight = Math.max(WINDOW_MIN_HEIGHT, dragStartPos.current.height - deltaY);
          newX = dragStartPos.current.windowX + deltaX;
          newY = dragStartPos.current.windowY + deltaY;
          break;
        default:
          break;
      }

      const constrained = constrainPosition(newX, newY);
      updateWindowSize(windowData.id, newWidth, newHeight);
      updateWindowPosition(windowData.id, constrained.x, constrained.y);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [constrainPosition, isResizing, resizeDirection, updateWindowPosition, updateWindowSize, windowData.id]);

  const windowStyle = {
    position: 'fixed',
    left: windowData.isMaximized || windowData.isFullscreen ? '0px' : `${windowData.x}px`,
    top: windowData.isMaximized || windowData.isFullscreen ? '0px' : `${windowData.y}px`,
    width: windowData.isMaximized || windowData.isFullscreen ? '100vw' : `${windowData.width}px`,
    height: windowData.isFullscreen ? '100vh' : windowData.isMaximized ? `${window.innerHeight - TASKBAR_HEIGHT}px` : `${windowData.height}px`,
    zIndex: windowData.zIndex || 1000,
    display: windowData.isMinimized ? 'none' : 'flex',
  };

  const isFocused = focusedWindowId === windowData.id;

  return (
    <div
      ref={windowRef}
      className={`group flex flex-col overflow-hidden border border-[var(--shell-window-border)] bg-[var(--shell-window-bg)] text-[var(--app-text)] backdrop-blur-2xl transition-shadow ${
        windowData.isMaximized || windowData.isFullscreen ? 'rounded-none' : 'rounded-2xl'
      } ${
        isFocused
          ? 'shadow-[0_26px_80px_rgba(15,23,42,0.38)]'
          : 'shadow-[0_18px_42px_rgba(15,23,42,0.22)]'
      }`}
      style={windowStyle}
      onClick={() => focusWindow(windowData.id)}
    >
      <div
        className={`flex h-11 items-center justify-between border-b border-black/5 bg-[var(--shell-window-title)] px-3 text-[13px] ${
          windowData.isMaximized ? 'cursor-default' : 'cursor-move'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeWindow(windowData.id)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/55 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
            <ShellIcon type={windowData.appType} className="h-5 w-5" />
          </span>
          <div className="truncate font-medium text-[var(--app-text)]">{windowData.title}</div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="window-button flex h-8 w-10 items-center justify-center rounded-xl text-[var(--app-text)] transition hover:bg-[var(--shell-window-hover)]"
            onClick={() => minimizeWindow(windowData.id)}
            title="Minimize"
            aria-label="Minimize window"
          >
            <span className="block h-px w-3 bg-current" />
          </button>
          <button
            className="window-button flex h-8 w-10 items-center justify-center rounded-xl text-[var(--app-text)] transition hover:bg-[var(--shell-window-hover)]"
            onClick={() => maximizeWindow(windowData.id)}
            title={windowData.isMaximized ? 'Restore' : 'Maximize'}
            aria-label={windowData.isMaximized ? 'Restore window' : 'Maximize window'}
          >
            {windowData.isMaximized ? (
              <span className="relative h-3.5 w-3.5">
                <span className="absolute right-0 top-0 h-2.5 w-2.5 border border-current bg-transparent" />
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border border-current bg-transparent" />
              </span>
            ) : (
              <span className="block h-3 w-3 border border-current" />
            )}
          </button>
          <button
            className="window-button flex h-8 w-10 items-center justify-center rounded-xl text-[var(--app-text)] transition hover:bg-[#e81123] hover:text-white"
            onClick={() => closeWindow(windowData.id)}
            title="Close"
            aria-label="Close window"
          >
            <span className="relative block h-3.5 w-3.5">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[var(--window-bg)]">{children}</div>

      {!windowData.isMaximized && !windowData.isFullscreen && (
        <>
          <div className="absolute inset-y-0 right-0 w-1 cursor-ew-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className="absolute inset-x-0 bottom-0 h-1 cursor-ns-resize" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute inset-y-0 left-0 w-1 cursor-ew-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute inset-x-0 top-0 h-1 cursor-ns-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se')} />
          <div className="absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="absolute right-0 top-0 h-3 w-3 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="absolute left-0 top-0 h-3 w-3 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        </>
      )}
    </div>
  );
};

export default Window;
