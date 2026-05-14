import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AddAccountButton onPress={() => setModalVisible(true)} />
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
    </>
  );
}

function AddAccountButton({ onPress }: { onPress: () => void }) {
  const { colors, styles } = useAccountsTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.addBtnShadow,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.addBtn}
      >
        <MaterialIcons name="add-circle" size={22} color={colors.onPrimary} />
        <Text style={styles.addBtnText}>Add New Account</Text>
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

  addBtnShadow: {
    borderRadius: Radius.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  addBtn: {
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
  },
  addBtnText: {
    ...Type.titleSm,
    color: colors.onPrimary,
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
