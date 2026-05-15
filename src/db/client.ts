import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from './migrations';

const DB_NAME = 'myfinances.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await openDatabaseAsync(DB_NAME);
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}
