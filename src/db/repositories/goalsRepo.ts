import type { MaterialIcons } from '@expo/vector-icons';

import { getDb } from '@/db/client';
import type { Goal, GoalAccent } from '@/types/goal';
import { uuidv4 } from '@/utils/uuid';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type GoalRow = {
  id: string;
  title: string;
  target: number;
  saved: number;
  icon: string;
  description: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type NewGoalInput = {
  title: string;
  target: number;
  saved: number;
  icon: MaterialIconName;
  description?: string;
};

export type UpdateGoalInput = Partial<NewGoalInput>;

// Accent isn't stored — it cycles by row order so visual variety doesn't depend
// on the user picking a color. Status text is derived from progress for the
// same reason (and so it stays accurate as `saved` changes).
const ACCENT_CYCLE: GoalAccent[] = [
  'primary',
  'tertiary',
  'secondary',
  'secondaryContainer',
];

function deriveAccent(index: number): GoalAccent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length];
}

function deriveStatus(
  pct: number,
): { status: string; statusTone: 'primary' | 'neutral' } {
  if (pct >= 100) return { status: 'Done!', statusTone: 'primary' };
  if (pct >= 80) return { status: 'Almost there', statusTone: 'primary' };
  if (pct >= 50) return { status: 'Halfway', statusTone: 'neutral' };
  if (pct >= 25) return { status: 'Building', statusTone: 'neutral' };
  return { status: 'Just started', statusTone: 'neutral' };
}

function rowToGoal(r: GoalRow, index: number): Goal {
  const pct = r.target > 0 ? (r.saved / r.target) * 100 : 0;
  const { status, statusTone } = deriveStatus(pct);
  return {
    id: r.id,
    title: r.title,
    target: r.target,
    saved: r.saved,
    icon: r.icon as MaterialIconName,
    accent: deriveAccent(index),
    status,
    statusTone,
    ...(r.description ? { description: r.description } : {}),
  };
}

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT * FROM goals
     WHERE deleted_at IS NULL
     ORDER BY created_at ASC`,
  );
  return rows.map(rowToGoal);
}

export async function createGoal(input: NewGoalInput): Promise<Goal> {
  const db = await getDb();
  const id = uuidv4();
  const now = Date.now();
  const description = input.description?.trim() || null;
  await db.runAsync(
    `INSERT INTO goals (id, title, target, saved, icon, description, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [id, input.title, input.target, input.saved, input.icon, description, now, now],
  );
  // Position-based accent will be settled by the next list() call; use 0 here
  // since the returned object is rarely used before reload.
  return rowToGoal(
    {
      id,
      title: input.title,
      target: input.target,
      saved: input.saved,
      icon: input.icon,
      description,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    0,
  );
}

export async function updateGoal(
  id: string,
  patch: UpdateGoalInput,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const setField = (col: string, value: string | number | null) => {
    fields.push(`${col} = ?`);
    params.push(value);
  };

  if (patch.title !== undefined) setField('title', patch.title);
  if (patch.target !== undefined) setField('target', patch.target);
  if (patch.saved !== undefined) setField('saved', patch.saved);
  if (patch.icon !== undefined) setField('icon', patch.icon);
  if (patch.description !== undefined) {
    setField('description', patch.description?.trim() || null);
  }

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  params.push(Date.now());
  params.push(id);

  await db.runAsync(
    `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`,
    params,
  );
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `UPDATE goals SET deleted_at = ?, updated_at = ? WHERE id = ?`,
    [now, now, id],
  );
}
