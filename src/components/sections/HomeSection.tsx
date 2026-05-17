import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import {
  dashboardSummary,
  savingsProgress,
  spendingAnalysis,
} from '@/data/dummy';
import { useTransactions } from '@/hooks/useTransactions';
import { useThemeColors } from '@/theme';
import type { Transaction } from '@/types/transaction';

const SPARKLINE_HEIGHT = 48;

function formatCurrency(amount: number, opts: { signed?: boolean } = {}) {
  const sign = opts.signed && amount > 0 ? '+' : amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}$${formatted}`;
}

function formatCurrencyShort(amount: number) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount}`;
}

function useHomeTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function HomeSection() {
  const { styles } = useHomeTheme();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <NetWorthCard />
      <IncomeExpensesGrid />
      <SpendingAnalysisCard />
      <SavingsProgressCard />
      <RecentTransactionsList />
    </ScrollView>
  );
}

function NetWorthCard() {
  const { colors, styles } = useHomeTheme();
  const { netWorth, trendPct, netWorthSparkline } = dashboardSummary;
  return (
    <GlassCard style={styles.netWorthCard}>
      <View style={styles.netWorthGlow} pointerEvents="none" />
      <View style={styles.netWorthBody}>
        <Text style={styles.eyebrow}>Total Net Worth</Text>
        <Text style={styles.netWorthAmount}>{formatCurrency(netWorth)}</Text>
        <View style={styles.trendRow}>
          <View style={styles.trendChip}>
            <MaterialIcons name="trending-up" size={18} color={colors.primary} />
            <Text style={styles.trendValue}>+{trendPct.toFixed(1)}%</Text>
          </View>
          <Text style={styles.trendCompare}>vs last month</Text>
        </View>
      </View>
      <View style={styles.sparklineRow}>
        {netWorthSparkline.map((pct, i) => {
          const isLast = i === netWorthSparkline.length - 1;
          return (
            <View
              key={i}
              style={[
                styles.sparkBar,
                {
                  height: (SPARKLINE_HEIGHT * pct) / 100,
                  backgroundColor: isLast ? colors.primary : colors.primaryGlowSoft,
                  shadowColor: colors.primary,
                  shadowOpacity: isLast ? 0.4 : 0,
                  shadowRadius: isLast ? 8 : 0,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            />
          );
        })}
      </View>
    </GlassCard>
  );
}

function IncomeExpensesGrid() {
  const { colors, styles } = useHomeTheme();
  const { income, expenses } = dashboardSummary;
  return (
    <View style={styles.row2}>
      <StatTile
        label="Income"
        value={`$${income.toLocaleString()}`}
        icon="south-west"
        accent={colors.primary}
        accentBg={colors.primaryTint10}
      />
      <StatTile
        label="Expenses"
        value={`$${expenses.toLocaleString()}`}
        icon="north-east"
        accent={colors.secondary}
        accentBg={colors.secondaryTint20}
      />
    </View>
  );
}

function StatTile({
  label,
  value,
  icon,
  accent,
  accentBg,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  accent: string;
  accentBg: string;
}) {
  const { styles } = useHomeTheme();

  return (
    <GlassCard style={styles.statTile} radius={Radius.card}>
      <View style={styles.statTileHeader}>
        <View style={[styles.statIconBubble, { backgroundColor: accentBg }]}>
          <MaterialIcons name={icon} size={20} color={accent} />
        </View>
        <Text style={[styles.eyebrow, styles.statTileLabel]}>{label}</Text>
      </View>
      <Text style={styles.statTileValue}>{value}</Text>
    </GlassCard>
  );
}

function SpendingAnalysisCard() {
  const { colors, styles } = useHomeTheme();
  const { total, breakdown } = spendingAnalysis;
  return (
    <GlassCard style={styles.softCard}>
      <Text style={styles.cardTitle}>Spending Analysis</Text>
      <View style={styles.spendBody}>
        <FauxDonut totalLabel="TOTAL" totalValue={formatCurrencyShort(total)} />
        <View style={styles.legendCol}>
          {breakdown.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors[item.colorKey] },
                  ]}
                />
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
              <Text style={styles.legendValue}>{item.pct}%</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}

function FauxDonut({ totalLabel, totalValue }: { totalLabel: string; totalValue: string }) {
  const { colors, styles } = useHomeTheme();

  return (
    <View style={styles.donutWrap}>
      <View style={[styles.donutRing, styles.donutBase]} />
      <View
        style={[
          styles.donutRing,
          {
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: colors.primary,
            borderBottomColor: colors.primary,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.donutRing,
          {
            borderTopColor: colors.secondary,
            borderLeftColor: colors.secondary,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: '-12deg' }],
          },
        ]}
      />
      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterLabel}>{totalLabel}</Text>
        <Text style={styles.donutCenterValue}>{totalValue}</Text>
      </View>
    </View>
  );
}

