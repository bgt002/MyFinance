import { MaterialIcons } from '@expo/vector-icons';

import type { LogoSlug } from '@/utils/logoRegistry';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export const dashboardSummary = {
  netWorth: 248590,
  trendPct: 4.2,
  trendDirection: 'up' as const,
  income: 12400,
  expenses: 5280,
  netWorthSparkline: [40, 55, 45, 70, 60, 85, 100],
};

export const spendingAnalysis = {
  total: 5200,
  breakdown: [
    { label: 'Housing', pct: 45, colorKey: 'primary' as const },
    { label: 'Lifestyle', pct: 30, colorKey: 'secondary' as const },
    { label: 'Other', pct: 25, colorKey: 'surfaceContainerHighest' as const },
  ],
};

export const savingsProgress = {
  overallPct: 82,
  goals: [
    { name: 'Europe Summer Trip', saved: 8200, target: 10000 },
  ],
  goalIcons: ['flight', 'savings'] as MaterialIconName[],
};

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  whenLabel: string;
  date: string; // ISO 'YYYY-MM-DD'
  amount: number;
  icon: MaterialIconName;
  source: 'manual' | 'automatic';
};

export const monthlyPerformance = {
  status: 'STABLE' as const,
  savingsRatePct: 32.4,
  savingsRateDeltaPct: 2.1,
  efficiencyScore: 88,
  efficiencyScoreMax: 100,
  efficiencyDelta: 5,
  expensesVsPrevPct: 78,
  expensesDeltaDollars: -1240,
};

export const netWorthProgression = {
  ranges: ['6M', '1Y', 'ALL'] as const,
  activeRange: '6M' as const,
  monthLabels: ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'] as const,
  activeMonthIndex: 4,
  // SVG path in viewBox 0 0 400 150 (matches the HTML mockup)
  pathD: 'M0,130 C50,120 80,140 120,90 S200,40 280,60 S350,10 400,20',
  markers: [
    { x: 120, y: 90, label: '$242,500', isActive: true },
    { x: 280, y: 60 },
  ] as { x: number; y: number; label?: string; isActive?: boolean }[],
  viewBox: { width: 400, height: 150 },
};

export type SpendingCategory = {
  id: string;
  label: string;
  amount: number;
  fillPct: number;
  icon: MaterialIconName;
  accent: 'primary' | 'secondary' | 'tertiary';
};

export const topSpendingCategories: SpendingCategory[] = [
  {
    id: 'dining',
    label: 'Dining & Leisure',
    amount: 842,
    fillPct: 65,
    icon: 'restaurant',
    accent: 'primary',
  },
  {
    id: 'housing',
    label: 'Housing & Utilities',
    amount: 2100,
    fillPct: 90,
    icon: 'home',
    accent: 'secondary',
  },
  {
    id: 'transport',
    label: 'Transport',
    amount: 320,
    fillPct: 25,
    icon: 'directions-car',
    accent: 'tertiary',
  },
];

export type AccountTypeKey =
  // Debit (assets you spend from)
  | 'debit_card'
  | 'cash'
  | 'paypal'
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

