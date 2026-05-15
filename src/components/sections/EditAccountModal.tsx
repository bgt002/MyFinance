import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BankLogo } from '@/components/ui/BankLogo';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import {
  ACCOUNT_TYPES_BY_KEY,
  type Account,
  type AccountTypeGroup,
} from '@/data/dummy';
import { useThemeColors } from '@/theme';

export type EditAccountPatch = {
  name: string;
  note?: string;
  balance: number;
  creditLimit?: number;
  owed?: number;
  countInAsset?: boolean;
  hideBalance?: boolean;
};

type Props = {
  account: Account | null;
  onClose: () => void;
  onSubmit: (patch: EditAccountPatch) => void;
};

function getGroupAccent(
  colors: ColorPalette,
): Record<AccountTypeGroup, { color: string; tint: string }> {
  return {
    debit: { color: colors.primary, tint: colors.primaryTint10 },
    credit: { color: colors.tertiary, tint: colors.tertiaryTint10 },
    investment: { color: colors.secondary, tint: colors.secondaryTint10 },
  };
}

function useStyles() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function EditAccountModal({ account, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, styles } = useStyles();

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [owed, setOwed] = useState('');
  const [countInAsset, setCountInAsset] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => {
    if (!account) return;
    setName(account.name);
    setNote(account.note ?? '');
    setBalance(String(account.balance));
    setCreditLimit(account.creditLimit !== undefined ? String(account.creditLimit) : '');
    setOwed(account.owed !== undefined ? String(account.owed) : String(account.balance));
    setCountInAsset(account.countInAsset !== false);
    setHideBalance(account.hideBalance === true);
  }, [account]);

  const visible = account !== null;
  if (!account) {
    return (
      <Modal visible={false} transparent onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  const typeDef = ACCOUNT_TYPES_BY_KEY[account.type];
  const groupAccent = getGroupAccent(colors);
  const accent = typeDef ? groupAccent[typeDef.group] : groupAccent.debit;
  const isCredit = account.type === 'credit_card';
  const canSubmit = name.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    const balanceNum = balance ? Number(balance) : 0;
    const owedNum = owed ? Number(owed) : undefined;
    const creditLimitNum = creditLimit ? Number(creditLimit) : undefined;

    const finalBalance =
      isCredit && owedNum !== undefined && Number.isFinite(owedNum)
        ? owedNum
        : balanceNum;

    const patch: EditAccountPatch = {
      name: name.trim(),
      balance: finalBalance,
      countInAsset,
      hideBalance,
      ...(note.trim() ? { note: note.trim() } : { note: undefined }),
      ...(creditLimitNum !== undefined && Number.isFinite(creditLimitNum)
        ? { creditLimit: creditLimitNum }
        : {}),
      ...(owedNum !== undefined && Number.isFinite(owedNum)
        ? { owed: owedNum }
        : {}),
    };
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
          <Text style={styles.headerTitle}>Edit Account</Text>
          <View style={styles.headerIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoPreview}>
            {account.logoSlug ? (
              <BankLogo slug={account.logoSlug} size={48} />
            ) : (
              <View style={[styles.iconBubble, { backgroundColor: accent.tint }]}>
                <MaterialIcons
                  name={account.icon}
                  size={24}
                  color={accent.color}
                />
              </View>
            )}
          </View>

          <FieldGroup>
            <TextFieldRow
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Account name"
            />
            <FieldDivider />
            <TextFieldRow
              label="Note"
              value={note}
              onChange={setNote}
              placeholder="e.g. last 4 digits"
            />
          </FieldGroup>

          <FieldGroup>
            {isCredit ? (
              <>
                <NumericFieldRow
                  label="Credit Limit"
                  value={creditLimit}
                  onChange={setCreditLimit}
                />
                <FieldDivider />
                <NumericFieldRow
                  label="Owed"
                  value={owed}
                  onChange={setOwed}
                />
              </>
            ) : (
              <NumericFieldRow
                label="Balance"
                value={balance}
                onChange={setBalance}
              />
            )}
          </FieldGroup>

          <FieldGroup>
            <ToggleFieldRow
              label="Count in Asset"
              value={countInAsset}
              onChange={setCountInAsset}
            />
            <FieldDivider />
            <ToggleFieldRow
              label="Hide Balance"
              value={hideBalance}
              onChange={setHideBalance}
            />
          </FieldGroup>
        </ScrollView>

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

function FieldGroup({ children }: { children: React.ReactNode }) {
  const { styles } = useStyles();
  return <View style={styles.fieldGroup}>{children}</View>;
}

function FieldDivider() {
  const { styles } = useStyles();
  return <View style={styles.fieldDivider} />;
}

function TextFieldRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  const { colors, styles } = useStyles();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        style={styles.fieldInput}
      />
    </View>
  );
}

function NumericFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  const { colors, styles } = useStyles();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.numericPill}>
        <Text style={styles.numericCurrency}>$</Text>
        <TextInput
          value={value}
          onChangeText={(s) => onChange(s.replace(/[^0-9.\-]/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.inputPlaceholder}
          keyboardType="decimal-pad"
          style={styles.numericInput}
        />
      </View>
    </View>
  );
}

function ToggleFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  const { colors, styles } = useStyles();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
        thumbColor={value ? colors.onPrimary : colors.onSurface}
      />
    </View>
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
      paddingHorizontal: Spacing.marginMain,
      paddingTop: Spacing.stackMd,
      paddingBottom: Spacing.stackLg * 3,
      gap: Spacing.stackLg,
    },
    logoPreview: {
      alignItems: 'center',
      paddingVertical: Spacing.stackMd,
    },
    iconBubble: {
      width: 56,
      height: 56,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fieldGroup: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.xl,
      overflow: 'hidden',
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: 14,
      minHeight: 52,
      gap: Spacing.stackMd,
    },
    fieldLabel: {
      ...Type.bodyLg,
      color: colors.primary,
      flexShrink: 0,
    },
    fieldDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.outlineVariant,
      marginLeft: Spacing.stackMd,
    },
    fieldInput: {
      flex: 1,
      ...Type.bodyLg,
      color: colors.onSurface,
      textAlign: 'right',
      padding: 0,
    },
    numericPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.stackSm,
      paddingVertical: 4,
      gap: 4,
      minWidth: 64,
    },
    numericCurrency: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
    },
    numericInput: {
      color: colors.onSurface,
      fontWeight: '700',
      fontSize: 14,
      padding: 0,
      minWidth: 24,
      textAlign: 'right',
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
