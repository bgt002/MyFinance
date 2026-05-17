import type { MaterialIcons } from '@expo/vector-icons';

import type { LogoSlug } from '@/utils/logoRegistry';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type AccountTypeKey =
  // Debit (assets you spend from + cash savings)
  | 'debit_card'
  | 'cash'
  | 'paypal'
  | 'savings'
  | 'savings_hysa'
  | 'debit_other'
  // Credit (liabilities)
  | 'credit_card'
  | 'credit_other'
  // Investment (assets held for growth)
  | 'stock'
  | 'fund'
  | 'crypto';

export type AccountTypeGroup = 'debit' | 'credit' | 'investment';

export type AccountCategoryKey =
  | 'cash'
  | 'credit'
  | 'investments'
  | 'crypto'
  | 'other';

export type AccountKind = 'asset' | 'liability';

export type AccountTypeDef = {
  key: AccountTypeKey;
  label: string;
  icon: MaterialIconName;
  kind: AccountKind;
  category: AccountCategoryKey;
  group: AccountTypeGroup;
};

export type Account = {
  id: string;
  name: string;
  updatedLabel: string;
  balance: number;
  icon: MaterialIconName;
  type: AccountTypeKey;
  kind: AccountKind;
  category: AccountCategoryKey;
  logoSlug?: LogoSlug;
  note?: string;
  currency?: string;
  creditLimit?: number;
  owed?: number;
  countInAsset?: boolean;
  hideBalance?: boolean;
};

export type AccountCategoryAccent =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral';

export type AccountCategoryDef = {
  key: AccountCategoryKey;
  label: string;
  icon: MaterialIconName;
  accent: AccountCategoryAccent;
};

export type AccountCategory = AccountCategoryDef & { accounts: Account[] };

export type AccountGroupBlock = {
  key: AccountTypeGroup;
  label: string;
  categories: AccountCategory[];
};
