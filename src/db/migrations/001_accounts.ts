import type { SQLiteDatabase } from 'expo-sqlite';

export const version = 1;

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id            TEXT PRIMARY KEY NOT NULL,
      name          TEXT NOT NULL,
      balance       REAL NOT NULL DEFAULT 0,
      icon          TEXT NOT NULL,
      type          TEXT NOT NULL,
      kind          TEXT NOT NULL CHECK (kind IN ('asset','liability')),
      category      TEXT NOT NULL,
      logo_slug     TEXT,
      note          TEXT,
      currency      TEXT,
      credit_limit  REAL,
      owed          REAL,
      count_in_asset INTEGER,
      hide_balance  INTEGER,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL,
      deleted_at    INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts (deleted_at);
    CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts (category);
  `);
}
