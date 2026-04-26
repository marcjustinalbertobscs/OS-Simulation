import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFileSystem } from '../hooks/useOS';
import '../styles/apps.css';

const ROOT_PATH = 'C:\\';
const QUICK_ACCESS_PATHS = ['C:\\Users\\Desktop', 'C:\\Users\\Documents', 'C:\\Users\\Downloads', 'C:\\'];

const folderIcon = '📁';
const fileIcon = '📄';

const normalizePath = (path) => (path === ROOT_PATH ? ROOT_PATH : path.replace(/[\\/]+/g, '\\').replace(/\\$/, ''));
const joinPath = (parentPath, name) => (parentPath === ROOT_PATH ? `${ROOT_PATH}${name}` : `${parentPath}\\${name}`);
const getBaseName = (path) => {
  if (path === ROOT_PATH) return ROOT_PATH;
  const parts = normalizePath(path).split('\\');
  return parts[parts.length - 1];
};
const getParentPath = (path) => {
  if (path === ROOT_PATH) return ROOT_PATH;
  const normalizedPath = normalizePath(path);
  const lastSeparator = normalizedPath.lastIndexOf('\\');
  return lastSeparator <= 2 ? ROOT_PATH : normalizedPath.slice(0, lastSeparator);
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const formatSize = (item) => {
  if (item.type === 'folder') return 'Folder';
  if (!item.size) return '0 KB';
  if (item.size < 1024) return `${item.size} B`;
  return `${(item.size / 1024).toFixed(1)} KB`;
};

const buildTree = (folders, folderPath) => {
  const folder = folders[folderPath];
  if (!folder) return null;

  const childFolders = (folder.children || [])
    .map((childName) => joinPath(folderPath, childName))
    .filter((childPath) => folders[childPath])
    .sort((a, b) => getBaseName(a).localeCompare(getBaseName(b)))
    .map((childPath) => buildTree(folders, childPath))
    .filter(Boolean);

  return {
    ...folder,
    path: folderPath,
    folders: childFolders,
  };
};

const FolderTreeNode = ({ node, currentPath, onNavigate, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isActive = currentPath === node.path;
  const hasChildren = node.folders.length > 0;

  return (
    <div>
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[13px] transition ${
          isActive ? 'bg-[color-mix(in_srgb,var(--accent-color)_18%,transparent)] text-[var(--app-text)]' : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => onNavigate(node.path)}
      >
        <span
          className="flex h-4 w-4 items-center justify-center text-[11px] text-[var(--text-muted)]"
          onClick={(e) => {
            if (!hasChildren) return;
            e.stopPropagation();
            setIsOpen((value) => !value);
          }}
        >
          {hasChildren ? (isOpen ? '▾' : '▸') : ''}
        </span>
        <span>{folderIcon}</span>
        <span className="truncate">{node.path === ROOT_PATH ? 'Local Disk (C:)' : node.name}</span>
      </button>

      {hasChildren && isOpen && (
        <div className="space-y-0.5">
          {node.folders.map((childNode) => (
            <FolderTreeNode
              key={childNode.path}
              node={childNode}
              currentPath={currentPath}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = () => {
  const {
    fileSystem,
    getDirectoryContents,
    getFolder,
    createFolder,
    createFile,
    deleteItem,
    renameItem,
    moveItem,
    copyItem,
  } = useFileSystem();

  const [currentPath, setCurrentPath] = useState('C:\\Users\\Desktop');
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [renamePath, setRenamePath] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [createMode, setCreateMode] = useState(null);
  const [createValue, setCreateValue] = useState('');
  const [draggedPaths, setDraggedPaths] = useState([]);

  const explorerRef = useRef(null);

  const contents = getDirectoryContents(currentPath);
  const items = useMemo(
    () => [...contents.folders, ...contents.files].map((item) => ({ ...item, path: item.path || joinPath(currentPath, item.name) })),
    [contents.files, contents.folders, currentPath]
  );

  const currentFolder = getFolder(currentPath);
  const tree = useMemo(() => buildTree(fileSystem.folders, ROOT_PATH), [fileSystem.folders]);
  const breadcrumbs = useMemo(() => {
    if (currentPath === ROOT_PATH) return [{ label: 'This PC', path: ROOT_PATH }];
    const parts = currentPath.split('\\').filter(Boolean);
    return parts.map((part, index) => ({
      label: index === 0 ? 'This PC' : part,
      path: index === 0 ? ROOT_PATH : `${parts.slice(0, index + 1).join('\\')}${index === 0 ? '\\' : ''}`.replace(/^C:$/, 'C:\\'),
    }));
  }, [currentPath]);

  useEffect(() => {
    if (!getFolder(currentPath)) {
      setCurrentPath(ROOT_PATH);
    }
  }, [currentPath, getFolder]);

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const clearTransientState = () => {
    setRenamePath(null);
    setRenameValue('');
    setCreateMode(null);
    setCreateValue('');
  };

  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedPaths([]);
    clearTransientState();
  };

  const openFolder = (path) => {
    navigateTo(path);
  };

  const selectPath = (path, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      setSelectedPaths((current) =>
        current.includes(path) ? current.filter((entry) => entry !== path) : [...current, path]
      );
      return;
    }

    setSelectedPaths([path]);
  };

  const ensureSelection = (path) => {
    setSelectedPaths((current) => (current.includes(path) ? current : [path]));
  };

  const startRename = (path) => {
    setRenamePath(path);
    setRenameValue(getBaseName(path));
    setCreateMode(null);
  };

  const submitRename = () => {
    if (!renamePath || !renameValue.trim()) {
      clearTransientState();
      return;
    }

    renameItem(renamePath, renameValue.trim());
    setSelectedPaths([joinPath(getParentPath(renamePath), renameValue.trim())]);
    clearTransientState();
  };

  const submitCreate = () => {
    if (!createMode || !createValue.trim()) return;

    if (createMode === 'folder') {
      createFolder(currentPath, createValue.trim());
    } else {
      createFile(currentPath, createValue.trim(), '');
    }

    clearTransientState();
  };

  const handleDelete = (paths = selectedPaths) => {
    paths.forEach((path) => deleteItem(path));
    setSelectedPaths([]);
    clearTransientState();
  };

  const handleCopy = (paths = selectedPaths) => {
    setClipboard(paths);
  };

  const handlePaste = (targetPath = currentPath) => {
    clipboard.forEach((path) => copyItem(path, targetPath));
  };

  const handleMove = (paths, targetPath) => {
    paths.forEach((path) => {
      if (path !== targetPath) {
        moveItem(path, targetPath);
      }
    });
    setSelectedPaths([]);
  };

  const openContextMenu = (event, path = null, targetPath = currentPath) => {
    event.preventDefault();
    event.stopPropagation();

    if (path) {
      ensureSelection(path);
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      targetPath,
      sourcePath: path,
    });
  };

  return (
    <div
      ref={explorerRef}
      className="flex h-full min-h-0 flex-col bg-[var(--app-bg)] text-[var(--app-text)]"
      onClick={() => setSelectedPaths([])}
      onContextMenu={(event) => openContextMenu(event, null, currentPath)}
    >
      <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-3 py-2">
        <button
          type="button"
          className="rounded-lg border border-[var(--app-border)] bg-[var(--button-bg)] px-2.5 py-1.5 text-xs hover:bg-[var(--button-hover-bg)]"
          onClick={() => navigateTo(getParentPath(currentPath))}
          disabled={currentPath === ROOT_PATH}
        >
          Up
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--app-border)] bg-[var(--button-bg)] px-2.5 py-1.5 text-xs hover:bg-[var(--button-hover-bg)]"
          onClick={() => {
            setCreateMode('folder');
            setCreateValue('');
          }}
        >
          New Folder
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--app-border)] bg-[var(--button-bg)] px-2.5 py-1.5 text-xs hover:bg-[var(--button-hover-bg)]"
          onClick={() => {
            setCreateMode('file');
            setCreateValue('');
          }}
        >
          New File
        </button>
      </div>

      <div className="border-b border-[var(--app-border)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[var(--input-bg)] px-2 py-1.5">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => navigateTo(crumb.path)}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 ? <span className="text-[var(--text-muted)]">›</span> : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r border-[var(--app-border)] bg-black/[0.02] p-3 dark:bg-white/[0.02]">
          <div className="mb-4">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Quick Access
            </div>
            <div className="space-y-1">
              {QUICK_ACCESS_PATHS.map((path) => (
                <button
                  key={path}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[13px] transition ${
                    currentPath === path ? 'bg-[color-mix(in_srgb,var(--accent-color)_18%,transparent)]' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => navigateTo(path)}
                >
                  <span>{folderIcon}</span>
                  <span className="truncate">
                    {path === ROOT_PATH ? 'Local Disk (C:)' : getBaseName(path)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Folders
            </div>
            <div className="max-h-[calc(100vh-280px)] space-y-0.5 overflow-auto pr-1">
              {tree && <FolderTreeNode node={tree} currentPath={currentPath} onNavigate={navigateTo} />}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="grid grid-cols-[minmax(0,1fr)_140px_120px] border-b border-[var(--app-border)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <span>Name</span>
            <span>Date Modified</span>
            <span>Type / Size</span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
            {(createMode || renamePath) && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--input-bg)] px-3 py-2">
                <input
                  type="text"
                  value={renamePath ? renameValue : createValue}
                  onChange={(event) => (renamePath ? setRenameValue(event.target.value) : setCreateValue(event.target.value))}
                  className="flex-1 rounded-lg border border-[var(--app-border)] bg-transparent px-2 py-1.5 text-sm outline-none"
                  placeholder={renamePath ? 'Rename item' : createMode === 'folder' ? 'Folder name' : 'File name'}
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      renamePath ? submitRename() : submitCreate();
                    }
                    if (event.key === 'Escape') {
                      clearTransientState();
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs hover:bg-[var(--button-hover-bg)]"
                  onClick={renamePath ? submitRename : submitCreate}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs hover:bg-[var(--button-hover-bg)]"
                  onClick={clearTransientState}
                >
                  Cancel
                </button>
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[var(--app-border)] text-sm text-[var(--text-muted)]">
                This folder is empty
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => {
                  const itemPath = item.path;
                  const isSelected = selectedPaths.includes(itemPath);
                  const isFolder = item.type === 'folder';

                  return (
                    <div
                      key={itemPath}
                      className={`grid cursor-default grid-cols-[minmax(0,1fr)_140px_120px] items-center rounded-xl border px-3 py-2 text-sm transition ${
                        isSelected
                          ? 'border-[color-mix(in_srgb,var(--accent-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-color)_14%,transparent)]'
                          : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      draggable
                      onDragStart={() => setDraggedPaths(isSelected ? selectedPaths : [itemPath])}
                      onDragOver={(event) => {
                        if (isFolder) {
                          event.preventDefault();
                        }
                      }}
                      onDrop={(event) => {
                        if (!isFolder) return;
                        event.preventDefault();
                        handleMove(draggedPaths.length > 0 ? draggedPaths : [itemPath], itemPath);
                        setDraggedPaths([]);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectPath(itemPath, event);
                      }}
                      onDoubleClick={() => {
                        if (isFolder) {
                          openFolder(itemPath);
                        }
                      }}
                      onContextMenu={(event) => openContextMenu(event, itemPath, isFolder ? itemPath : currentPath)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-base">{isFolder ? folderIcon : fileIcon}</span>
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(item.updatedAt || item.modifiedAt || item.createdAt)}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatSize(item)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--app-border)] px-4 py-2 text-xs text-[var(--text-muted)]">
            <span>{currentFolder?.children?.length || 0} item(s)</span>
            <span>{selectedPaths.length > 0 ? `${selectedPaths.length} selected` : 'Ready'}</span>
          </div>
        </section>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[5000] min-w-44 rounded-2xl border border-[var(--app-border)] bg-[var(--input-bg)] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => {
              if (selectedPaths[0]) startRename(selectedPaths[0]);
              setContextMenu(null);
            }}
            disabled={selectedPaths.length !== 1}
          >
            Rename
          </button>
          <button
            type="button"
            className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => {
              handleCopy();
              setContextMenu(null);
            }}
            disabled={selectedPaths.length === 0}
          >
            Copy
          </button>
          <button
            type="button"
            className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => {
              handlePaste(contextMenu.targetPath);
              setContextMenu(null);
            }}
            disabled={clipboard.length === 0}
          >
            Paste
          </button>
          <button
            type="button"
            className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => {
              handleDelete();
              setContextMenu(null);
            }}
            disabled={selectedPaths.length === 0}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
