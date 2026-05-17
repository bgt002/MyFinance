import type {
  AccountCategoryDef,
  AccountTypeDef,
  AccountTypeGroup,
  AccountTypeKey,
} from '@/types/account';

export const ACCOUNT_TYPES: AccountTypeDef[] = [
  // Debit
  { key: 'debit_card',   label: 'Debit Cards',  icon: 'credit-card',             kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'cash',         label: 'Cash',         icon: 'payments',                kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'paypal',       label: 'PayPal',       icon: 'account-balance-wallet',  kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'savings',      label: 'Savings',      icon: 'savings',                 kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'savings_hysa', label: 'High-Yield Savings', icon: 'trending-up',       kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'debit_other',  label: 'Other',        icon: 'more-horiz',              kind: 'asset',     category: 'other',       group: 'debit' },
  // Credit
  { key: 'credit_card',  label: 'Credit Cards', icon: 'credit-card',             kind: 'liability', category: 'credit',      group: 'credit' },
  { key: 'credit_other', label: 'Other',        icon: 'more-horiz',              kind: 'liability', category: 'credit',      group: 'credit' },
  // Investment
  { key: 'stock',        label: 'Stock',        icon: 'trending-up',             kind: 'asset',     category: 'investments', group: 'investment' },
  { key: 'fund',         label: 'Fund',         icon: 'pie-chart',               kind: 'asset',     category: 'investments', group: 'investment' },
  { key: 'crypto',       label: 'Crypto',       icon: 'currency-bitcoin',        kind: 'asset',     category: 'crypto',      group: 'investment' },
];

export const ACCOUNT_TYPE_GROUPS: { key: AccountTypeGroup; label: string }[] = [
  { key: 'debit', label: 'Debit' },
  { key: 'credit', label: 'Credit' },
  { key: 'investment', label: 'Investment' },
];

export const ACCOUNT_TYPES_BY_KEY: Record<AccountTypeKey, AccountTypeDef> =
  ACCOUNT_TYPES.reduce(
    (acc, t) => {
      acc[t.key] = t;
      return acc;
    },
    {} as Record<AccountTypeKey, AccountTypeDef>,
  );

export const ACCOUNT_CATEGORIES: AccountCategoryDef[] = [
  { key: 'cash', label: 'Cash', icon: 'payments', accent: 'primary' },
  { key: 'investments', label: 'Investments', icon: 'query-stats', accent: 'secondary' },
  { key: 'crypto', label: 'Crypto', icon: 'currency-bitcoin', accent: 'tertiary' },
  { key: 'credit', label: 'Credit', icon: 'credit-card', accent: 'neutral' },
  { key: 'other', label: 'Other', icon: 'more-horiz', accent: 'neutral' },
];
