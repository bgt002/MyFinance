import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import {
  groupTransactionsByDay,
  groupTransactionsByMonth,
  recentTransactions,
  summarizeByCategory,
  type CategoryTotal,
  type DayGroup,
  type MonthGroup,
  type Transaction,
} from '@/data/dummy';
import { useThemeColors } from '@/theme';

import {
  AddCategoryModal,
  type CategoryKind,
  type NewCategoryInput,
} from './AddCategoryModal';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type UserCategory = {
  name: string;
  icon: MaterialIconName;
  kind: CategoryKind;
};

type RangeKey = 'day' | 'week' | 'month' | 'year';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

function formatSignedCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '+';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompactCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;
}

function useLogTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

function mergeUserCategories(
  fromTransactions: CategoryTotal[],
  userCats: UserCategory[],
): CategoryTotal[] {
  const existing = new Set(fromTransactions.map((c) => c.category));
  const unused = userCats
    .filter((c) => !existing.has(c.name))
    .map((c) => ({ category: c.name, icon: c.icon, total: 0 }));
  return [...fromTransactions, ...unused];
}

export function LogSection() {
  const { styles } = useLogTheme();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<RangeKey>('month');

  const months = useMemo(
    () => groupTransactionsByMonth(recentTransactions),
    [],
  );
  const currentMonthKey = months[0]?.monthKey ?? '';
  const [expandedMonth, setExpandedMonth] = useState<string>(currentMonthKey);

  const summary = useMemo(
    () => summarizeByCategory(months[0]?.transactions ?? []),
    [months],
  );

  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [categoryModalKind, setCategoryModalKind] =
    useState<CategoryKind | null>(null);

  const displaySpends = useMemo(
    () =>
      mergeUserCategories(
        summary.spends,
        userCategories.filter((c) => c.kind === 'spend'),
      ),
    [summary.spends, userCategories],
  );
  const displayGains = useMemo(
    () =>
      mergeUserCategories(
        summary.gains,
        userCategories.filter((c) => c.kind === 'gain'),
      ),
    [summary.gains, userCategories],
  );

  function handleAddCategory(input: NewCategoryInput) {
    setUserCategories((prev) => [
      ...prev,
      { name: input.name, icon: input.icon, kind: input.kind },
    ]);
    setCategoryModalKind(null);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + insets.bottom + Spacing.marginMain },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TimeRangePills selected={range} onChange={setRange} />

        <CategorySummaryCard
          spends={displaySpends}
          gains={displayGains}
          spendTotal={summary.spendTotal}
          gainTotal={summary.gainTotal}
          onAddCategory={(kind) => setCategoryModalKind(kind)}
        />

        <TransactionHistory
          months={months}
          expandedKey={expandedMonth}
          currentKey={currentMonthKey}
          onToggle={(key) =>
            setExpandedMonth((prev) => (prev === key ? '' : key))
          }
        />
      </ScrollView>

      <Fab
        onPress={() => {
          // TODO: open add transaction flow
        }}
        bottomInset={insets.bottom}
      />

      <AddCategoryModal
        visible={categoryModalKind !== null}
        kind={categoryModalKind ?? 'spend'}
        onClose={() => setCategoryModalKind(null)}
        onSubmit={handleAddCategory}
      />
    </View>
  );
}

