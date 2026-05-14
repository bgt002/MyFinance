import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BankLogo } from '@/components/ui/BankLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import {
  computeAccountsBreakdown,
  groupAccountsByTypeGroup,
  initialAccounts,
  type Account,
  type AccountCategory,
  type AccountGroupBlock,
  type AccountTypeGroup,
} from '@/data/dummy';
import { useThemeColors } from '@/theme';

import { AccountActionsSheet } from './AccountActionsSheet';
import { AddAccountModal, type NewAccountInput } from './AddAccountModal';

function getAccentMap(colors: ColorPalette) {
  return {
    primary: { color: colors.primary, tint: colors.primaryTint10 },
    secondary: { color: colors.secondary, tint: colors.secondaryTint10 },
    tertiary: { color: colors.tertiary, tint: colors.tertiaryTint10 },
    neutral: { color: colors.onSurface, tint: colors.surfaceContainerHigh },
  } as const;
}

function getGroupAccent(colors: ColorPalette): Record<AccountTypeGroup, string> {
  return {
    debit: colors.primary,
    credit: colors.tertiary,
    investment: colors.secondary,
  };
}

function formatBalance(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function useAccountsTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function AccountsSection() {
  const { styles } = useAccountsTheme();
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const groupBlocks = useMemo(
    () => groupAccountsByTypeGroup(accounts),
    [accounts],
  );
  const breakdown = useMemo(() => computeAccountsBreakdown(accounts), [accounts]);

  function handleAddAccount(input: NewAccountInput) {
    const id = `acct-${Date.now()}`;
    setAccounts((prev) => [
      ...prev,
      { ...input, id, updatedLabel: 'Just now' },
    ]);
    setModalVisible(false);
  }

  function handleDeleteSelected() {
    if (!selectedAccount) return;
    const id = selectedAccount.id;
    setSelectedAccount(null);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
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
        <BalanceBreakdownCard
          assets={breakdown.assets}
          liabilities={breakdown.liabilities}
        />
        <View style={{ gap: Spacing.stackLg }}>
          {groupBlocks.map((block) => (
            <GroupBlock
              key={block.key}
              block={block}
              onAccountPress={setSelectedAccount}
            />
          ))}
        </View>
      </ScrollView>

      <Fab onPress={() => setModalVisible(true)} bottomInset={insets.bottom} />

      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddAccount}
      />
      <AccountActionsSheet
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onDelete={handleDeleteSelected}
      />
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
  const { colors, styles } = useAccountsTheme();

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

function BalanceBreakdownCard({
  assets,
  liabilities,
}: {
  assets: number;
  liabilities: number;
}) {
  const { colors, styles } = useAccountsTheme();

  return (
    <GlassCard radius={Radius.card} style={styles.balanceCard}>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownCol}>
          <Text style={styles.eyebrow}>Total Assets</Text>
          <Text style={[styles.breakdownAmount, { color: colors.primary }]}>
            {formatBalance(assets)}
          </Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownCol}>
          <Text style={styles.eyebrow}>Total Liabilities</Text>
          <Text style={[styles.breakdownAmount, { color: colors.tertiary }]}>
            {formatBalance(liabilities)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function GroupBlock({
  block,
  onAccountPress,
}: {
  block: AccountGroupBlock;
  onAccountPress: (account: Account) => void;
}) {
  const { colors, styles } = useAccountsTheme();
  const groupAccent = getGroupAccent(colors);

  return (
    <View style={{ gap: Spacing.stackMd }}>
      <Text style={[styles.groupTitle, { color: groupAccent[block.key] }]}>
        {block.label}
      </Text>
      <View style={{ gap: Spacing.stackMd }}>
        {block.categories.map((cat) => (
          <CategoryBlock
            key={cat.key}
            category={cat}
            onAccountPress={onAccountPress}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryBlock({
  category,
  onAccountPress,
}: {
  category: AccountCategory;
  onAccountPress: (account: Account) => void;
}) {
  const { colors, styles } = useAccountsTheme();

  return (
    <View>
      <View style={styles.categoryHeader}>
        <MaterialIcons
          name={category.icon}
          size={20}
          color={colors.onSurfaceVariant}
        />
        <Text style={styles.categoryHeaderText}>{category.label}</Text>
      </View>
      <View style={{ gap: Spacing.stackMd }}>
        {category.accounts.map((acct) => (
          <AccountRow
            key={acct.id}
            account={acct}
            accent={category.accent}
            onPress={() => onAccountPress(acct)}
          />
        ))}
      </View>
    </View>
  );
}

function AccountRow({
  account,
  accent,
  onPress,
}: {
  account: Account;
  accent: AccountCategory['accent'];
  onPress: () => void;
}) {
  const { colors, styles } = useAccountsTheme();
  const a = getAccentMap(colors)[accent];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
      ]}
    >
      <GlassCard radius={Radius.xl} style={styles.accountRow}>
        <View style={styles.accountLeft}>
          {account.logoSlug ? (
            <BankLogo slug={account.logoSlug} size={48} />
          ) : (
            <View style={[styles.iconBubble, { backgroundColor: a.tint }]}>
              <MaterialIcons name={account.icon} size={22} color={a.color} />
            </View>
          )}
          <View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountUpdated}>{account.updatedLabel}</Text>
          </View>
        </View>
        <Text style={styles.accountBalance}>{formatBalance(account.balance)}</Text>
      </GlassCard>
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
    marginBottom: Spacing.stackXs,
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

  balanceCard: {
    padding: Spacing.marginMain,
  },
  breakdownRow: {
    flexDirection: 'column',
  },
  breakdownCol: {
    gap: Spacing.stackXs,
  },
  breakdownDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: Spacing.stackMd,
  },
  breakdownAmount: {
    ...Type.displayLg,
  },

  groupTitle: {
    ...Type.headlineMd,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: Spacing.stackMd,
  },
  categoryHeaderText: {
    ...Type.titleSm,
    color: colors.onSurfaceVariant,
  },

  accountRow: {
    padding: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    flex: 1,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    ...Type.titleSm,
    color: colors.onSurface,
  },
  accountUpdated: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  accountBalance: {
    ...Type.headlineMd,
    color: colors.onSurface,
  },
  });
}
