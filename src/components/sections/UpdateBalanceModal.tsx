import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { type Account } from '@/data/dummy';
import { useThemeColors } from '@/theme';

export type BalancePatch = {
  balance: number;
  // For credit cards, owed mirrors balance so the UI display stays consistent
  // with how AddAccountModal treats credit-card balance.
  owed?: number;
};

type Props = {
  account: Account | null;
  onClose: () => void;
  onSubmit: (patch: BalancePatch) => void;
};

function useStyles() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

function formatBalance(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function UpdateBalanceModal({ account, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, styles } = useStyles();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (account) {
      setValue(String(account.balance));
    }
  }, [account]);

  const visible = account !== null;
  if (!account) {
    return (
      <Modal visible={false} transparent onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  const parsed = Number(value);
  const canSubmit = value.trim().length > 0 && Number.isFinite(parsed);
  const isCredit = account.type === 'credit_card';

  function handleSubmit() {
    if (!canSubmit) return;
    const patch: BalancePatch = { balance: parsed };
    if (isCredit) patch.owed = parsed;
    onSubmit(patch);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'android' ? insets.top : 0,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerIcon,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialIcons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Update Balance</Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.body}>
          <View style={styles.accountSummary}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.currentLabel}>
              Current: {formatBalance(account.balance)}
            </Text>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>
              {isCredit ? 'New owed amount' : 'New balance'}
            </Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                value={value}
                onChangeText={(s) => setValue(s.replace(/[^0-9.\-]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={canSubmit ? handleSubmit : undefined}
            style={({ pressed }) => [
              styles.saveBtn,
              { opacity: canSubmit ? (pressed ? 0.85 : 1) : 0.4 },
            ]}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.marginMain,
      paddingTop: Spacing.stackMd,
      paddingBottom: Spacing.stackMd,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    headerIcon: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    body: {
      flex: 1,
      padding: Spacing.marginMain,
      gap: Spacing.stackLg,
    },
    accountSummary: {
      gap: Spacing.stackXs,
    },
    accountName: {
      ...Type.headlineMd,
      color: colors.onSurface,
    },
    currentLabel: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
    },
    inputWrap: {
      gap: Spacing.stackSm,
    },
    inputLabel: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: Spacing.stackMd,
    },
    currencySymbol: {
      ...Type.headlineMd,
      color: colors.onSurfaceVariant,
    },
    input: {
      flex: 1,
      ...Type.headlineMd,
      color: colors.onSurface,
      padding: 0,
    },
    footer: {
      padding: Spacing.marginMain,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outlineVariant,
      backgroundColor: colors.background,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radius.pill,
      paddingVertical: Spacing.stackMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: {
      ...Type.titleSm,
      color: colors.onPrimary,
    },
  });
}
