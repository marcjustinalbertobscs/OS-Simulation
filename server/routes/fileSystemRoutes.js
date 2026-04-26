import { Router } from 'express';
import {
  copyFilesystemItem,
  createFilesystemItem,
  deleteFilesystemItem,
  fetchDirectory,
  fetchFilesystemState,
  moveFilesystemItem,
  renameFilesystemItem,
  saveFileContent,
} from '../controllers/fileSystemController.js';

const router = Router();

router.get('/filesystem/state', fetchFilesystemState);
router.get('/filesystem/directory', fetchDirectory);
router.post('/filesystem/items', createFilesystemItem);
router.patch('/filesystem/items/rename', renameFilesystemItem);
router.patch('/filesystem/items/move', moveFilesystemItem);
router.post('/filesystem/items/copy', copyFilesystemItem);
router.delete('/filesystem/items', deleteFilesystemItem);
router.patch('/filesystem/files/content', saveFileContent);

export default router;
