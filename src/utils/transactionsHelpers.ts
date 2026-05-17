import type { MaterialIcons } from '@expo/vector-icons';

import type {
  CategoryTotal,
  DayGroup,
  MonthGroup,
  Transaction,
} from '@/types/transaction';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

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
  const toArray = (
    m: Map<string, { icon: MaterialIconName; total: number }>,
  ): CategoryTotal[] =>
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