function SavingsProgressCard() {
  const { colors, styles } = useHomeTheme();
  const { overallPct, goals, goalIcons } = savingsProgress;
  const goal = goals[0];
  return (
    <GlassCard style={styles.softCard}>
      <View style={styles.savingsHeader}>
        <Text style={styles.cardTitle}>Savings Progress</Text>
        <Text style={styles.savingsPct}>{overallPct}%</Text>
      </View>
      <View style={{ gap: Spacing.marginMain }}>
        <View>
          <View style={styles.savingsRow}>
            <Text style={styles.savingsGoalName}>{goal.name}</Text>
            <Text style={styles.savingsGoalAmount}>
              ${goal.saved.toLocaleString()} / ${(goal.target / 1000).toFixed(0)}k
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(goal.saved / goal.target) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.savingsFooter}>
          <View style={styles.avatarStack}>
            {goalIcons.map((icon, idx) => (
              <View
                key={icon}
                style={[
                  styles.avatarBubble,
                  idx > 0 && { marginLeft: -8 },
                ]}
              >
                <MaterialIcons name={icon} size={16} color={colors.onSurface} />
              </View>
            ))}
          </View>
          <Pressable hitSlop={8}>
            <Text style={styles.linkLabel}>View All Goals</Text>
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

function RecentTransactionsList() {
  const { colors, styles } = useHomeTheme();
  const { transactions } = useTransactions();
  const recent = transactions.slice(0, 3);

  return (
    <View style={{ gap: Spacing.stackMd }}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.viewAllMuted}>View All</Text>
        </Pressable>
      </View>
      {recent.length === 0 ? (
        <Text style={{ color: colors.onSurfaceVariant }}>
          No transactions yet. Add one from the Log tab.
        </Text>
      ) : (
        <View style={{ gap: Spacing.stackSm }}>
          {recent.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      )}
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const { colors, styles } = useHomeTheme();
  const isIncome = tx.amount > 0;
  return (
    <GlassCard radius={Radius.card} style={styles.txRow}>
      <View style={styles.txLeft}>
        <View style={styles.txIconBubble}>
          <MaterialIcons name={tx.icon} size={22} color={colors.onSurface} />
        </View>
        <View>
          <Text style={styles.txMerchant}>{tx.merchant}</Text>
          <Text style={styles.txMeta}>
            {tx.category} • {tx.whenLabel}
          </Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            isIncome && { color: colors.primary },
          ]}
        >
          {formatCurrency(tx.amount, { signed: true })}
        </Text>
        <Text style={styles.txSource}>
          {tx.source === 'manual' ? 'Manual Entry' : 'Automatic'}
        </Text>
      </View>
    </GlassCard>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackLg * 2,
    gap: Spacing.stackLg,
  },

  eyebrow: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
    marginBottom: Spacing.stackXs,
  },
  cardTitle: {
    ...Type.titleSm,
    color: colors.onSurface,
  },

  netWorthCard: {
    padding: Spacing.marginMain,
    position: 'relative',
    overflow: 'hidden',
  },
  netWorthGlow: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primaryTint10,
    opacity: 0.7,
  },
  netWorthBody: {
    zIndex: 1,
  },
  netWorthAmount: {
    ...Type.displayLg,
    color: colors.onSurface,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginTop: Spacing.stackSm,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackXs,
  },
  trendValue: {
    ...Type.bodyMd,
    color: colors.primary,
    fontWeight: '600',
  },
  trendCompare: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  sparklineRow: {
    marginTop: Spacing.marginMain,
    height: SPARKLINE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  sparkBar: {
    flex: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  row2: {
    flexDirection: 'row',
    gap: Spacing.gutterGrid,
  },
  statTile: {
    flex: 1,
    padding: Spacing.stackMd,
  },
  statTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: Spacing.stackSm,
  },
  statTileLabel: {
    marginBottom: 0,
  },
  statIconBubble: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTileValue: {
    ...Type.titleSm,
    color: colors.onSurface,
  },

  softCard: {
    padding: Spacing.marginMain,
    gap: Spacing.marginMain,
  },

  spendBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutWrap: {
    width: 128,
    height: 128,
  },
  donutBase: {
    borderColor: colors.surfaceContainerHigh,
  },
  donutRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 64,
    borderWidth: 12,
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 1,
  },
  donutCenterValue: {
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '600',
  },
  legendCol: {
    flex: 1,
    marginLeft: Spacing.stackLg,
    gap: Spacing.stackMd - 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  legendValue: {
    ...Type.bodyMd,
    color: colors.onSurface,
  },

  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  savingsPct: {
    ...Type.labelCaps,
    color: colors.primary,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.stackSm,
  },
  savingsGoalName: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  savingsGoalAmount: {
    ...Type.bodyMd,
    color: colors.onSurface,
  },
  progressTrack: {
    height: 8,
    width: '100%',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  savingsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.stackMd,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.white05,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    ...Type.labelCaps,
    color: colors.primary,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.stackSm,
  },
  viewAllMuted: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
  },

  txRow: {
    padding: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    flex: 1,
  },
  txIconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMerchant: {
    ...Type.bodyLg,
    color: colors.onSurface,
  },
  txMeta: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    ...Type.titleSm,
    color: colors.onSurface,
  },
  txSource: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  });
}
