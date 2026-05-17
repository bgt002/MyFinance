import {
  ACCOUNT_CATEGORIES,
  ACCOUNT_TYPES_BY_KEY,
  ACCOUNT_TYPE_GROUPS,
} from '@/constants/accounts';
import type {
  Account,
  AccountCategory,
  AccountGroupBlock,
} from '@/types/account';

export function groupAccountsByCategory(accounts: Account[]): AccountCategory[] {
  return ACCOUNT_CATEGORIES.map((cat) => ({
    ...cat,
    accounts: accounts.filter((a) => a.category === cat.key),
  })).filter((cat) => cat.accounts.length > 0);
}

/**
 * Groups accounts into the three top-level type groups (Debit / Credit /
 * Investment), with each group further organized by category. Empty groups
 * and empty categories are filtered out.
 */
export function groupAccountsByTypeGroup(
  accounts: Account[],
): AccountGroupBlock[] {
  return ACCOUNT_TYPE_GROUPS.map((g) => {
    const inGroup = accounts.filter(
      (a) => ACCOUNT_TYPES_BY_KEY[a.type]?.group === g.key,
    );
    const categories = ACCOUNT_CATEGORIES.map((cat) => ({
      ...cat,
      accounts: inGroup.filter((a) => a.category === cat.key),
    })).filter((cat) => cat.accounts.length > 0);
    return { key: g.key, label: g.label, categories };
  }).filter((block) => block.categories.length > 0);
}

export function computeAccountsTotal(accounts: Account[]): number {
  return accounts.reduce(
    (sum, a) => sum + (a.kind === 'asset' ? a.balance : -a.balance),
    0,
  );
}

export function computeAccountsBreakdown(accounts: Account[]): {
  assets: number;
  liabilities: number;
} {
  return accounts.reduce(
    (acc, a) => {
      if (a.kind === 'asset') acc.assets += a.balance;
      else acc.liabilities += a.balance;
      return acc;
    },
    { assets: 0, liabilities: 0 },
  );
}
