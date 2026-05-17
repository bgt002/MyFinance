import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import {
  STAPLE_CATEGORIES,
  isStapleCategory,
  type StapleCategory,
} from '@/constants/categories';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { useAccounts } from '@/hooks/useAccounts';
import type { Account } from '@/types/account';
import type { CategoryTotal, Transaction } from '@/types/transaction';
import { summarizeByCategory } from '@/utils/transactionsHelpers';
import { useTransactions } from '@/hooks/useTransactions';
import { useThemeColors } from '@/theme';
import {
  addDaysToKey,
  formatDayLabel,
  todayKey,
  type DateKey,
} from '@/utils/dateKey';

import {
  AddCategoryModal,
  type CategoryKind,
  type NewCategoryInput,
} from './AddCategoryModal';
import {
  AddTransactionModal,
  type NewTransactionInput,
  type TransactionKind,
} from './AddTransactionModal';
import { CalendarPickerModal } from './CalendarPickerModal';

// Accounts you can spend from — debit/credit cards, cash, PayPal.
function isSpendableAccount(a: Account): boolean {
  return a.category === 'cash' || a.category === 'credit';
}

// Accounts you can deposit gains into — any asset account.
function isDepositableAccount(a: Account): boolean {
  return a.kind === 'asset';
}

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type UserCategory = {
  name: string;
  icon: MaterialIconName;
  kind: CategoryKind;
};

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

// Order: staples first (in declared order), then transaction-derived non-staple
// categories (so user-active categories surface), then user-added categories
// that have no activity yet.
function mergeAllCategories(
  fromTransactions: CategoryTotal[],
  staples: StapleCategory[],
  userCats: UserCategory[],
): CategoryTotal[] {
  const byName = new Map(fromTransactions.map((c) => [c.category, c]));
  const stapleNames = new Set(staples.map((s) => s.name));
  const result: CategoryTotal[] = [];

  for (const s of staples) {
    const tx = byName.get(s.name);
    result.push(tx ?? { category: s.name, icon: s.icon, total: 0 });
  }
  for (const c of fromTransactions) {
    if (!stapleNames.has(c.category)) result.push(c);
  }
  const taken = new Set(result.map((c) => c.category));
  for (const u of userCats) {
    if (!taken.has(u.name)) {
      result.push({ category: u.name, icon: u.icon, total: 0 });
    }
  }
  return result;
}

