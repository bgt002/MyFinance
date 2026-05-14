import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
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
  ACCOUNT_TYPE_GROUPS,
  ACCOUNT_TYPES,
  type Account,
  type AccountTypeDef,
  type AccountTypeGroup,
  type AccountTypeKey,
} from '@/data/dummy';
import { useThemeColors } from '@/theme';
import { LOGO_REGISTRY, type LogoSlug } from '@/utils/logoRegistry';

type Step = 'type' | 'bank' | 'details';

export type NewAccountInput = Omit<Account, 'id' | 'updatedLabel'>;

function getGroupAccent(
  colors: ColorPalette,
): Record<AccountTypeGroup, { color: string; tint: string }> {
  return {
    debit: { color: colors.primary, tint: colors.primaryTint10 },
    credit: { color: colors.tertiary, tint: colors.tertiaryTint10 },
    investment: { color: colors.secondary, tint: colors.secondaryTint10 },
  };
}

function useAddAccountTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

function requiresBankPicker(typeKey: AccountTypeKey | null): boolean {
  return typeKey === 'debit_card' || typeKey === 'credit_card';
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewAccountInput) => void;
};

export function AddAccountModal({ visible, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const { styles } = useAddAccountTheme();

  const [step, setStep] = useState<Step>('type');
  const [typeKey, setTypeKey] = useState<AccountTypeKey | null>(null);
  const [logoSlug, setLogoSlug] = useState<LogoSlug | null>(null);

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [owed, setOwed] = useState('');
  const [reminder, setReminder] = useState(false);
  const [countInAsset, setCountInAsset] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep('type');
      setTypeKey(null);
      setLogoSlug(null);
      setName('');
      setNote('');
      setBalance('');
      setCreditLimit('');
      setOwed('');
      setReminder(false);
      setCountInAsset(true);
      setHideBalance(false);
    }
  }, [visible]);

  const selectedType = typeKey
    ? ACCOUNT_TYPES.find((t) => t.key === typeKey) ?? null
    : null;

  function handlePickType(t: AccountTypeDef) {
    setTypeKey(t.key);
    setName('');
    setStep(requiresBankPicker(t.key) ? 'bank' : 'details');
  }

  function handlePickLogo(slug: LogoSlug | null) {
    setLogoSlug(slug);
    if (slug) {
      setName(LOGO_REGISTRY[slug].label);
    }
    setStep('details');
  }

  function handleBack() {
    if (step === 'details') {
      setStep(requiresBankPicker(typeKey) ? 'bank' : 'type');
    } else if (step === 'bank') {
      setStep('type');
    } else {
      onClose();
    }
  }

  function handleSubmit() {
    if (!selectedType) return;
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;

    const isCredit = selectedType.key === 'credit_card';
    const owedNum = owed ? Number(owed) : undefined;
    const creditLimitNum = creditLimit ? Number(creditLimit) : undefined;
    const balanceNum = balance ? Number(balance) : 0;

    // For credit cards we treat "Owed" as the displayed balance.
    const finalBalance =
      isCredit && owedNum !== undefined ? owedNum : balanceNum;

    const input: NewAccountInput = {
      name: trimmedName,
      icon: selectedType.icon,
      type: selectedType.key,
      kind: selectedType.kind,
      category: selectedType.category,
      balance: finalBalance,
      countInAsset,
      hideBalance,
      ...(logoSlug ? { logoSlug } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(creditLimitNum !== undefined && Number.isFinite(creditLimitNum)
        ? { creditLimit: creditLimitNum }
        : {}),
      ...(owedNum !== undefined && Number.isFinite(owedNum)
        ? { owed: owedNum }
        : {}),
    };
    onSubmit(input);
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
        <Header
          step={step}
          onBack={handleBack}
          onClose={onClose}
          selectedType={selectedType}
        />
        {step === 'type' && <TypeStep onPick={handlePickType} />}
        {step === 'bank' && (
          <BankPickerStep
            onPick={(slug) => handlePickLogo(slug)}
            onSkip={() => handlePickLogo(null)}
          />
        )}
        {step === 'details' && selectedType && (
          <DetailsStep
            selectedType={selectedType}
            logoSlug={logoSlug}
            name={name}
            note={note}
            balance={balance}
            creditLimit={creditLimit}
            owed={owed}
            reminder={reminder}
            countInAsset={countInAsset}
            hideBalance={hideBalance}
            onChangeName={setName}
            onChangeNote={setNote}
            onChangeBalance={setBalance}
            onChangeCreditLimit={setCreditLimit}
            onChangeOwed={setOwed}
            onChangeReminder={setReminder}
            onChangeCountInAsset={setCountInAsset}
            onChangeHideBalance={setHideBalance}
            onSubmit={handleSubmit}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Header({
  step,
  onBack,
  onClose,
  selectedType,
}: {
  step: Step;
  onBack: () => void;
  onClose: () => void;
  selectedType: AccountTypeDef | null;
}) {
  const { colors, styles } = useAddAccountTheme();
  const title =
    step === 'type'
      ? 'New Account'
      : step === 'bank'
        ? selectedType?.label ?? 'Pick Issuer'
        : 'Add Account';
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={({ pressed }) => [
          styles.headerIcon,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <MaterialIcons
          name={step === 'type' ? 'close' : 'arrow-back'}
          size={24}
          color={colors.onSurface}
        />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={({ pressed }) => [
          styles.headerIcon,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        {step !== 'type' && (
          <MaterialIcons name="close" size={22} color={colors.onSurfaceVariant} />
        )}
      </Pressable>
    </View>
  );
}

function TypeStep({ onPick }: { onPick: (t: AccountTypeDef) => void }) {
  const { colors, styles } = useAddAccountTheme();
  const groupAccent = getGroupAccent(colors);

  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.prompt}>What type of account?</Text>
      <View style={{ gap: Spacing.stackLg }}>
        {ACCOUNT_TYPE_GROUPS.map((group) => {
          const accent = groupAccent[group.key];
          const types = ACCOUNT_TYPES.filter((t) => t.group === group.key);
          return (
            <View key={group.key} style={{ gap: Spacing.stackSm }}>
              <Text style={styles.groupHeader}>{group.label}</Text>
              <View style={{ gap: Spacing.stackSm }}>
                {types.map((t) => (
                  <Pressable
                    key={t.key}
                    onPress={() => onPick(t)}
                    style={({ pressed }) => [
                      styles.typeRow,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <View
                      style={[
                        styles.typeIconBubble,
                        { backgroundColor: accent.tint },
                      ]}
                    >
                      <MaterialIcons
                        name={t.icon}
                        size={22}
                        color={accent.color}
                      />
                    </View>
                    <Text style={[styles.typeLabel, { flex: 1 }]}>
                      {t.label}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ----- Bank picker -----

type BankRow = { slug: LogoSlug; label: string };

const ALL_BANK_OPTIONS: BankRow[] = (Object.keys(LOGO_REGISTRY) as LogoSlug[])
  .map((slug) => ({ slug, label: LOGO_REGISTRY[slug].label }))
  .sort((a, b) => a.label.localeCompare(b.label));

function getSectionKey(label: string): string {
  const first = label.charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

function groupAlphabetically(
  rows: BankRow[],
): { title: string; data: BankRow[] }[] {
  const map: Record<string, BankRow[]> = {};
  for (const row of rows) {
    const key = getSectionKey(row.label);
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return Object.entries(map)
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
    .map(([title, data]) => ({ title, data }));
}

function BankPickerStep({
  onPick,
  onSkip,
}: {
  onPick: (slug: LogoSlug) => void;
  onSkip: () => void;
}) {
  const { colors, styles } = useAddAccountTheme();
  const [query, setQuery] = useState('');
  const listRef = useRef<SectionList<BankRow>>(null);

  const sections = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? ALL_BANK_OPTIONS.filter((o) => o.label.toLowerCase().includes(trimmed))
      : ALL_BANK_OPTIONS;
    return groupAlphabetically(filtered);
  }, [query]);

  const availableLetters = sections.map((s) => s.title);

  function jumpToLetter(letter: string) {
    const idx = sections.findIndex((s) => s.title === letter);
    if (idx >= 0 && listRef.current) {
      try {
        listRef.current.scrollToLocation({
          sectionIndex: idx,
          itemIndex: 0,
          animated: true,
          viewPosition: 0,
        });
      } catch {
        // virtualized list may fail; harmless
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={colors.inputPlaceholder}
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.searchInput}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{ paddingBottom: Spacing.stackLg }}
          stickySectionHeadersEnabled
          ListHeaderComponent={
            <Pressable
              onPress={onSkip}
              style={({ pressed }) => [
                styles.bankRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={styles.bankRowCustomIcon}>
                <MaterialIcons
                  name="more-horiz"
                  size={20}
                  color={colors.onSurface}
                />
              </View>
              <Text style={styles.bankRowLabel}>Other / Custom</Text>
            </Pressable>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPick(item.slug)}
              style={({ pressed }) => [
                styles.bankRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <BankLogo slug={item.slug} size={32} />
              <Text style={styles.bankRowLabel}>{item.label}</Text>
            </Pressable>
          )}
          onScrollToIndexFailed={() => {
            // ignore; will scroll on next attempt as items get measured
          }}
          style={{ flex: 1 }}
        />

        <View style={styles.alphabetIndex}>
          {availableLetters.map((letter) => (
            <Pressable
              key={letter}
              onPress={() => jumpToLetter(letter)}
              hitSlop={4}
              style={({ pressed }) => [
                styles.alphabetLetter,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Text style={styles.alphabetLetterText}>{letter}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// ----- Details step -----

function DetailsStep({
  selectedType,
  logoSlug,
  name,
  note,
  balance,
  creditLimit,
  owed,
  reminder,
  countInAsset,
  hideBalance,
  onChangeName,
  onChangeNote,
  onChangeBalance,
  onChangeCreditLimit,
  onChangeOwed,
  onChangeReminder,
  onChangeCountInAsset,
  onChangeHideBalance,
  onSubmit,
}: {
  selectedType: AccountTypeDef;
  logoSlug: LogoSlug | null;
  name: string;
  note: string;
  balance: string;
  creditLimit: string;
  owed: string;
  reminder: boolean;
  countInAsset: boolean;
  hideBalance: boolean;
  onChangeName: (s: string) => void;
  onChangeNote: (s: string) => void;
  onChangeBalance: (s: string) => void;
  onChangeCreditLimit: (s: string) => void;
  onChangeOwed: (s: string) => void;
  onChangeReminder: (b: boolean) => void;
  onChangeCountInAsset: (b: boolean) => void;
  onChangeHideBalance: (b: boolean) => void;
  onSubmit: () => void;
}) {
  const { colors, styles } = useAddAccountTheme();
  const groupAccent = getGroupAccent(colors);
  const isCredit = selectedType.key === 'credit_card';
  const canSubmit = name.trim().length > 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.detailsBody}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {logoSlug && (
          <View style={styles.logoPreview}>
            <BankLogo slug={logoSlug} size={56} />
          </View>
        )}

        <FieldGroup>
          <TextFieldRow
            label="Name"
            value={name}
            onChange={onChangeName}
            placeholder="Account name"
          />
          <FieldDivider />
          <TextFieldRow
            label="Note"
            value={note}
            onChange={onChangeNote}
            placeholder="e.g. last 4 digits"
          />
        </FieldGroup>

        <FieldGroup>
          <StaticFieldRow label="Currency" value="🇺🇸 USD" />
          {isCredit ? (
            <>
              <FieldDivider />
              <NumericFieldRow
                label="Credit Limit"
                value={creditLimit}
                onChange={onChangeCreditLimit}
              />
              <FieldDivider />
              <NumericFieldRow
                label="Owed"
                value={owed}
                onChange={onChangeOwed}
              />
            </>
          ) : (
            <>
              <FieldDivider />
              <NumericFieldRow
                label="Balance"
                value={balance}
                onChange={onChangeBalance}
              />
            </>
          )}
        </FieldGroup>

        {isCredit && (
          <FieldGroup>
            <StaticFieldRow label="Billing Date" value="None" />
            <FieldDivider />
            <StaticFieldRow label="Due Date" value="None" />
            <FieldDivider />
            <ToggleFieldRow
              label="Reminder"
              value={reminder}
              onChange={onChangeReminder}
            />
          </FieldGroup>
        )}

        <FieldGroup>
          <ColorFieldRow
            label="Chart Color"
            color={groupAccent[selectedType.group].color}
          />
          <FieldDivider />
          <ToggleFieldRow
            label="Count in Asset"
            value={countInAsset}
            onChange={onChangeCountInAsset}
          />
          <FieldDivider />
          <ToggleFieldRow
            label="Hide Balance"
            value={hideBalance}
            onChange={onChangeHideBalance}
          />
        </FieldGroup>
      </ScrollView>

      <View style={styles.submitFooter}>
        <Pressable
          onPress={canSubmit ? onSubmit : undefined}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: canSubmit ? (pressed ? 0.85 : 1) : 0.4 },
          ]}
        >
          <Text style={styles.submitBtnText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  const { styles } = useAddAccountTheme();
  return <View style={styles.fieldGroup}>{children}</View>;
}

function FieldDivider() {
  const { styles } = useAddAccountTheme();
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
  const { colors, styles } = useAddAccountTheme();
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
  const { colors, styles } = useAddAccountTheme();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.numericPill}>
        <Text style={styles.numericCurrency}>$</Text>
        <TextInput
          value={value}
          onChangeText={(s) => onChange(s.replace(/[^0-9.]/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.inputPlaceholder}
          keyboardType="decimal-pad"
          style={styles.numericInput}
        />
      </View>
    </View>
  );
}

function StaticFieldRow({ label, value }: { label: string; value: string }) {
  const { styles } = useAddAccountTheme();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.staticPill}>
        <Text style={styles.staticPillText}>{value}</Text>
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
  const { colors, styles } = useAddAccountTheme();
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

function ColorFieldRow({ label, color }: { label: string; color: string }) {
  const { styles } = useAddAccountTheme();
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.colorDot, { backgroundColor: color }]} />
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
    padding: Spacing.marginMain,
    gap: Spacing.stackLg,
  },
  prompt: {
    ...Type.headlineMd,
    color: colors.onSurface,
  },
  groupHeader: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
    paddingHorizontal: Spacing.stackXs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    padding: Spacing.stackMd,
    borderRadius: Radius.xl,
    backgroundColor: colors.surfaceContainer,
  },
  typeIconBubble: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    ...Type.titleSm,
    color: colors.onSurface,
  },

  // Bank picker
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    backgroundColor: colors.surfaceContainer,
    marginHorizontal: Spacing.marginMain,
    marginTop: Spacing.stackMd,
    marginBottom: Spacing.stackSm,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 16,
    padding: 0,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackXs,
    backgroundColor: colors.background,
  },
  sectionHeaderText: {
    ...Type.labelCaps,
    color: colors.primary,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    paddingHorizontal: Spacing.marginMain,
    paddingVertical: 10,
  },
  bankRowCustomIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankRowLabel: {
    ...Type.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  alphabetIndex: {
    width: 18,
    paddingRight: Spacing.stackXs,
    paddingVertical: Spacing.stackMd,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  alphabetLetter: {
    paddingVertical: 1,
  },
  alphabetLetterText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },

  // Details form
  detailsBody: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackLg * 3,
    gap: Spacing.stackLg,
  },
  logoPreview: {
    alignItems: 'center',
    paddingVertical: Spacing.stackMd,
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
  staticPill: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: 4,
  },
  staticPillText: {
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 14,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  submitFooter: {
    padding: Spacing.marginMain,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.stackMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    ...Type.titleSm,
    color: colors.onPrimary,
  },
  });
}
