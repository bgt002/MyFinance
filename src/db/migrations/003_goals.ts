import type { SQLiteDatabase } from 'expo-sqlite';

export const version = 3;

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id           TEXT PRIMARY KEY NOT NULL,
      title        TEXT NOT NULL,
      target       REAL NOT NULL DEFAULT 0,
      saved        REAL NOT NULL DEFAULT 0,
      icon         TEXT NOT NULL,
      description  TEXT,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL,
      deleted_at   INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_goals_deleted_at ON goals (deleted_at);
  `);
}