function TimeRangePills({
  selected,
  onChange,
}: {
  selected: RangeKey;
  onChange: (key: RangeKey) => void;
}) {
  const { colors, styles } = useLogTheme();
  return (
    <View style={styles.pillsRow}>
      {RANGES.map((r) => {
        const active = r.key === selected;
        return (
          <Pressable
            key={r.key}
            onPress={() => onChange(r.key)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {r.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.pill}>
        <MaterialIcons name="tune" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

function CategorySummaryCard({
  spends,
  gains,
  spendTotal,
  gainTotal,
  onAddCategory,
}: {
  spends: CategoryTotal[];
  gains: CategoryTotal[];
  spendTotal: number;
  gainTotal: number;
  onAddCategory: (kind: CategoryKind) => void;
}) {
  const { colors, styles } = useLogTheme();
  return (
    <GlassCard radius={Radius.xl} style={styles.summaryCard}>
      <Text style={styles.eyebrow}>Summary by Category</Text>

      <View style={styles.summaryBlock}>
        <View style={styles.summaryBlockHeader}>
          <Text style={[styles.summaryBlockLabel, { color: colors.error }]}>
            Spends
          </Text>
          <Text style={[styles.summaryBlockTotal, { color: colors.error }]}>
            -$
            {spendTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.summaryGrid}>
          {spends.map((c) => (
            <SpendCategoryCell key={c.category} cat={c} />
          ))}
          <AddCategoryCell onPress={() => onAddCategory('spend')} />
        </View>
      </View>

      <View style={styles.summaryBlock}>
        <View style={styles.summaryBlockHeader}>
          <Text style={[styles.summaryBlockLabel, { color: colors.primary }]}>
            Gains
          </Text>
          <Text style={[styles.summaryBlockTotal, { color: colors.primary }]}>
            +$
            {gainTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        <View style={styles.summaryGrid}>
          {gains.map((c) => (
            <GainCategoryCell key={c.category} cat={c} />
          ))}
          <AddCategoryCell onPress={() => onAddCategory('gain')} />
        </View>
      </View>
    </GlassCard>
  );
}

function AddCategoryCell({ onPress }: { onPress: () => void }) {
  const { colors, styles } = useLogTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCell,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View
        style={[
          styles.categoryBubble,
          {
            backgroundColor: 'transparent',
            borderColor: colors.outlineVariant,
            borderStyle: 'dashed',
          },
        ]}
      >
        <MaterialIcons name="add" size={20} color={colors.onSurfaceVariant} />
      </View>
      <Text style={styles.categoryLabel}>Add</Text>
      <Text style={[styles.categoryAmount, { opacity: 0 }]}>—</Text>
    </Pressable>
  );
}

function SpendCategoryCell({ cat }: { cat: CategoryTotal }) {
  const { colors, styles } = useLogTheme();
  return (
    <View style={styles.categoryCell}>
      <View
        style={[
          styles.categoryBubble,
          {
            backgroundColor: colors.surfaceContainerHigh,
            borderColor: colors.white05,
          },
        ]}
      >
        <MaterialIcons
          name={cat.icon}
          size={20}
          color={colors.onSurfaceVariant}
        />
      </View>
      <Text style={styles.categoryLabel}>{cat.category}</Text>
      <Text style={styles.categoryAmount}>
        {formatCompactCurrency(cat.total)}
      </Text>
    </View>
  );
}

function GainCategoryCell({ cat }: { cat: CategoryTotal }) {
  const { colors, styles } = useLogTheme();
  const isSecondary = cat.category === 'Stocks';
  const tint = isSecondary
    ? colors.secondaryContainerTint10
    : colors.primaryTint10;
  const border = isSecondary ? colors.white05 : colors.primaryTint20;
  const iconColor = isSecondary ? colors.secondary : colors.primary;
  return (
    <View style={styles.categoryCell}>
      <View
        style={[
          styles.categoryBubble,
          { backgroundColor: tint, borderColor: border },
        ]}
      >
        <MaterialIcons name={cat.icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.categoryLabel}>{cat.category}</Text>
      <Text style={styles.categoryAmount}>
        {formatCompactCurrency(cat.total)}
      </Text>
    </View>
  );
}

function TransactionHistory({
  months,
  expandedKey,
  currentKey,
  onToggle,
}: {
  months: MonthGroup[];
  expandedKey: string;
  currentKey: string;
  onToggle: (key: string) => void;
}) {
  const { styles } = useLogTheme();
  return (
    <View style={styles.historySection}>
      <Text style={styles.eyebrow}>Transaction History</Text>
      <View style={{ gap: Spacing.stackSm }}>
        {months.map((m) => (
          <MonthBlock
            key={m.monthKey}
            month={m}
            expanded={m.monthKey === expandedKey}
            isCurrent={m.monthKey === currentKey}
            onToggle={() => onToggle(m.monthKey)}
          />
        ))}
      </View>
    </View>
  );
}

function MonthBlock({
  month,
  expanded,
  isCurrent,
  onToggle,
}: {
  month: MonthGroup;
  expanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
}) {
  const { colors, styles } = useLogTheme();
  const dayGroups = useMemo(
    () => (expanded ? groupTransactionsByDay(month.transactions) : []),
    [expanded, month.transactions],
  );
  return (
    <GlassCard
      radius={Radius.xl}
      style={[styles.monthCard, !expanded && styles.monthCardCollapsed]}
    >
      <Pressable
        onPress={onToggle}
        style={[styles.monthHeader, expanded && styles.monthHeaderExpanded]}
      >
        <View style={styles.monthHeaderLeft}>
          <Text style={styles.monthTitle}>{month.monthLabel}</Text>
          {isCurrent && (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>Current</Text>
            </View>
          )}
        </View>
        {expanded ? (
          <MaterialIcons
            name="keyboard-arrow-up"
            size={22}
            color={colors.onSurfaceVariant}
          />
        ) : (
          <View style={styles.monthHeaderRight}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.netFlowLabel}>Net Flow</Text>
              <Text
                style={[
                  styles.netFlowAmount,
                  { color: month.netFlow < 0 ? colors.error : colors.primary },
                ]}
              >
                {formatSignedCurrency(month.netFlow)}
              </Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={22}
              color={colors.onSurfaceVariant}
            />
          </View>
        )}
      </Pressable>
      {expanded && (
        <View style={styles.monthBody}>
          {dayGroups.map((dg, idx) => (
            <DayGroupView key={dg.dayKey} day={dg} isFirst={idx === 0} />
          ))}
        </View>
      )}
    </GlassCard>
  );
}

function DayGroupView({ day, isFirst }: { day: DayGroup; isFirst: boolean }) {
  const { colors, styles } = useLogTheme();
  return (
    <View style={[styles.dayGroup, !isFirst && styles.dayGroupBorder]}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>{day.dayLabel}</Text>
        <Text
          style={[
            styles.dayTotal,
            { color: day.dayTotal < 0 ? colors.error : colors.primary },
          ]}
        >
          {formatSignedCurrency(day.dayTotal)}
        </Text>
      </View>
      <View>
        {day.transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </View>
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const { colors, styles } = useLogTheme();
  const isGain = tx.amount > 0;
  const iconTint = isGain ? colors.primaryTint10 : colors.surfaceContainerHighest;
  const iconColor = isGain ? colors.primary : colors.onSurface;
  return (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <View style={[styles.txIconBubble, { backgroundColor: iconTint }]}>
          <MaterialIcons name={tx.icon} size={16} color={iconColor} />
        </View>
        <View>
          <Text style={styles.txMerchant}>{tx.merchant}</Text>
          <Text style={styles.txCategory}>{tx.category}</Text>
        </View>
      </View>
      <Text style={[styles.txAmount, isGain && { color: colors.primary }]}>
        {formatSignedCurrency(tx.amount)}
      </Text>
    </View>
  );
}

function Fab({
  onPress,
  bottomInset,
}: {
  onPress: () => void;
  bottomInset: number;
}) {
  const { colors, styles } = useLogTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fabShadow,
        { bottom: Spacing.marginMain + bottomInset },
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
      hitSlop={8}
    >
      <LinearGradient
        colors={[colors.secondaryContainer, colors.primary]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.fab}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </LinearGradient>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Spacing.marginMain,
      paddingTop: Spacing.stackLg,
      gap: Spacing.stackLg,
    },

    eyebrow: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
    },

    pillsRow: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.white05,
      padding: 4,
      gap: 4,
    },
    pill: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: colors.primaryTint10,
    },
    pillText: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
      fontSize: 10,
    },
    pillTextActive: {
      color: colors.primary,
    },

    summaryCard: {
      padding: Spacing.stackMd,
      gap: Spacing.stackLg,
    },
    summaryBlock: {
      gap: Spacing.stackMd,
    },
    summaryBlockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryBlockLabel: {
      ...Type.labelCaps,
      fontSize: 11,
    },
    summaryBlockTotal: {
      fontSize: 14,
      fontWeight: '700',
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: Spacing.stackSm,
      rowGap: Spacing.stackMd,
    },
    categoryCell: {
      width: '23%',
      alignItems: 'center',
      gap: 4,
    },
    categoryBubble: {
      width: 40,
      height: 40,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
    },
    categoryLabel: {
      fontSize: 9,
      color: colors.onSurfaceVariant,
      fontWeight: '700',
      letterSpacing: 0.5,
      opacity: 0.6,
      textTransform: 'uppercase',
    },
    categoryAmount: {
      fontSize: 10,
      color: colors.onSurface,
      fontWeight: '700',
    },

    historySection: {
      gap: Spacing.stackSm,
    },

    monthCard: {
      padding: 0,
      overflow: 'hidden',
    },
    monthCardCollapsed: {
      opacity: 0.6,
    },
    monthHeader: {
      padding: Spacing.stackMd,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthHeaderExpanded: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.white05,
      backgroundColor: colors.white05,
    },
    monthHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
    },
    monthHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackMd,
    },
    monthTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    currentPill: {
      backgroundColor: colors.primaryTint10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.sm,
    },
    currentPillText: {
      ...Type.labelCaps,
      fontSize: 10,
      color: colors.primary,
    },
    netFlowLabel: {
      ...Type.labelCaps,
      fontSize: 10,
      color: colors.onSurfaceVariant,
      marginBottom: 1,
    },
    netFlowAmount: {
      fontSize: 12,
      fontWeight: '700',
    },
    monthBody: {
      padding: Spacing.stackMd,
      gap: Spacing.stackMd,
    },

    dayGroup: {
      gap: Spacing.stackSm,
    },
    dayGroupBorder: {
      paddingTop: Spacing.stackSm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.white05,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    dayLabel: {
      ...Type.labelCaps,
      fontSize: 10,
      color: colors.onSurfaceVariant,
      opacity: 0.5,
    },
    dayTotal: {
      fontSize: 10,
      fontWeight: '700',
    },

    txRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    txLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
    },
    txIconBubble: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txMerchant: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
    },
    txCategory: {
      fontSize: 10,
      color: colors.onSurfaceVariant,
    },
    txAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.error,
    },

    fabShadow: {
      position: 'absolute',
      right: Spacing.marginMain,
      width: 56,
      height: 56,
      borderRadius: 28,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 12,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
