import { getDb } from '../db.js';

const ROOT_NAME = 'C:\\';
const getParentPath = (itemPath) => {
  if (itemPath === ROOT_NAME) return ROOT_NAME;
  const lastSeparator = itemPath.lastIndexOf('\\');
  return lastSeparator <= 2 ? ROOT_NAME : itemPath.slice(0, lastSeparator);
};

const buildPathMap = (rows) => {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const pathById = new Map();

  const resolvePath = (rowId) => {
    if (pathById.has(rowId)) {
      return pathById.get(rowId);
    }

    const row = byId.get(rowId);
    if (!row) {
      return null;
    }

    const parentPath = row.parent_id ? resolvePath(row.parent_id) : null;
    const currentPath = parentPath
      ? parentPath === ROOT_NAME
        ? `${ROOT_NAME}${row.name}`
        : `${parentPath}\\${row.name}`
      : ROOT_NAME;

    pathById.set(rowId, currentPath);
    return currentPath;
  };

  rows.forEach((row) => resolvePath(row.id));
  return pathById;
};

const createStateFromRows = (rows) => {
  const pathById = buildPathMap(rows);
  const folders = {};
  const files = {};

  for (const row of rows) {
    const itemPath = pathById.get(row.id);
    const parentPath = row.parent_id ? pathById.get(row.parent_id) : null;

    if (row.type === 'folder') {
      folders[itemPath] = {
        name: itemPath === ROOT_NAME ? ROOT_NAME : row.name,
        parent: parentPath,
        type: row.parent_id ? 'folder' : 'drive',
        children: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } else {
      files[itemPath] = {
        name: row.name,
        path: itemPath,
        type: 'file',
        parent: parentPath,
        content: row.content ?? '',
        createdAt: row.created_at,
        modifiedAt: row.updated_at,
        updatedAt: row.updated_at,
        size: (row.content ?? '').length,
      };
    }
  }

  Object.entries(folders).forEach(([folderPath, folder]) => {
    if (folder.parent && folders[folder.parent]) {
      folders[folder.parent].children.push(folderPath.split('\\').pop());
    }
  });

  Object.values(files).forEach((file) => {
    if (file.parent && folders[file.parent]) {
      folders[file.parent].children.push(file.name);
    }
  });

  Object.values(folders).forEach((folder) => folder.children.sort((a, b) => a.localeCompare(b)));
  return { folders, files };
};

async function getAllRows(db) {
  return db.all(
    `SELECT id, name, type, parent_id, content, created_at, updated_at
     FROM filesystem_items
     ORDER BY COALESCE(parent_id, 0), type DESC, name ASC`
  );
}

async function getRowsWithState() {
  const db = await getDb();
  const rows = await getAllRows(db);
  const state = createStateFromRows(rows);
  return { db, rows, state };
}

function findIdByPath(rows, targetPath) {
  const pathById = buildPathMap(rows);
  for (const [id, itemPath] of pathById.entries()) {
    if (itemPath === targetPath) {
      return id;
    }
  }
  return null;
}

function pathExists(rows, targetPath) {
  return Boolean(findIdByPath(rows, targetPath));
}

function getPathById(rows, itemId) {
  const pathById = buildPathMap(rows);
  return pathById.get(itemId) ?? null;
}

async function getItemIdOrThrow(rows, itemPath) {
  const itemId = findIdByPath(rows, itemPath);
  if (!itemId) {
    throw new Error(`Item not found: ${itemPath}`);
  }
  return itemId;
}

async function insertSubtree(db, sourceRows, sourceId, targetParentId, nameOverride = null) {
  const rowMap = new Map(sourceRows.map((row) => [row.id, row]));
  const childrenByParent = new Map();

  sourceRows.forEach((row) => {
    const parentId = row.parent_id ?? null;
    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }
    childrenByParent.get(parentId).push(row);
  });

  const copyRecursive = async (currentId, parentIdOverride = null, currentNameOverride = null) => {
    const row = rowMap.get(currentId);
    const inserted = await db.run(
      `INSERT INTO filesystem_items (name, type, parent_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [currentNameOverride ?? row.name, row.type, parentIdOverride, row.content]
    );

    const children = childrenByParent.get(currentId) ?? [];
    for (const child of children) {
      await copyRecursive(child.id, inserted.lastID, null);
    }
  };

  await copyRecursive(sourceId, targetParentId, nameOverride);
}

export async function getFilesystemState() {
  const { state } = await getRowsWithState();
  return state;
}

export async function getDirectoryContents(dirPath) {
  const state = await getFilesystemState();
  const folder = state.folders[dirPath];
  if (!folder) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  return {
    folders: folder.children
      .map((name) => state.folders[dirPath === ROOT_NAME ? `${ROOT_NAME}${name}` : `${dirPath}\\${name}`])
      .filter(Boolean),
    files: folder.children
      .map((name) => state.files[dirPath === ROOT_NAME ? `${ROOT_NAME}${name}` : `${dirPath}\\${name}`])
      .filter(Boolean),
  };
}

export async function createItem({ parentPath, name, type, content = '' }) {
  const { db, rows } = await getRowsWithState();
  const parentId = await getItemIdOrThrow(rows, parentPath);
  const nextPath = parentPath === ROOT_NAME ? `${ROOT_NAME}${name}` : `${parentPath}\\${name}`;

  if (pathExists(rows, nextPath)) {
    throw new Error(`Item already exists: ${nextPath}`);
  }

  await db.run(
    `INSERT INTO filesystem_items (name, type, parent_id, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [name, type, parentId, type === 'file' ? content : null]
  );
  return getFilesystemState();
}

export async function renameItem({ itemPath, newName }) {
  const { db, rows } = await getRowsWithState();
  const itemId = await getItemIdOrThrow(rows, itemPath);
  if (itemPath === ROOT_NAME) {
    throw new Error('Root folder cannot be renamed');
  }

  const parentPath = getParentPath(itemPath);
  const nextPath = parentPath === ROOT_NAME ? `${ROOT_NAME}${newName}` : `${parentPath}\\${newName}`;
  if (nextPath === itemPath) {
    return getFilesystemState();
  }
  if (pathExists(rows, nextPath)) {
    throw new Error(`Item already exists: ${nextPath}`);
  }

  await db.run(
    `UPDATE filesystem_items
     SET name = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [newName, itemId]
  );
  return getFilesystemState();
}

export async function moveItem({ itemPath, targetParentPath }) {
  const { db, rows } = await getRowsWithState();
  const itemId = await getItemIdOrThrow(rows, itemPath);
  const targetParentId = await getItemIdOrThrow(rows, targetParentPath);
  const sourcePath = getPathById(rows, itemId);
  const targetPath = getPathById(rows, targetParentId);
  const currentName = sourcePath.split('\\').pop();
  const nextPath = targetPath === ROOT_NAME ? `${ROOT_NAME}${currentName}` : `${targetPath}\\${currentName}`;

  if (sourcePath === ROOT_NAME) {
    throw new Error('Root folder cannot be moved');
  }
  if (nextPath === sourcePath) {
    return getFilesystemState();
  }
  if (targetPath.startsWith(`${sourcePath}\\`)) {
    throw new Error('Folder cannot be moved into its own child');
  }
  if (pathExists(rows, nextPath)) {
    throw new Error(`Item already exists: ${nextPath}`);
  }

  await db.run(
    `UPDATE filesystem_items
     SET parent_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [targetParentId, itemId]
  );
  return getFilesystemState();
}

export async function copyItem({ itemPath, targetParentPath }) {
  const { db, rows } = await getRowsWithState();
  const itemId = await getItemIdOrThrow(rows, itemPath);
  const targetParentId = await getItemIdOrThrow(rows, targetParentPath);
  if (itemPath === ROOT_NAME) {
    throw new Error('Root folder cannot be copied');
  }
  const sourceRows = await db.all(
    `WITH RECURSIVE descendants AS (
       SELECT id, name, type, parent_id, content, created_at, updated_at
       FROM filesystem_items WHERE id = ?
       UNION ALL
       SELECT child.id, child.name, child.type, child.parent_id, child.content, child.created_at, child.updated_at
       FROM filesystem_items child
       INNER JOIN descendants parent ON child.parent_id = parent.id
     )
     SELECT * FROM descendants`,
    [itemId]
  );
  const sourceRoot = sourceRows.find((row) => row.id === itemId);
  await insertSubtree(db, sourceRows, itemId, targetParentId, `Copy of ${sourceRoot.name}`);
  return getFilesystemState();
}

export async function deleteItem(itemPath) {
  const { db, rows } = await getRowsWithState();
  const itemId = await getItemIdOrThrow(rows, itemPath);
  if (itemPath === ROOT_NAME) {
    throw new Error('Root folder cannot be deleted');
  }
  await db.run(`DELETE FROM filesystem_items WHERE id = ?`, [itemId]);
  return getFilesystemState();
}

export async function updateFileContent({ filePath, content }) {
  const { db, rows } = await getRowsWithState();
  const fileId = await getItemIdOrThrow(rows, filePath);
  await db.run(
    `UPDATE filesystem_items
     SET content = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [content, fileId]
  );
  return getFilesystemState();
}
