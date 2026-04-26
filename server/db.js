import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { seedItems } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let databasePromise;

const schemaSql = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS filesystem_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('file', 'folder')),
    parent_id INTEGER REFERENCES filesystem_items(id) ON DELETE CASCADE,
    content TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

async function seedDatabase(db) {
  const row = await db.get('SELECT COUNT(*) AS count FROM filesystem_items');
  if (row.count > 0) {
    return;
  }

  const pathToId = new Map();
  for (const item of seedItems) {
    const parentId = item.parentPath ? pathToId.get(item.parentPath) ?? null : null;
    const result = await db.run(
      `INSERT INTO filesystem_items (name, type, parent_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [item.name, item.type, parentId, item.content]
    );
    pathToId.set(item.path, result.lastID);
  }
}

export async function getDb() {
  if (!databasePromise) {
    databasePromise = open({
      filename: path.join(__dirname, 'filesystem.sqlite'),
      driver: sqlite3.Database,
    }).then(async (db) => {
      await db.exec(schemaSql);
      await seedDatabase(db);
      return db;
    });
  }

  return databasePromise;
}
