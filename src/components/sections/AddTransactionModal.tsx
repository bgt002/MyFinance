import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BankLogo } from '@/components/ui/BankLogo';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { type Account } from '@/data/dummy';
import { useThemeColors } from '@/theme';
import { type LogoSlug } from '@/utils/logoRegistry';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type TransactionKind = 'spend' | 'gain';
export type SplitMode = 'single' | 'split';
export type SplitUnit = 'percent' | 'dollar';

export type Allocation = {
  accountId: string | null;
  amount: number;
};

export type NewTransactionInput = {
  kind: TransactionKind;
  category: string;
  amount: number;
  allocations: Allocation[];
};

type SplitEntry = { value: string; isRemainder: boolean };

type Props = {
  visible: boolean;
  kind: TransactionKind;
  category: string;
  categoryIcon: MaterialIconName;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (input: NewTransactionInput) => void;
};

export function AddTransactionModal({
  visible,
  kind,
  category,
  categoryIcon,
  accounts,
  onClose,
  onSubmit,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [mode, setMode] = useState<SplitMode>('single');
  const [unit, setUnit] = useState<SplitUnit>('percent');
  const [splits, setSplits] = useState<Record<string, SplitEntry>>({});

  useEffect(() => {
    if (visible) {
      setAmount('');
      setAccountId(null);
      setMode('single');
      setUnit('percent');
      setSplits({});
    }
  }, [visible]);

  const parsedAmount = parseFloat(amount.replace(/,/g, ''));
  const amountValid = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const isGain = kind === 'gain';
  const accentColor = isGain ? colors.primary : colors.error;
  const onAccentColor = isGain ? colors.onPrimary : colors.onError;
  const accountsLabel = isGain ? 'Deposit to' : 'Pay with';
  const noAccountLabel = isGain ? 'No account' : 'No card';
  const submitLabel = isGain ? 'Add Gain' : 'Add Spend';
  const splitAvailable = isGain && accounts.length >= 2;

  const splitResult = useMemo<{
    allocations: Allocation[];
    error: string | null;
    remainderValue: number;
  }>(() => {
    if (mode === 'single') {
      return {
        allocations: amountValid
          ? [{ accountId, amount: parsedAmount }]
          : [],
        error: null,
        remainderValue: 0,
      };
    }

    const entries = Object.entries(splits);
    if (entries.length === 0) {
      return {
        allocations: [],
        error: 'Pick at least one destination',
        remainderValue: 0,
      };
    }
    if (!amountValid) {
      return { allocations: [], error: null, remainderValue: 0 };
    }

    const cap = unit === 'percent' ? 100 : parsedAmount;
    let fixedSum = 0;
    let remainderKey: string | null = null;
    const fixed: { accountId: string; value: number }[] = [];

    for (const [k, v] of entries) {
      if (v.isRemainder) {
        remainderKey = k;
        continue;
      }
      const num = parseFloat(v.value.replace(/,/g, ''));
      if (Number.isNaN(num) || num <= 0) {
        return {
          allocations: [],
          error: 'Enter a value for each destination',
          remainderValue: 0,
        };
      }
      fixedSum += num;
      fixed.push({ accountId: k, value: num });
    }

    if (fixedSum > cap + 0.01) {
      return {
        allocations: [],
        error: unit === 'percent' ? 'Split exceeds 100%' : 'Split exceeds total',
        remainderValue: 0,
      };
    }

    const remainder = cap - fixedSum;
    if (remainderKey === null && Math.abs(remainder) > 0.01) {
      const need =
        unit === 'percent'
          ? `${remainder.toFixed(1)}% unallocated`
          : `$${remainder.toFixed(2)} unallocated`;
      return { allocations: [], error: need, remainderValue: 0 };
    }
    if (remainderKey !== null && remainder <= 0.01) {
      return {
        allocations: [],
        error: 'No remainder left',
        remainderValue: 0,
      };
    }

    const toDollars = (v: number) =>
      unit === 'percent' ? (v / 100) * parsedAmount : v;

    const allocations: Allocation[] = fixed.map((f) => ({
      accountId: f.accountId,
      amount: toDollars(f.value),
    }));
    if (remainderKey !== null) {
      allocations.push({
        accountId: remainderKey,
        amount: toDollars(remainder),
      });
    }

    return { allocations, error: null, remainderValue: remainder };
  }, [mode, accountId, splits, unit, parsedAmount, amountValid]);

  const canSubmit =
    amountValid &&
    splitResult.error === null &&
    splitResult.allocations.length > 0;

  function toggleSplitInclude(id: string) {
    setSplits((prev) => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        next[id] = { value: '', isRemainder: false };
      }
      return next;
    });
  }

  function setSplitValue(id: string, value: string) {
    setSplits((prev) => ({
      ...prev,
      [id]: { value, isRemainder: prev[id]?.isRemainder ?? false },
    }));
  }

  function toggleSplitRemainder(id: string) {
    setSplits((prev) => {
      if (!(id in prev)) return prev;
      const nextOn = !prev[id].isRemainder;
      const next: Record<string, SplitEntry> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = {
          ...v,
          isRemainder: k === id ? nextOn : nextOn ? false : v.isRemainder,
        };
      }
      return next;
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      kind,
      category,
      amount: parsedAmount,
      allocations: splitResult.allocations,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Pressable onPress={() => {}} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBubble}>
                <MaterialIcons
                  name={categoryIcon}
                  size={20}
                  color={accentColor}
                />
              </View>
              <Text style={styles.title}>{category}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <MaterialIcons name="close" size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.field}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="decimal-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={styles.amountInput}
                />
              </View>
            </View>

            {accounts.length > 0 && (
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.label}>{accountsLabel}</Text>
                  {splitAvailable && (
                    <SegmentedToggle
                      options={[
                        { key: 'single', label: 'Single' },
                        { key: 'split', label: 'Split' },
                      ]}
                      value={mode}
                      onChange={(v) => setMode(v as SplitMode)}
                      accentColor={accentColor}
                    />
                  )}
                </View>

                {mode === 'single' ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                    keyboardShouldPersistTaps="handled"
                  >
                    <AccountChip
                      selected={accountId === null}
                      onPress={() => setAccountId(null)}
                      label={noAccountLabel}
                      accentColor={accentColor}
                    />
                    {accounts.map((a) => (
                      <AccountChip
                        key={a.id}
                        selected={a.id === accountId}
                        onPress={() => setAccountId(a.id)}
                        label={a.name}
                        icon={a.icon}
                        logoSlug={a.logoSlug}
                        accentColor={accentColor}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={{ gap: Spacing.stackSm }}>
                    <View style={styles.unitToggleRow}>
                      <SegmentedToggle
                        options={[
                          { key: 'percent', label: '%' },
                          { key: 'dollar', label: '$' },
                        ]}
                        value={unit}
                        onChange={(v) => setUnit(v as SplitUnit)}
                        accentColor={accentColor}
                      />
                    </View>
                    <View style={styles.splitList}>
                      {accounts.map((a) => {
                        const entry = splits[a.id];
                        const included = entry !== undefined;
                        const isRemainder = entry?.isRemainder ?? false;
                        const displayedRemainder =
                          isRemainder && splitResult.error === null
                            ? splitResult.remainderValue
                            : null;
                        return (
                          <SplitRow
                            key={a.id}
                            account={a}
                            included={included}
                            value={entry?.value ?? ''}
                            isRemainder={isRemainder}
                            unit={unit}
                            displayedRemainder={displayedRemainder}
                            accentColor={accentColor}
                            onToggleInclude={() => toggleSplitInclude(a.id)}
                            onValueChange={(v) => setSplitValue(a.id, v)}
                            onToggleRemainder={() =>
                              toggleSplitRemainder(a.id)
                            }
                          />
                        );
                      })}
                    </View>
                    {splitResult.error !== null && (
                      <Text
                        style={[styles.splitStatus, { color: colors.error }]}
                      >
                        {splitResult.error}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <Pressable
            onPress={canSubmit ? handleSubmit : undefined}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: accentColor,
                opacity: canSubmit ? (pressed ? 0.85 : 1) : 0.4,
              },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: onAccentColor }]}>
              {submitLabel}
            </Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  accentColor,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  accentColor: string;
}) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: Radius.pill,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: Spacing.stackMd,
              paddingVertical: 6,
              borderRadius: Radius.pill,
              backgroundColor: active ? accentColor : 'transparent',
            }}
          >
            <Text
              style={{
                ...Type.labelCaps,
                fontSize: 11,
                color: active ? colors.background : colors.onSurfaceVariant,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SplitRow({
  account,
  included,
  value,
  isRemainder,
  unit,
  displayedRemainder,
  accentColor,
  onToggleInclude,
  onValueChange,
  onToggleRemainder,
}: {
  account: Account;
  included: boolean;
  value: string;
  isRemainder: boolean;
  unit: SplitUnit;
  displayedRemainder: number | null;
  accentColor: string;
  onToggleInclude: () => void;
  onValueChange: (v: string) => void;
  onToggleRemainder: () => void;
}) {
  const colors = useThemeColors();
  const unitLabel = unit === 'percent' ? '%' : '$';
  return (
    <View style={[styles.splitRow, included && { borderColor: accentColor }]}>
      <Pressable
        onPress={onToggleInclude}
        style={styles.splitRowLeft}
        hitSlop={4}
      >
        <View
          style={[
            styles.checkbox,
            included && {
              backgroundColor: accentColor,
              borderColor: accentColor,
            },
            !included && { borderColor: colors.outlineVariant },
          ]}
        >
          {included && (
            <MaterialIcons name="check" size={14} color={colors.background} />
          )}
        </View>
        {account.logoSlug ? (
          <BankLogo slug={account.logoSlug} size={24} />
        ) : (
          <MaterialIcons
            name={account.icon}
            size={20}
            color={colors.onSurfaceVariant}
          />
        )}
        <Text
          style={[styles.splitRowName, { color: colors.onSurface }]}
          numberOfLines={1}
        >
          {account.name}
        </Text>
      </Pressable>
      {included && (
        <View style={styles.splitRowRight}>
          {isRemainder ? (
            <Text style={[styles.remainderValue, { color: accentColor }]}>
              {displayedRemainder !== null
                ? unit === 'percent'
                  ? `${displayedRemainder.toFixed(1)}${unitLabel}`
                  : `${unitLabel}${displayedRemainder.toFixed(2)}`
                : `—${unitLabel}`}
            </Text>
          ) : (
            <View style={styles.splitInputWrap}>
              <TextInput
                value={value}
                onChangeText={onValueChange}
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="decimal-pad"
                style={[styles.splitInput, { color: colors.onSurface }]}
              />
              <Text
                style={[styles.splitUnit, { color: colors.onSurfaceVariant }]}
              >
                {unitLabel}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onToggleRemainder}
            hitSlop={4}
            style={({ pressed }) => [
              styles.restBtn,
              {
                backgroundColor: isRemainder
                  ? accentColor
                  : colors.surfaceContainerHigh,
                borderColor: isRemainder ? accentColor : colors.white05,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                ...Type.labelCaps,
                fontSize: 9,
                color: isRemainder ? colors.background : colors.onSurfaceVariant,
              }}
            >
              Rest
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function AccountChip({
  selected,
  onPress,
  label,
  icon,
  logoSlug,
  accentColor,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  icon?: MaterialIconName;
  logoSlug?: LogoSlug;
  accentColor: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.stackSm,
          paddingHorizontal: Spacing.stackMd,
          paddingVertical: Spacing.stackSm,
          borderRadius: Radius.pill,
          borderWidth: StyleSheet.hairlineWidth,
          backgroundColor: selected
            ? colors.primaryTint10
            : colors.surfaceContainerHigh,
          borderColor: selected ? accentColor : colors.white05,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {logoSlug ? (
        <BankLogo slug={logoSlug} size={20} />
      ) : icon ? (
        <MaterialIcons
          name={icon}
          size={18}
          color={selected ? accentColor : colors.onSurfaceVariant}
        />
      ) : null}
      <Text
        style={{
          ...Type.bodyMd,
          color: selected ? accentColor : colors.onSurface,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.stackSm,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    borderRadius: Radius.xl,
  },
  splitRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    flex: 1,
  },
  splitRowName: {
    ...Type.bodyMd,
    fontWeight: '600',
    flex: 1,
  },
  splitRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 72,
  },
  splitInput: {
    ...Type.bodyMd,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 48,
    padding: 0,
  },
  splitUnit: {
    ...Type.bodyMd,
    fontWeight: '600',
    marginLeft: 2,
  },
  remainderValue: {
    ...Type.bodyMd,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'right',
  },
  restBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: Spacing.marginMain,
    },
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.cardLg,
      padding: Spacing.marginMain,
      gap: Spacing.stackLg,
      maxHeight: '85%',
    },
    scroll: {
      flexGrow: 0,
    },
    body: {
      gap: Spacing.stackLg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      flex: 1,
    },
    iconBubble: {
      width: 36,
      height: 36,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainerHigh,
    },
    title: {
      ...Type.titleSm,
      color: colors.onSurface,
      flex: 1,
    },
    closeBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    field: {
      gap: Spacing.stackSm,
    },
    fieldHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: Spacing.stackMd,
    },
    currencySymbol: {
      ...Type.headlineMd,
      color: colors.onSurfaceVariant,
    },
    amountInput: {
      ...Type.headlineMd,
      flex: 1,
      color: colors.onSurface,
      padding: 0,
    },
    chipsRow: {
      gap: Spacing.stackSm,
      paddingVertical: 2,
    },
    unitToggleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    splitList: {
      gap: 4,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Radius.xl,
      padding: 4,
    },
    splitStatus: {
      ...Type.bodyMd,
      fontWeight: '600',
    },
    primaryBtn: {
      borderRadius: Radius.xl,
      paddingVertical: Spacing.stackMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      ...Type.titleSm,
    },
  });
}