export function LogSection() {
  const { styles } = useLogTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<DateKey>(() => todayKey());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    transactions,
    addTransaction,
    removeTransaction,
    removeTransactionsByCategory,
  } = useTransactions();
  const dayTransactions = useMemo(
    () => transactions.filter((t) => t.date === selectedDate),
    [transactions, selectedDate],
  );

  const summary = useMemo(
    () => summarizeByCategory(dayTransactions),
    [dayTransactions],
  );

  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [categoryModalKind, setCategoryModalKind] =
    useState<CategoryKind | null>(null);
  const [activeEntry, setActiveEntry] = useState<{
    kind: TransactionKind;
    cat: CategoryTotal;
  } | null>(null);

  const { accounts } = useAccounts();
  const spendableAccounts = useMemo(
    () => accounts.filter(isSpendableAccount),
    [accounts],
  );
  const depositableAccounts = useMemo(
    () => accounts.filter(isDepositableAccount),
    [accounts],
  );
  const modalAccounts =
    activeEntry?.kind === 'gain' ? depositableAccounts : spendableAccounts;

  const stapleSpends = useMemo(
    () => STAPLE_CATEGORIES.filter((c) => c.kind === 'spend'),
    [],
  );
  const stapleGains = useMemo(
    () => STAPLE_CATEGORIES.filter((c) => c.kind === 'gain'),
    [],
  );

  const displaySpends = useMemo(
    () =>
      mergeAllCategories(
        summary.spends,
        stapleSpends,
        userCategories.filter((c) => c.kind === 'spend'),
      ),
    [summary.spends, stapleSpends, userCategories],
  );
  const displayGains = useMemo(
    () =>
      mergeAllCategories(
        summary.gains,
        stapleGains,
        userCategories.filter((c) => c.kind === 'gain'),
      ),
    [summary.gains, stapleGains, userCategories],
  );

  async function handleAddCategory(input: NewCategoryInput) {
    setUserCategories((prev) => [
      ...prev,
      { name: input.name, icon: input.icon, kind: input.kind },
    ]);
    setCategoryModalKind(null);
    if (input.initialAmount && input.initialAmount > 0) {
      await addTransaction({
        kind: input.kind,
        category: input.name,
        icon: input.icon,
        date: selectedDate,
        allocations: [{ accountId: null, amount: input.initialAmount }],
      });
    }
  }

  function handleDeleteCategory(name: string) {
    if (isStapleCategory(name)) return;
    const matching = transactions.filter((t) => t.category === name);
    const count = matching.length;
    const total = matching.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const body =
      count === 0
        ? `"${name}" will be removed from the grid.`
        : `"${name}" will be removed along with ${count} transaction${
            count === 1 ? '' : 's'
          } ($${total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} total).`;
    Alert.alert('Delete category?', body, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setUserCategories((prev) => prev.filter((c) => c.name !== name));
          if (count > 0) {
            void removeTransactionsByCategory(name);
          }
        },
      },
    ]);
  }

  async function handleAddTransaction(input: NewTransactionInput) {
    setActiveEntry(null);
    await addTransaction({
      kind: input.kind,
      category: input.category,
      icon: input.icon,
      date: input.date,
      allocations: input.allocations,
      ...(input.description ? { description: input.description } : {}),
    });
  }

  function handleDeleteTransaction(tx: Transaction) {
    Alert.alert(
      'Delete transaction?',
      `"${tx.merchant}" for ${formatSignedCurrency(tx.amount)} will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void removeTransaction(tx.id);
          },
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.marginMain },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DateBar
          selectedDate={selectedDate}
          onPrev={() => setSelectedDate((k) => addDaysToKey(k, -1))}
          onNext={() => setSelectedDate((k) => addDaysToKey(k, 1))}
          onOpenCalendar={() => setCalendarOpen(true)}
          onToday={() => setSelectedDate(todayKey())}
        />

        <CategorySummaryCard
          spends={displaySpends}
          gains={displayGains}
          spendTotal={summary.spendTotal}
          gainTotal={summary.gainTotal}
          onAddCategory={(kind) => setCategoryModalKind(kind)}
          onSpendPress={(cat) => setActiveEntry({ kind: 'spend', cat })}
          onGainPress={(cat) => setActiveEntry({ kind: 'gain', cat })}
          onLongPressCategory={handleDeleteCategory}
        />

        <DailyTransactions
          transactions={dayTransactions}
          onDelete={handleDeleteTransaction}
        />
      </ScrollView>

      <AddCategoryModal
        visible={categoryModalKind !== null}
        kind={categoryModalKind ?? 'spend'}
        onClose={() => setCategoryModalKind(null)}
        onSubmit={handleAddCategory}
      />

      <AddTransactionModal
        visible={activeEntry !== null}
        kind={activeEntry?.kind ?? 'spend'}
        category={activeEntry?.cat.category ?? ''}
        categoryIcon={activeEntry?.cat.icon ?? 'shopping-bag'}
        accounts={modalAccounts}
        date={selectedDate}
        onClose={() => setActiveEntry(null)}
        onSubmit={handleAddTransaction}
      />

      <CalendarPickerModal
        visible={calendarOpen}
        selectedDate={selectedDate}
        onSelect={(key) => {
          setSelectedDate(key);
          setCalendarOpen(false);
        }}
        onClose={() => setCalendarOpen(false)}
      />
    </View>
  );
}

function DateBar({
  selectedDate,
  onPrev,
  onNext,
  onOpenCalendar,
  onToday,
}: {
  selectedDate: DateKey;
  onPrev: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
  onToday: () => void;
}) {
  const { colors, styles } = useLogTheme();
  const isToday = selectedDate === todayKey();

  return (
    <View style={styles.dateBar}>
      <Pressable
        onPress={onPrev}
        hitSlop={6}
        style={({ pressed }) => [
          styles.dateNavBtn,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <MaterialIcons
          name="chevron-left"
          size={22}
          color={colors.onSurface}
        />
      </Pressable>

      <Pressable
        onPress={onOpenCalendar}
        hitSlop={6}
        style={({ pressed }) => [
          styles.dateLabelWrap,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={styles.dateLabel}>{formatDayLabel(selectedDate)}</Text>
        {isToday && <Text style={styles.dateChip}>TODAY</Text>}
      </Pressable>

      <Pressable
        onPress={onNext}
        hitSlop={6}
        style={({ pressed }) => [
          styles.dateNavBtn,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={colors.onSurface}
        />
      </Pressable>

      <View style={styles.dateBarSpacer} />

      {!isToday && (
        <Pressable
          onPress={onToday}
          hitSlop={6}
          style={({ pressed }) => [
            styles.todayBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <MaterialIcons name="today" size={14} color={colors.primary} />
          <Text style={styles.todayBtnText}>Today</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onOpenCalendar}
        hitSlop={6}
        style={({ pressed }) => [
          styles.dateNavBtn,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <MaterialIcons
          name="calendar-today"
          size={20}
          color={colors.onSurfaceVariant}
        />
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
  onSpendPress,
  onGainPress,
  onLongPressCategory,
}: {
  spends: CategoryTotal[];
  gains: CategoryTotal[];
  spendTotal: number;
  gainTotal: number;
  onAddCategory: (kind: CategoryKind) => void;
  onSpendPress: (cat: CategoryTotal) => void;
  onGainPress: (cat: CategoryTotal) => void;
  onLongPressCategory: (name: string) => void;
}) {
  const { colors, styles } = useLogTheme();
  return (
    <GlassCard radius={Radius.xl} style={styles.summaryCard}>
      <Text style={styles.eyebrow}>Daily Summary by Category</Text>

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
          {spends.map((c) => {
            const staple = isStapleCategory(c.category);
            return (
              <SpendCategoryCell
                key={c.category}
                cat={c}
                onPress={() => onSpendPress(c)}
                onLongPress={staple ? undefined : () => onLongPressCategory(c.category)}
              />
            );
          })}
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
          {gains.map((c) => {
            const staple = isStapleCategory(c.category);
            return (
              <GainCategoryCell
                key={c.category}
                cat={c}
                onPress={() => onGainPress(c)}
                onLongPress={staple ? undefined : () => onLongPressCategory(c.category)}
              />
            );
          })}
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

function SpendCategoryCell({
  cat,
  onPress,
  onLongPress,
}: {
  cat: CategoryTotal;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { colors, styles } = useLogTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.categoryCell, pressed && { opacity: 0.6 }]}
    >
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
    </Pressable>
  );
}

function GainCategoryCell({
  cat,
  onPress,
  onLongPress,
}: {
  cat: CategoryTotal;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { colors, styles } = useLogTheme();
  const isSecondary = cat.category === 'Stocks';
  const tint = isSecondary
    ? colors.secondaryContainerTint10
    : colors.primaryTint10;
  const border = isSecondary ? colors.white05 : colors.primaryTint20;
  const iconColor = isSecondary ? colors.secondary : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.categoryCell, pressed && { opacity: 0.6 }]}
    >
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
    </Pressable>
  );
}

function DailyTransactions({
  transactions,
  onDelete,
}: {
  transactions: Transaction[];
  onDelete: (tx: Transaction) => void;
}) {
  const { colors, styles } = useLogTheme();
  const dayTotal = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  return (
    <View style={styles.dailySection}>
      <View style={styles.dailyHeader}>
        <Text style={styles.eyebrow}>Transactions</Text>
        {transactions.length > 0 && (
          <Text
            style={[
              styles.dayTotal,
              { color: dayTotal < 0 ? colors.error : colors.primary },
            ]}
          >
            {formatSignedCurrency(dayTotal)}
          </Text>
        )}
      </View>

      {transactions.length === 0 ? (
        <GlassCard radius={Radius.xl} style={styles.emptyCard}>
          <MaterialIcons
            name="event-busy"
            size={28}
            color={colors.onSurfaceVariantMuted}
          />
          <Text style={styles.emptyTitle}>No transactions on this day</Text>
          <Text style={styles.emptyHint}>
            Tap a category above to add one.
          </Text>
        </GlassCard>
      ) : (
        <GlassCard radius={Radius.xl} style={styles.dailyCard}>
          {transactions.map((tx, i) => (
            <View key={tx.id}>
              {i > 0 && <View style={styles.txDivider} />}
              <TransactionRow tx={tx} onLongPress={() => onDelete(tx)} />
            </View>
          ))}
          <Text style={styles.dailyHint}>Long-press a row to delete.</Text>
        </GlassCard>
      )}
    </View>
  );
}

function TransactionRow({
  tx,
  onLongPress,
}: {
  tx: Transaction;
  onLongPress: () => void;
}) {
  const { colors, styles } = useLogTheme();
  const isGain = tx.amount > 0;
  const iconTint = isGain ? colors.primaryTint10 : colors.surfaceContainerHighest;
  const iconColor = isGain ? colors.primary : colors.onSurface;
  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.txRow, pressed && { opacity: 0.6 }]}
    >
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

    dateBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.white05,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    dateNavBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateLabelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      paddingHorizontal: Spacing.stackSm,
    },
    dateLabel: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    dateChip: {
      ...Type.labelCaps,
      fontSize: 9,
      color: colors.primary,
      backgroundColor: colors.primaryTint10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.sm,
    },
    dateBarSpacer: {
      flex: 1,
    },
    todayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.stackSm,
      paddingVertical: 6,
      borderRadius: Radius.pill,
      backgroundColor: colors.primaryTint10,
    },
    todayBtnText: {
      ...Type.labelCaps,
      fontSize: 10,
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
      textAlign: 'center',
    },
    categoryAmount: {
      fontSize: 10,
      color: colors.onSurface,
      fontWeight: '700',
    },

    dailySection: {
      gap: Spacing.stackSm,
    },
    dailyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dayTotal: {
      fontSize: 14,
      fontWeight: '700',
    },
    dailyCard: {
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: Spacing.stackSm,
    },
    dailyHint: {
      ...Type.labelCaps,
      fontSize: 9,
      color: colors.onSurfaceVariantMuted,
      textAlign: 'center',
      paddingTop: Spacing.stackSm,
      paddingBottom: 4,
    },
    txDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.white05,
    },

    emptyCard: {
      paddingVertical: Spacing.stackLg,
      paddingHorizontal: Spacing.marginMain,
      alignItems: 'center',
      gap: Spacing.stackSm,
    },
    emptyTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    emptyHint: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },

    txRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
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
  });
}