export const ACCOUNT_TYPES: AccountTypeDef[] = [
  // Debit
  { key: 'debit_card',   label: 'Debit Cards',  icon: 'credit-card',             kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'cash',         label: 'Cash',         icon: 'payments',                kind: 'asset',     category: 'cash',        group: 'debit' },
  { key: 'paypal',       label: 'PayPal',       icon: 'account-balance-wallet',  kind: 'asset',     category: 'cash',        group: 'debit' },
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

export type Account = {
  id: string;
  name: string;
  updatedLabel: string;
  balance: number;
  icon: MaterialIconName;
  type: AccountTypeKey;
  kind: AccountKind;
  category: AccountCategoryKey;
  // Optional fields added when an account is created via the Add Account flow.
  logoSlug?: LogoSlug;
  note?: string;
  currency?: string;       // ISO code, defaults to 'USD' when omitted
  creditLimit?: number;    // credit card / loan only
  owed?: number;           // credit card / loan only (effectively the balance)
  countInAsset?: boolean;  // defaults to true when omitted
  hideBalance?: boolean;   // defaults to false when omitted
};

export type AccountCategoryAccent = 'primary' | 'secondary' | 'tertiary' | 'neutral';

export type AccountCategoryDef = {
  key: AccountCategoryKey;
  label: string;
  icon: MaterialIconName;
  accent: AccountCategoryAccent;
};

export const ACCOUNT_CATEGORIES: AccountCategoryDef[] = [
  { key: 'cash', label: 'Cash', icon: 'payments', accent: 'primary' },
  { key: 'investments', label: 'Investments', icon: 'query-stats', accent: 'secondary' },
  { key: 'crypto', label: 'Crypto', icon: 'currency-bitcoin', accent: 'tertiary' },
  { key: 'credit', label: 'Credit', icon: 'credit-card', accent: 'neutral' },
  { key: 'other', label: 'Other', icon: 'more-horiz', accent: 'neutral' },
];

export type AccountCategory = AccountCategoryDef & { accounts: Account[] };

export const initialAccounts: Account[] = [
  {
    id: 'acct-debit',
    name: 'Main Checking',
    updatedLabel: 'Updated 2h ago',
    balance: 12450,
    icon: 'credit-card',
    type: 'debit_card',
    kind: 'asset',
    category: 'cash',
  },
  {
    id: 'acct-emergency',
    name: 'Emergency Fund',
    updatedLabel: 'Updated 1d ago',
    balance: 45000,
    icon: 'more-horiz',
    type: 'debit_other',
    kind: 'asset',
    category: 'other',
  },
  {
    id: 'acct-vanguard',
    name: 'Vanguard Index',
    updatedLabel: 'Updated 5m ago',
    balance: 420140,
    icon: 'pie-chart',
    type: 'fund',
    kind: 'asset',
    category: 'investments',
  },
  {
    id: 'acct-cold-wallet',
    name: 'Cold Wallet',
    updatedLabel: 'Updated 4d ago',
    balance: 85000,
    icon: 'currency-bitcoin',
    type: 'crypto',
    kind: 'asset',
    category: 'crypto',
  },
];

export function groupAccountsByCategory(accounts: Account[]): AccountCategory[] {
  return ACCOUNT_CATEGORIES.map((cat) => ({
    ...cat,
    accounts: accounts.filter((a) => a.category === cat.key),
  })).filter((cat) => cat.accounts.length > 0);
}

export type AccountGroupBlock = {
  key: AccountTypeGroup;
  label: string;
  categories: AccountCategory[];
};

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

export const accountsTotalDeltaPct = 2.4;

export type LogCategoryAccent = 'primary' | 'secondary' | 'tertiary' | 'neutral';

export type LogCategory = {
  id: string;
  label: string;
  icon: MaterialIconName;
  accent: LogCategoryAccent;
};

export const logCategories: LogCategory[] = [
  { id: 'food', label: 'Food', icon: 'restaurant', accent: 'primary' },
  { id: 'rent', label: 'Rent', icon: 'home', accent: 'secondary' },
  { id: 'salary', label: 'Salary', icon: 'payments', accent: 'tertiary' },
  { id: 'transport', label: 'Transport', icon: 'directions-car', accent: 'neutral' },
  { id: 'shop', label: 'Shop', icon: 'shopping-bag', accent: 'neutral' },
  { id: 'health', label: 'Health', icon: 'medical-services', accent: 'neutral' },
  { id: 'fun', label: 'Fun', icon: 'sports-esports', accent: 'neutral' },
  { id: 'other', label: 'Other', icon: 'more-horiz', accent: 'neutral' },
];

export type GoalAccent = 'primary' | 'secondary' | 'secondaryContainer' | 'tertiary';

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  icon: MaterialIconName;
  accent: GoalAccent;
  status: string;
  statusTone: 'primary' | 'neutral';
  variant: 'standard' | 'featured';
  description?: string;
  pillLabel?: string;
};

