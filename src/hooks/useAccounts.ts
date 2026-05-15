import { useCallback, useEffect, useState } from 'react';

import { type Account } from '@/data/dummy';
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
  type NewAccountInput,
  type UpdateAccountInput,
} from '@/db/repositories/accountsRepo';

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    try {
      const next = await listAccounts();
      setAccounts(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await listAccounts();
        if (!cancelled) {
          setAccounts(next);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addAccount = useCallback(async (input: NewAccountInput) => {
    const created = await createAccount(input);
    setAccounts((prev) => [...prev, created]);
    return created;
  }, []);

  const editAccount = useCallback(
    async (id: string, patch: UpdateAccountInput) => {
      await updateAccount(id, patch);
      await reload();
    },
    [reload],
  );

  const removeAccount = useCallback(async (id: string) => {
    await deleteAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { accounts, loading, error, reload, addAccount, editAccount, removeAccount };
}
