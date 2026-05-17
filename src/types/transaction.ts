import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

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

export type CategoryTotal = {
  category: string;
  icon: MaterialIconName;
  total: number;
};

export type MonthGroup = {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string;
  transactions: Transaction[];
  netFlow: number;
};

export type DayGroup = {
  dayKey: string; // 'YYYY-MM-DD'
  dayLabel: string;
  transactions: Transaction[];
  dayTotal: number;
};
