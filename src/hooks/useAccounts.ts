import { useCallback, useState, useSyncExternalStore } from 'react';

import type { Account } from '@/types/account';
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
  type NewAccountInput,
  type UpdateAccountInput,
} from '@/db/repositories/accountsRepo';

// Module-level cache shared across every useAccounts() consumer in the app.
// Without this, AccountsSection and LogSection would each hold their own copy
// and changes in one wouldn't propagate to the other.

let cache: Account[] = [];
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
  cache = await listAccounts();
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

export async function reloadAccounts(): Promise<void> {
  await loadInto();
}

export type UseAccountsResult = {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  addAccount: (input: NewAccountInput) => Promise<Account>;
  editAccount: (id: string, patch: UpdateAccountInput) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
};

export function useAccounts(): UseAccountsResult {
  const accounts = useSyncExternalStore(subscribe, getSnapshot);
  const [loading, setLoading] = useState(!initialized);
  const [error, setError] = useState<Error | null>(null);

  // Kick off init on first mount of the first consumer.
  if (!initialized && !initializing) {
    ensureInitialized()
      .then(() => setLoading(false))
      .catch((e) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
  } else if (loading && initialized) {
    // Late mount after init finished — clear our local loading.
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

  const addAccount = useCallback(async (input: NewAccountInput) => {
    const created = await createAccount(input);
    cache = [...cache, created];
    emit();
    return created;
  }, []);

  const editAccount = useCallback(
    async (id: string, patch: UpdateAccountInput) => {
      await updateAccount(id, patch);
      await loadInto();
    },
    [],
  );

  const removeAccount = useCallback(async (id: string) => {
    await deleteAccount(id);
    cache = cache.filter((a) => a.id !== id);
    emit();
  }, []);

  return {
    accounts,
    loading,
    error,
    reload,
    addAccount,
    editAccount,
    removeAccount,
  };
}
