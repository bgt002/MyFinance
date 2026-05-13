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

import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import {
  computeAccountsBreakdown,
  groupAccountsByCategory,
  initialAccounts,
  type Account,
  type AccountCategory,
} from '@/data/dummy';

import { AddAccountModal, type NewAccountInput } from './AddAccountModal';

const ACCENT_MAP = {
  primary: { color: Colors.primary, tint: Colors.primaryTint10 },
  secondary: { color: Colors.secondary, tint: Colors.secondaryTint10 },
  tertiary: { color: Colors.tertiary, tint: Colors.tertiaryTint10 },
  neutral: { color: Colors.onSurface, tint: Colors.surfaceContainerHigh },
} as const;

function formatBalance(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AccountsSection() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = useMemo(() => groupAccountsByCategory(accounts), [accounts]);
  const breakdown = useMemo(() => computeAccountsBreakdown(accounts), [accounts]);

  function handleAddAccount(input: NewAccountInput) {
    const id = `acct-${Date.now()}`;
    setAccounts((prev) => [
      ...prev,
      { ...input, id, updatedLabel: 'Just now' },
    ]);
    setModalVisible(false);
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
          {categories.map((cat) => (
            <CategoryBlock key={cat.key} category={cat} />
          ))}
        </View>
      </ScrollView>
      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddAccount}
      />
    </>
  );
}

function AddAccountButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.addBtnShadow,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.secondaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.addBtn}
      >
        <MaterialIcons name="add-circle" size={22} color={Colors.onPrimary} />
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
  return (
    <GlassCard radius={Radius.card} style={styles.balanceCard}>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownCol}>
          <Text style={styles.eyebrow}>Total Assets</Text>
          <Text style={[styles.breakdownAmount, { color: Colors.primary }]}>
            {formatBalance(assets)}
          </Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownCol}>
          <Text style={styles.eyebrow}>Total Liabilities</Text>
          <Text style={[styles.breakdownAmount, { color: Colors.tertiary }]}>
            {formatBalance(liabilities)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function CategoryBlock({ category }: { category: AccountCategory }) {
  return (
    <View>
      <View style={styles.categoryHeader}>
        <MaterialIcons
          name={category.icon}
          size={20}
          color={Colors.onSurfaceVariant}
        />
        <Text style={styles.categoryHeaderText}>{category.label}</Text>
      </View>
      <View style={{ gap: Spacing.stackMd }}>
        {category.accounts.map((acct) =>
          category.key === 'property' ? (
            <PropertyAccountCard key={acct.id} account={acct} />
          ) : (
            <AccountRow key={acct.id} account={acct} accent={category.accent} />
          ),
        )}
      </View>
    </View>
  );
}

function AccountRow({
  account,
  accent,
}: {
  account: Account;
  accent: AccountCategory['accent'];
}) {
  const a = ACCENT_MAP[accent];
  return (
    <GlassCard radius={Radius.xl} style={styles.accountRow}>
      <View style={styles.accountLeft}>
        <View style={[styles.iconBubble, { backgroundColor: a.tint }]}>
          <MaterialIcons name={account.icon} size={22} color={a.color} />
        </View>
        <View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountUpdated}>{account.updatedLabel}</Text>
        </View>
      </View>
      <Text style={styles.accountBalance}>{formatBalance(account.balance)}</Text>
    </GlassCard>
  );
}

function PropertyAccountCard({ account }: { account: Account }) {
  return (
    <GlassCard radius={Radius.xl} style={styles.propertyCard}>
      <View style={styles.propertyImageWrap}>
        <LinearGradient
          colors={['#2a3548', '#1a2236', '#131313']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <MaterialIcons
          name="home"
          size={64}
          color={Colors.onSurface}
          style={styles.propertyImageIcon}
        />
        <LinearGradient
          colors={['transparent', Colors.background]}
          style={styles.propertyImageFade}
        />
      </View>
      <View style={styles.propertyFooter}>
        <View style={styles.accountLeft}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: Colors.surfaceContainerHigh },
            ]}
          >
            <MaterialIcons name="home-work" size={22} color={Colors.onSurface} />
          </View>
          <View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountUpdated}>{account.updatedLabel}</Text>
          </View>
        </View>
        <Text style={styles.accountBalance}>{formatBalance(account.balance)}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackLg * 2,
    gap: Spacing.stackLg,
  },

  eyebrow: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.stackXs,
  },

  addBtnShadow: {
    borderRadius: Radius.xl,
    shadowColor: '#000',
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
    color: Colors.onPrimary,
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
    backgroundColor: Colors.outlineVariant,
    marginVertical: Spacing.stackMd,
  },
  breakdownAmount: {
    ...Type.displayLg,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: Spacing.stackMd,
  },
  categoryHeaderText: {
    ...Type.titleSm,
    color: Colors.onSurfaceVariant,
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
    color: Colors.onSurface,
  },
  accountUpdated: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  accountBalance: {
    ...Type.headlineMd,
    color: Colors.onSurface,
  },

  propertyCard: {
    padding: 0,
  },
  propertyImageWrap: {
    height: 128,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  propertyImageIcon: {
    opacity: 0.4,
  },
  propertyImageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  propertyFooter: {
    padding: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -32,
  },
});
