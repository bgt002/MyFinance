import type { MaterialIcons } from '@expo/vector-icons';

import { getDb } from '@/db/client';
import type { Transaction } from '@/types/transaction';
import { formatWhenLabel, type DateKey } from '@/utils/dateKey';
import { uuidv4 } from '@/utils/uuid';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type TransactionRow = {
  id: string;
  amount: number;
  category: string;
  account_id: string | null;
  date: string;
  icon: string;
  description: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type Allocation = {
  accountId: string | null;
  amount: number;
};

export type NewTransactionInput = {
  kind: 'spend' | 'gain';
  category: string;
  icon: MaterialIconName;
  date: DateKey;
  allocations: Allocation[];
  description?: string;
};

function rowToTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    merchant: r.description ?? r.category,
    category: r.category,
    whenLabel: formatWhenLabel(r.date),
    date: r.date,
    amount: r.amount,
    icon: r.icon as MaterialIconName,
    source: 'manual',
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM transactions
     WHERE deleted_at IS NULL
     ORDER BY date DESC, created_at DESC`,
  );
  return rows.map(rowToTransaction);
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? rowToTransaction(row) : null;
}

// Balance accounting: every transaction with a non-null account_id moves the
// linked account's balance by its signed amount. Deletes reverse it. All paths
// run inside withTransactionAsync so the row + balance stay consistent even if
// something throws halfway through.

export async function createTransaction(
  input: NewTransactionInput,
): Promise<void> {
  const db = await getDb();
  const sign = input.kind === 'spend' ? -1 : 1;
  const now = Date.now();
  const description = input.description?.trim() || null;

  await db.withTransactionAsync(async () => {
    for (const alloc of input.allocations) {
      const signedAmount = sign * alloc.amount;
      await db.runAsync(
        `INSERT INTO transactions (
          id, amount, category, account_id, date, icon, description,
          created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
          uuidv4(),
          signedAmount,
          input.category,
          alloc.accountId,
          input.date,
          input.icon,
          description,
          now,
          now,
        ],
      );
      if (alloc.accountId !== null) {
        await db.runAsync(
          `UPDATE accounts
           SET balance = balance + ?, updated_at = ?
           WHERE id = ? AND deleted_at IS NULL`,
          [signedAmount, now, alloc.accountId],
        );
      }
    }
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const row = await db.getFirstAsync<{
    amount: number;
    account_id: string | null;
  }>(
    `SELECT amount, account_id FROM transactions
     WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  if (!row) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, id],
    );
    if (row.account_id !== null) {
      await db.runAsync(
        `UPDATE accounts
         SET balance = balance - ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [row.amount, now, row.account_id],
      );
    }
  });
}

export async function deleteTransactionsByCategory(
  category: string,
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const rows = await db.getAllAsync<{
    amount: number;
    account_id: string | null;
  }>(
    `SELECT amount, account_id FROM transactions
     WHERE category = ? AND deleted_at IS NULL`,
    [category],
  );
  if (rows.length === 0) return;

  // Aggregate per-account deltas so we issue one UPDATE per affected account
  // instead of one per matching row.
  const perAccount = new Map<string, number>();
  for (const r of rows) {
    if (r.account_id === null) continue;
    perAccount.set(r.account_id, (perAccount.get(r.account_id) ?? 0) + r.amount);
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE transactions
       SET deleted_at = ?, updated_at = ?
       WHERE category = ? AND deleted_at IS NULL`,
      [now, now, category],
    );
    for (const [accountId, totalSigned] of perAccount) {
      await db.runAsync(
        `UPDATE accounts
         SET balance = balance - ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [totalSigned, now, accountId],
      );
    }
  });
}
