import type { SQLiteDatabase } from 'expo-sqlite';

export const version = 2;

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id           TEXT PRIMARY KEY NOT NULL,
      amount       REAL NOT NULL,
      category     TEXT NOT NULL,
      account_id   TEXT,
      date         TEXT NOT NULL,
      icon         TEXT NOT NULL,
      description  TEXT,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL,
      deleted_at   INTEGER,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions (account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions (deleted_at);
  `);
}
