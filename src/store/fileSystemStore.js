import { DEFAULT_FILESYSTEM_STATE } from '../utils/constants';

const PATH_SEPARATOR = '\\';

const normalizePath = (path) => path.replace(/[\\/]+/g, PATH_SEPARATOR).replace(/\\$/, '');

const joinPath = (parentPath, name) => {
  const normalizedParent = parentPath === 'C:\\' ? 'C:' : normalizePath(parentPath);
  return normalizedParent === 'C:' ? `C:\\${name}` : `${normalizedParent}\\${name}`;
};

const getParentPath = (path) => {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === 'C:') return null;

  const lastSeparator = normalizedPath.lastIndexOf(PATH_SEPARATOR);
  if (lastSeparator <= 2) {
    return 'C:\\';
  }

  return normalizedPath.slice(0, lastSeparator);
};

const getBasename = (path) => {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === 'C:') return 'C:\\';

  const parts = normalizedPath.split(PATH_SEPARATOR);
  return parts[parts.length - 1];
};

const hasItem = (state, path) => Boolean(state.files[path] || state.folders[path]);

const removeChildName = (children = [], name) => children.filter((child) => child !== name);

const addChildName = (children = [], name) =>
  children.includes(name) ? children : [...children, name].sort((a, b) => a.localeCompare(b));

const updateParentChildren = (state, parentPath, updater) => {
  if (!parentPath || !state.folders[parentPath]) {
    return state;
  }

  return {
    ...state,
    folders: {
      ...state.folders,
      [parentPath]: {
        ...state.folders[parentPath],
        children: updater(state.folders[parentPath].children || []),
      },
    },
  };
};

