import type { MaterialIcons } from '@expo/vector-icons';

import { getDb } from '@/db/client';
import type {
  Account,
  AccountCategoryKey,
  AccountKind,
  AccountTypeKey,
} from '@/types/account';
import type { LogoSlug } from '@/utils/logoRegistry';
import { formatRelativeUpdated } from '@/utils/relativeTime';
import { uuidv4 } from '@/utils/uuid';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type AccountRow = {
  id: string;
  name: string;
  balance: number;
  icon: string;
  type: string;
  kind: string;
  category: string;
  logo_slug: string | null;
  note: string | null;
  currency: string | null;
  credit_limit: number | null;
  owed: number | null;
  count_in_asset: number | null;
  hide_balance: number | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type NewAccountInput = Omit<Account, 'id' | 'updatedLabel'>;
export type UpdateAccountInput = Partial<NewAccountInput>;

function rowToAccount(r: AccountRow): Account {
  return {
    id: r.id,
    name: r.name,
    balance: r.balance,
    icon: r.icon as MaterialIconName,
    type: r.type as AccountTypeKey,
    kind: r.kind as AccountKind,
    category: r.category as AccountCategoryKey,
    updatedLabel: formatRelativeUpdated(r.updated_at),
    ...(r.logo_slug ? { logoSlug: r.logo_slug as LogoSlug } : {}),
    ...(r.note ? { note: r.note } : {}),
    ...(r.currency ? { currency: r.currency } : {}),
    ...(r.credit_limit !== null ? { creditLimit: r.credit_limit } : {}),
    ...(r.owed !== null ? { owed: r.owed } : {}),
    ...(r.count_in_asset !== null
      ? { countInAsset: r.count_in_asset === 1 }
      : {}),
    ...(r.hide_balance !== null
      ? { hideBalance: r.hide_balance === 1 }
      : {}),
  };
}

export async function listAccounts(): Promise<Account[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AccountRow>(
    `SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY created_at ASC`,
  );
  return rows.map(rowToAccount);
}

export async function getAccount(id: string): Promise<Account | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<AccountRow>(
    `SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? rowToAccount(row) : null;
}

export async function createAccount(input: NewAccountInput): Promise<Account> {
  const db = await getDb();
  const id = uuidv4();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO accounts (
      id, name, balance, icon, type, kind, category,
      logo_slug, note, currency, credit_limit, owed,
      count_in_asset, hide_balance,
      created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      id,
      input.name,
      input.balance,
      input.icon,
      input.type,
      input.kind,
      input.category,
      input.logoSlug ?? null,
      input.note ?? null,
      input.currency ?? null,
      input.creditLimit ?? null,
      input.owed ?? null,
      input.countInAsset === undefined ? null : input.countInAsset ? 1 : 0,
      input.hideBalance === undefined ? null : input.hideBalance ? 1 : 0,
      now,
      now,
    ],
  );
  return {
    ...input,
    id,
    updatedLabel: formatRelativeUpdated(now, now),
  };
}

export async function updateAccount(
  id: string,
  patch: UpdateAccountInput,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const setField = (col: string, value: string | number | null) => {
    fields.push(`${col} = ?`);
    params.push(value);
  };

  if (patch.name !== undefined) setField('name', patch.name);
  if (patch.balance !== undefined) setField('balance', patch.balance);
  if (patch.icon !== undefined) setField('icon', patch.icon);
  if (patch.type !== undefined) setField('type', patch.type);
  if (patch.kind !== undefined) setField('kind', patch.kind);
  if (patch.category !== undefined) setField('category', patch.category);
  if (patch.logoSlug !== undefined) setField('logo_slug', patch.logoSlug ?? null);
  if (patch.note !== undefined) setField('note', patch.note ?? null);
  if (patch.currency !== undefined) setField('currency', patch.currency ?? null);
  if (patch.creditLimit !== undefined)
    setField('credit_limit', patch.creditLimit ?? null);
  if (patch.owed !== undefined) setField('owed', patch.owed ?? null);
  if (patch.countInAsset !== undefined)
    setField('count_in_asset', patch.countInAsset ? 1 : 0);
  if (patch.hideBalance !== undefined)
    setField('hide_balance', patch.hideBalance ? 1 : 0);

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  params.push(Date.now());
  params.push(id);

  await db.runAsync(
    `UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`,
    params,
  );
}

export async function deleteAccount(id: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `UPDATE accounts SET deleted_at = ?, updated_at = ? WHERE id = ?`,
    [now, now, id],
  );
}