export const goals: Goal[] = [
  {
    id: 'g-emergency',
    title: 'Emergency Fund',
    target: 25000,
    saved: 22500,
    icon: 'shield',
    accent: 'primary',
    status: 'Almost there',
    statusTone: 'primary',
    variant: 'standard',
  },
  {
    id: 'g-porsche',
    title: 'Porsche 911 Fund',
    target: 120000,
    saved: 48000,
    icon: 'directions-car',
    accent: 'secondaryContainer',
    status: 'Dec 2025',
    statusTone: 'neutral',
    variant: 'standard',
  },
  {
    id: 'g-amalfi',
    title: 'Amalfi Coast Retreat',
    target: 12000,
    saved: 8450,
    icon: 'flight',
    accent: 'tertiary',
    status: '',
    statusTone: 'neutral',
    variant: 'featured',
    description:
      'Planned for June 2024. Includes flights, luxury villa, and dining.',
    pillLabel: 'IN PROGRESS',
  },
  {
    id: 'g-kitchen',
    title: 'Kitchen Remodel',
    target: 15000,
    saved: 3000,
    icon: 'home-work',
    accent: 'primary',
    status: 'Ongoing',
    statusTone: 'neutral',
    variant: 'standard',
  },
  {
    id: 'g-mac',
    title: 'Mac Studio Setup',
    target: 6000,
    saved: 4800,
    icon: 'laptop-mac',
    accent: 'secondary',
    status: 'Next Month',
    statusTone: 'primary',
    variant: 'standard',
  },
];

export const goalsTotalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
export const goalsTotalTarget = goals.reduce((sum, g) => sum + g.target, 0);
export const goalsCollectivePct = Math.round(
  (goalsTotalSaved / goalsTotalTarget) * 100,
);
export const goalsRemaining = goalsTotalTarget - goalsTotalSaved;

export const recentTransactions: Transaction[] = [
  // May 2026 (current month)
  { id: 't1',  merchant: 'Blue Bay Lunch', category: 'Food',   date: '2026-05-14', whenLabel: 'Today',     amount: -32,    icon: 'restaurant',     source: 'manual' },
  { id: 't2',  merchant: 'Uber Trip',      category: 'Car',    date: '2026-05-14', whenLabel: 'Today',     amount: -13,    icon: 'directions-car', source: 'manual' },
  { id: 't3',  merchant: 'Monthly Salary', category: 'Salary', date: '2026-05-13', whenLabel: 'Yesterday', amount: 3800,   icon: 'payments',       source: 'automatic' },
  { id: 't4',  merchant: 'Whole Foods',    category: 'Food',   date: '2026-05-12', whenLabel: 'May 12',    amount: -150,   icon: 'restaurant',     source: 'manual' },
  { id: 't5',  merchant: "Trader Joe's",   category: 'Food',   date: '2026-05-10', whenLabel: 'May 10',    amount: -238,   icon: 'restaurant',     source: 'manual' },
  { id: 't6',  merchant: 'Rent',           category: 'Rent',   date: '2026-05-08', whenLabel: 'May 08',    amount: -1200,  icon: 'home',           source: 'manual' },
  { id: 't7',  merchant: 'Shell Gas',      category: 'Car',    date: '2026-05-06', whenLabel: 'May 06',    amount: -107,   icon: 'directions-car', source: 'manual' },
  { id: 't8',  merchant: 'Hertz Rental',   category: 'Car',    date: '2026-05-04', whenLabel: 'May 04',    amount: -230,   icon: 'directions-car', source: 'manual' },
  { id: 't9',  merchant: 'Amazon',         category: 'Shop',   date: '2026-05-03', whenLabel: 'May 03',    amount: -180,   icon: 'shopping-bag',   source: 'manual' },
  { id: 't10', merchant: 'Target',         category: 'Shop',   date: '2026-05-02', whenLabel: 'May 02',    amount: -300,   icon: 'shopping-bag',   source: 'manual' },
  { id: 't11', merchant: 'Stock Dividend', category: 'Stocks', date: '2026-05-01', whenLabel: 'May 01',    amount: 400,    icon: 'trending-up',     source: 'automatic' },
  // April 2026
  { id: 't12', merchant: 'Whole Foods',    category: 'Food',   date: '2026-04-28', whenLabel: 'Apr 28',    amount: -85,    icon: 'restaurant',     source: 'manual' },
  { id: 't13', merchant: 'Best Buy',       category: 'Shop',   date: '2026-04-20', whenLabel: 'Apr 20',    amount: -89,    icon: 'shopping-bag',   source: 'manual' },
  { id: 't14', merchant: 'Monthly Salary', category: 'Salary', date: '2026-04-15', whenLabel: 'Apr 15',    amount: 3800,   icon: 'payments',       source: 'automatic' },
  { id: 't15', merchant: 'Rent',           category: 'Rent',   date: '2026-04-05', whenLabel: 'Apr 05',    amount: -1200,  icon: 'home',           source: 'manual' },
  // March 2026
  { id: 't16', merchant: "Trader Joe's",   category: 'Food',   date: '2026-03-28', whenLabel: 'Mar 28',    amount: -120,   icon: 'restaurant',     source: 'manual' },
  { id: 't17', merchant: 'Side Project',   category: 'Salary', date: '2026-03-15', whenLabel: 'Mar 15',    amount: 800,    icon: 'payments',       source: 'manual' },
  { id: 't18', merchant: 'Rent',           category: 'Rent',   date: '2026-03-10', whenLabel: 'Mar 10',    amount: -1200,  icon: 'home',           source: 'manual' },
  { id: 't19', merchant: 'Shell Gas',      category: 'Car',    date: '2026-03-05', whenLabel: 'Mar 05',    amount: -85,    icon: 'directions-car', source: 'manual' },
  { id: 't20', merchant: 'Stock Dividend', category: 'Stocks', date: '2026-03-01', whenLabel: 'Mar 01',    amount: 320,    icon: 'trending-up',     source: 'automatic' },
];