const cloneFolderRecursive = (state, sourcePath, targetParentPath, newName) => {
  const sourceFolder = state.folders[sourcePath];
  const targetPath = joinPath(targetParentPath, newName);

  const folders = {
    [targetPath]: {
      ...sourceFolder,
      name: newName,
      parent: targetParentPath,
      children: [...(sourceFolder.children || [])],
      copiedAt: new Date().toISOString(),
    },
  };

  const files = {};

  Object.entries(state.folders).forEach(([folderPath, folder]) => {
    if (!folderPath.startsWith(`${sourcePath}\\`)) return;

    const relativePath = folderPath.slice(sourcePath.length + 1);
    const clonedPath = `${targetPath}\\${relativePath}`;
    const clonedParentPath = getParentPath(clonedPath);

    folders[clonedPath] = {
      ...folder,
      name: getBasename(clonedPath),
      parent: clonedParentPath,
      children: [...(folder.children || [])],
      copiedAt: new Date().toISOString(),
    };
  });

  Object.entries(state.files).forEach(([filePath, file]) => {
    if (!filePath.startsWith(`${sourcePath}\\`)) return;

    const relativePath = filePath.slice(sourcePath.length + 1);
    const clonedPath = `${targetPath}\\${relativePath}`;

    files[clonedPath] = {
      ...file,
      name: getBasename(clonedPath),
      path: clonedPath,
      parent: getParentPath(clonedPath),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  });

  return { folders, files, rootPath: targetPath };
};

const renameFolderTree = (state, itemPath, newName) => {
  const folder = state.folders[itemPath];
  const parentPath = folder.parent;
  const newPath = joinPath(parentPath, newName);

  if (itemPath === 'C:\\' || hasItem(state, newPath)) {
    return state;
  }

  const renamedFolders = {};
  const renamedFiles = {};

  Object.entries(state.folders).forEach(([folderPath, folderValue]) => {
    if (folderPath === itemPath || folderPath.startsWith(`${itemPath}\\`)) {
      const relativePath = folderPath === itemPath ? '' : folderPath.slice(itemPath.length + 1);
      const targetPath = relativePath ? `${newPath}\\${relativePath}` : newPath;
      renamedFolders[targetPath] = {
        ...folderValue,
        name: getBasename(targetPath),
        parent: getParentPath(targetPath),
      };
      return;
    }

    renamedFolders[folderPath] = folderValue;
  });

  Object.entries(state.files).forEach(([filePath, fileValue]) => {
    if (filePath.startsWith(`${itemPath}\\`)) {
      const relativePath = filePath.slice(itemPath.length + 1);
      const targetPath = `${newPath}\\${relativePath}`;
      renamedFiles[targetPath] = {
        ...fileValue,
        name: getBasename(targetPath),
        path: targetPath,
        parent: getParentPath(targetPath),
      };
      return;
    }

    renamedFiles[filePath] = fileValue;
  });

  return updateParentChildren(
    {
      ...state,
      folders: renamedFolders,
      files: renamedFiles,
    },
    parentPath,
    (children) => children.map((child) => (child === folder.name ? newName : child))
  );
};

const deleteFolderRecursive = (state, folderPath) => {
  const folder = state.folders[folderPath];
  if (!folder || folderPath === 'C:\\') {
    return state;
  }

  const folders = Object.fromEntries(
    Object.entries(state.folders).filter(
      ([path]) => path !== folderPath && !path.startsWith(`${folderPath}\\`)
    )
  );

  const files = Object.fromEntries(
    Object.entries(state.files).filter(([path]) => !path.startsWith(`${folderPath}\\`))
  );

  return updateParentChildren(
    {
      ...state,
      folders,
      files,
    },
    folder.parent,
    (children) => removeChildName(children, folder.name)
  );
};

const moveFolderTree = (state, itemPath, targetParentPath) => {
  const folder = state.folders[itemPath];
  const nextPath = joinPath(targetParentPath, folder.name);

  if (
    !folder ||
    !state.folders[targetParentPath] ||
    itemPath === 'C:\\' ||
    itemPath === targetParentPath ||
    targetParentPath.startsWith(`${itemPath}\\`) ||
    hasItem(state, nextPath)
  ) {
    return state;
  }

  const movedFolders = {};
  const movedFiles = {};

  Object.entries(state.folders).forEach(([folderPath, folderValue]) => {
    if (folderPath === itemPath || folderPath.startsWith(`${itemPath}\\`)) {
      const relativePath = folderPath === itemPath ? '' : folderPath.slice(itemPath.length + 1);
      const targetPath = relativePath ? `${nextPath}\\${relativePath}` : nextPath;
      movedFolders[targetPath] = {
        ...folderValue,
        name: getBasename(targetPath),
        parent: getParentPath(targetPath),
      };
      return;
    }

    movedFolders[folderPath] = folderValue;
  });

  Object.entries(state.files).forEach(([filePath, fileValue]) => {
    if (filePath.startsWith(`${itemPath}\\`)) {
      const relativePath = filePath.slice(itemPath.length + 1);
      const targetPath = `${nextPath}\\${relativePath}`;
      movedFiles[targetPath] = {
        ...fileValue,
        name: getBasename(targetPath),
        path: targetPath,
        parent: getParentPath(targetPath),
      };
      return;
    }

    movedFiles[filePath] = fileValue;
  });

  let nextState = {
    ...state,
    folders: movedFolders,
    files: movedFiles,
  };

  nextState = updateParentChildren(nextState, folder.parent, (children) => removeChildName(children, folder.name));
  nextState = updateParentChildren(nextState, targetParentPath, (children) => addChildName(children, folder.name));

  return nextState;
};

export const fileSystemActions = {
  initState: () => ({
    ...DEFAULT_FILESYSTEM_STATE,
  }),

  createFolder: (state, parentPath, folderName) => {
    const trimmedName = folderName.trim();
    const normalizedParentPath = parentPath === 'C:\\' ? 'C:\\' : normalizePath(parentPath);
    const folderPath = joinPath(normalizedParentPath, trimmedName);

    if (!trimmedName || hasItem(state, folderPath) || !state.folders[normalizedParentPath]) {
      return state;
    }

    const nextState = {
      ...state,
      folders: {
        ...state.folders,
        [folderPath]: {
          name: trimmedName,
          type: 'folder',
          parent: normalizedParentPath,
          children: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    return updateParentChildren(nextState, normalizedParentPath, (children) => addChildName(children, trimmedName));
  },

  createFile: (state, parentPath, fileName, content = '') => {
    const trimmedName = fileName.trim();
    const normalizedParentPath = parentPath === 'C:\\' ? 'C:\\' : normalizePath(parentPath);
    const filePath = joinPath(normalizedParentPath, trimmedName);

    if (!trimmedName || hasItem(state, filePath) || !state.folders[normalizedParentPath]) {
      return state;
    }

    const nextState = {
      ...state,
      files: {
        ...state.files,
        [filePath]: {
          name: trimmedName,
          path: filePath,
          type: 'file',
          parent: normalizedParentPath,
          content,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          size: content.length,
        },
      },
    };

    return updateParentChildren(nextState, normalizedParentPath, (children) => addChildName(children, trimmedName));
  },

  updateFileContent: (state, filePath, content) => {
    const normalizedPath = normalizePath(filePath);
    const file = state.files[normalizedPath];
    if (!file) return state;

    return {
      ...state,
      files: {
        ...state.files,
        [normalizedPath]: {
          ...file,
          content,
          size: content.length,
          modifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  },

  deleteItem: (state, itemPath) => {
    const normalizedPath = itemPath === 'C:\\' ? 'C:\\' : normalizePath(itemPath);

    if (state.files[normalizedPath]) {
      const file = state.files[normalizedPath];
      const nextFiles = Object.fromEntries(
        Object.entries(state.files).filter(([path]) => path !== normalizedPath)
      );

      return updateParentChildren(
        {
          ...state,
          files: nextFiles,
        },
        file.parent,
        (children) => removeChildName(children, file.name)
      );
    }

    if (state.folders[normalizedPath]) {
      return deleteFolderRecursive(state, normalizedPath);
    }

    return state;
  },

  renameItem: (state, itemPath, newName) => {
    const normalizedPath = itemPath === 'C:\\' ? 'C:\\' : normalizePath(itemPath);
    const trimmedName = newName.trim();
    if (!trimmedName) return state;

    if (state.files[normalizedPath]) {
      const file = state.files[normalizedPath];
      const newPath = joinPath(file.parent, trimmedName);
      if (hasItem(state, newPath)) return state;

      const nextFiles = {
        ...state.files,
        [newPath]: {
          ...file,
          name: trimmedName,
          path: newPath,
          updatedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
      };
      delete nextFiles[normalizedPath];

      return updateParentChildren(
        {
          ...state,
          files: nextFiles,
        },
        file.parent,
        (children) => children.map((child) => (child === file.name ? trimmedName : child))
      );
    }

    if (state.folders[normalizedPath]) {
      return renameFolderTree(state, normalizedPath, trimmedName);
    }

    return state;
  },

  moveItem: (state, itemPath, targetParentPath) => {
    const normalizedPath = itemPath === 'C:\\' ? 'C:\\' : normalizePath(itemPath);
    const normalizedTargetParentPath =
      targetParentPath === 'C:\\' ? 'C:\\' : normalizePath(targetParentPath);

    if (!state.folders[normalizedTargetParentPath]) {
      return state;
    }

    if (state.files[normalizedPath]) {
      const file = state.files[normalizedPath];
      const nextPath = joinPath(normalizedTargetParentPath, file.name);

      if (file.parent === normalizedTargetParentPath || hasItem(state, nextPath)) {
        return state;
      }

      const nextFiles = {
        ...state.files,
        [nextPath]: {
          ...file,
          path: nextPath,
          parent: normalizedTargetParentPath,
          updatedAt: new Date().toISOString(),
        },
      };
      delete nextFiles[normalizedPath];

      let nextState = {
        ...state,
        files: nextFiles,
      };
      nextState = updateParentChildren(nextState, file.parent, (children) => removeChildName(children, file.name));
      nextState = updateParentChildren(nextState, normalizedTargetParentPath, (children) => addChildName(children, file.name));
      return nextState;
    }

    if (state.folders[normalizedPath]) {
      return moveFolderTree(state, normalizedPath, normalizedTargetParentPath);
    }

    return state;
  },

  copyItem: (state, itemPath, targetParentPath) => {
    const normalizedPath = itemPath === 'C:\\' ? 'C:\\' : normalizePath(itemPath);
    const normalizedTargetParentPath =
      targetParentPath === 'C:\\' ? 'C:\\' : normalizePath(targetParentPath);

    if (!state.folders[normalizedTargetParentPath] || normalizedPath === 'C:\\') {
      return state;
    }

    if (state.files[normalizedPath]) {
      const file = state.files[normalizedPath];
      const duplicatedName = hasItem(state, joinPath(normalizedTargetParentPath, file.name))
        ? `Copy of ${file.name}`
        : file.name;
      const duplicatedPath = joinPath(normalizedTargetParentPath, duplicatedName);

      const nextState = {
        ...state,
        files: {
          ...state.files,
          [duplicatedPath]: {
            ...file,
            name: duplicatedName,
            path: duplicatedPath,
            parent: normalizedTargetParentPath,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      return updateParentChildren(nextState, normalizedTargetParentPath, (children) => addChildName(children, duplicatedName));
    }

    if (state.folders[normalizedPath]) {
      const folder = state.folders[normalizedPath];
      const duplicatedName = hasItem(state, joinPath(normalizedTargetParentPath, folder.name))
        ? `Copy of ${folder.name}`
        : folder.name;
      const clonedTree = cloneFolderRecursive(state, normalizedPath, normalizedTargetParentPath, duplicatedName);

      const nextState = {
        ...state,
        folders: {
          ...state.folders,
          ...clonedTree.folders,
        },
        files: {
          ...state.files,
          ...clonedTree.files,
        },
      };

      return updateParentChildren(nextState, normalizedTargetParentPath, (children) => addChildName(children, duplicatedName));
    }

    return state;
  },

  getDirectoryContents: (state, dirPath) => {
    const normalizedPath = dirPath === 'C:\\' ? 'C:\\' : normalizePath(dirPath);
    const folder = state.folders[normalizedPath];
    if (!folder) return { folders: [], files: [] };

    const folders = (folder.children || [])
      .map((name) => state.folders[joinPath(normalizedPath, name)])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = (folder.children || [])
      .map((name) => state.files[joinPath(normalizedPath, name)])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files };
  },

  getFolderTree: (state) => {
    const buildTree = (path) => {
      const folder = state.folders[path];
      if (!folder) return null;

      return {
        ...folder,
        path,
        folders: (folder.children || [])
          .map((name) => buildTree(joinPath(path, name)))
          .filter(Boolean),
      };
    };

    return buildTree('C:\\');
  },

  getFile: (state, filePath) => state.files[normalizePath(filePath)] || null,

  getFolder: (state, folderPath) => {
    if (folderPath === 'C:\\') return state.folders['C:\\'] || null;
    return state.folders[normalizePath(folderPath)] || null;
  },

  loadFileSystem: (state, newState) => newState || DEFAULT_FILESYSTEM_STATE,
};
