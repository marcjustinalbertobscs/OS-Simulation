import {
  copyItem,
  createItem,
  deleteItem,
  getDirectoryContents,
  getFilesystemState,
  moveItem,
  renameItem,
  updateFileContent,
} from '../services/fileSystemService.js';

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ success: false, error: error.message });

export async function fetchFilesystemState(req, res) {
  try {
    ok(res, await getFilesystemState());
  } catch (error) {
    fail(res, error, 500);
  }
}

export async function fetchDirectory(req, res) {
  try {
    ok(res, await getDirectoryContents(req.query.path));
  } catch (error) {
    fail(res, error, 404);
  }
}

export async function createFilesystemItem(req, res) {
  try {
    ok(res, await createItem(req.body));
  } catch (error) {
    fail(res, error);
  }
}

export async function renameFilesystemItem(req, res) {
  try {
    ok(res, await renameItem(req.body));
  } catch (error) {
    fail(res, error);
  }
}

export async function moveFilesystemItem(req, res) {
  try {
    ok(res, await moveItem(req.body));
  } catch (error) {
    fail(res, error);
  }
}

export async function copyFilesystemItem(req, res) {
  try {
    ok(res, await copyItem(req.body));
  } catch (error) {
    fail(res, error);
  }
}

export async function deleteFilesystemItem(req, res) {
  try {
    ok(res, await deleteItem(req.query.path));
  } catch (error) {
    fail(res, error);
  }
}

export async function saveFileContent(req, res) {
  try {
    ok(res, await updateFileContent(req.body));
  } catch (error) {
    fail(res, error);
  }
}
