import { useCallback, useState, useSyncExternalStore } from 'react';

import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
  type NewGoalInput,
  type UpdateGoalInput,
} from '@/db/repositories/goalsRepo';
import type { Goal } from '@/types/goal';

let cache: Goal[] = [];
let initialized = false;
let initializing: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

async function loadInto(): Promise<void> {
  cache = await listGoals();
  emit();
}

function ensureInitialized(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initializing) return initializing;
  initializing = (async () => {
    await loadInto();
    initialized = true;
  })();
  return initializing;
}

export async function reloadGoals(): Promise<void> {
  await loadInto();
}

export type UseGoalsResult = {
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  addGoal: (input: NewGoalInput) => Promise<Goal>;
  editGoal: (id: string, patch: UpdateGoalInput) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
};

export function useGoals(): UseGoalsResult {
  const goals = useSyncExternalStore(subscribe, getSnapshot);
  const [loading, setLoading] = useState(!initialized);
  const [error, setError] = useState<Error | null>(null);

  if (!initialized && !initializing) {
    ensureInitialized()
      .then(() => setLoading(false))
      .catch((e) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
  } else if (loading && initialized) {
    setLoading(false);
  }

  const reload = useCallback(async () => {
    try {
      await loadInto();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const addGoal = useCallback(async (input: NewGoalInput) => {
    const created = await createGoal(input);
    await loadInto();
    return created;
  }, []);

  const editGoal = useCallback(
    async (id: string, patch: UpdateGoalInput) => {
      await updateGoal(id, patch);
      await loadInto();
    },
    [],
  );

  const removeGoal = useCallback(async (id: string) => {
    await deleteGoal(id);
    cache = cache.filter((g) => g.id !== id);
    emit();
  }, []);

  return { goals, loading, error, reload, addGoal, editGoal, removeGoal };
}
