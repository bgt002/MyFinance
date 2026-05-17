import { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// Remaining placeholder data for the Home dashboard and Charts section. These
// will be replaced by computed values (slice 2) and historical snapshots
// (slice 3) once those slices land. Everything else that lived here — types,
// constants, helpers, accounts/transactions/goals — has moved to its proper
// home.

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