export type CategoryTotal = {
  category: string;
  icon: MaterialIconName;
  total: number; // always positive — sign is implied by which list it's in
};

export function summarizeByCategory(txs: Transaction[]): {
  spends: CategoryTotal[];
  gains: CategoryTotal[];
  spendTotal: number;
  gainTotal: number;
} {
  const spendMap = new Map<string, { icon: MaterialIconName; total: number }>();
  const gainMap = new Map<string, { icon: MaterialIconName; total: number }>();
  let spendTotal = 0;
  let gainTotal = 0;
  for (const t of txs) {
    const isSpend = t.amount < 0;
    const map = isSpend ? spendMap : gainMap;
    const amount = Math.abs(t.amount);
    const existing = map.get(t.category);
    if (existing) existing.total += amount;
    else map.set(t.category, { icon: t.icon, total: amount });
    if (isSpend) spendTotal += amount;
    else gainTotal += amount;
  }
  const toArray = (m: Map<string, { icon: MaterialIconName; total: number }>): CategoryTotal[] =>
    [...m.entries()]
      .map(([category, v]) => ({ category, icon: v.icon, total: v.total }))
      .sort((a, b) => b.total - a.total);
  return {
    spends: toArray(spendMap),
    gains: toArray(gainMap),
    spendTotal,
    gainTotal,
  };
}

export type MonthGroup = {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'May 2026'
  transactions: Transaction[];
  netFlow: number;
};

export function groupTransactionsByMonth(txs: Transaction[]): MonthGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    const key = t.date.slice(0, 7);
    const arr = map.get(key);
    if (arr) arr.push(t);
    else map.set(key, [t]);
  }
  const months: MonthGroup[] = [];
  for (const [monthKey, transactions] of map.entries()) {
    transactions.sort((a, b) => b.date.localeCompare(a.date));
    const netFlow = transactions.reduce((s, t) => s + t.amount, 0);
    const [yyyy, mm] = monthKey.split('-').map(Number);
    const date = new Date(yyyy, mm - 1, 1);
    const monthLabel = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    months.push({ monthKey, monthLabel, transactions, netFlow });
  }
  months.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return months;
}

export type DayGroup = {
  dayKey: string; // 'YYYY-MM-DD'
  dayLabel: string; // 'Today, May 14' | 'Yesterday, May 13' | 'May 12'
  transactions: Transaction[];
  dayTotal: number;
};

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function groupTransactionsByDay(txs: Transaction[]): DayGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    const arr = map.get(t.date);
    if (arr) arr.push(t);
    else map.set(t.date, [t]);
  }
  const now = new Date();
  const todayKey = toDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  const days: DayGroup[] = [];
  for (const [dayKey, transactions] of map.entries()) {
    const dayTotal = transactions.reduce((s, t) => s + t.amount, 0);
    const [yyyy, mm, dd] = dayKey.split('-').map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    const shortDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    let dayLabel = shortDate;
    if (dayKey === todayKey) dayLabel = `Today, ${shortDate}`;
    else if (dayKey === yesterdayKey) dayLabel = `Yesterday, ${shortDate}`;
    days.push({ dayKey, dayLabel, transactions, dayTotal });
  }
  days.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  return days;
}
