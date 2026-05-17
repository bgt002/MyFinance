import { useCallback, useState, useSyncExternalStore } from 'react';

import type { Transaction } from '@/types/transaction';
import {
  createTransaction,
  deleteTransaction,
  deleteTransactionsByCategory,
  listTransactions,
  type NewTransactionInput,
} from '@/db/repositories/transactionsRepo';

import { reloadAccounts } from './useAccounts';

let cache: Transaction[] = [];
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
  cache = await listTransactions();
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

export async function reloadTransactions(): Promise<void> {
  await loadInto();
}

export type UseTransactionsResult = {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  addTransaction: (input: NewTransactionInput) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  removeTransactionsByCategory: (category: string) => Promise<void>;
};

export function useTransactions(): UseTransactionsResult {
  const transactions = useSyncExternalStore(subscribe, getSnapshot);
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

  // Mutations affect account balances too (the repo adjusts them inside the
  // same DB transaction). Reload both stores so every consumer sees consistent
  // numbers.
  const addTransaction = useCallback(async (input: NewTransactionInput) => {
    await createTransaction(input);
    await Promise.all([loadInto(), reloadAccounts()]);
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    await Promise.all([loadInto(), reloadAccounts()]);
  }, []);

  const removeTransactionsByCategoryFn = useCallback(async (category: string) => {
    await deleteTransactionsByCategory(category);
    await Promise.all([loadInto(), reloadAccounts()]);
  }, []);

  return {
    transactions,
    loading,
    error,
    reload,
    addTransaction,
    removeTransaction,
    removeTransactionsByCategory: removeTransactionsByCategoryFn,
  };
}
