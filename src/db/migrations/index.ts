import type { SQLiteDatabase } from 'expo-sqlite';

import * as m001 from './001_accounts';
import * as m002 from './002_transactions';
import * as m003 from './003_goals';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [m001, m002, m003];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  const current = row?.user_version ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > current).sort(
    (a, b) => a.version - b.version,
  );
  if (pending.length === 0) return;

  for (const m of pending) {
    await db.withTransactionAsync(async () => {
      await m.up(db);
    });
    await db.execAsync(`PRAGMA user_version = ${m.version};`);
  }
}
