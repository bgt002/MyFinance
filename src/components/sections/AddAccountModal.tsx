import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import {
  ACCOUNT_TYPES,
  type Account,
  type AccountTypeDef,
  type AccountTypeKey,
} from '@/data/dummy';

type Step = 'type' | 'name' | 'balance';

export type NewAccountInput = Omit<Account, 'id' | 'updatedLabel'>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewAccountInput) => void;
};

export function AddAccountModal({ visible, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('type');
  const [typeKey, setTypeKey] = useState<AccountTypeKey | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('type');
      setTypeKey(null);
      setName('');
      setBalance('');
    }
  }, [visible]);

  const selectedType = typeKey
    ? ACCOUNT_TYPES.find((t) => t.key === typeKey) ?? null
    : null;

  function handlePickType(t: AccountTypeDef) {
    setTypeKey(t.key);
    setStep('name');
  }

  function handleNameNext() {
    if (name.trim().length === 0) return;
    setStep('balance');
  }

  function handleSubmit() {
    if (!selectedType) return;
    const parsed = parseBalance(balance);
    if (parsed === null) return;
    onSubmit({
      name: name.trim(),
      balance: parsed,
      icon: selectedType.icon,
      type: selectedType.key,
      kind: selectedType.kind,
      category: selectedType.category,
    });
  }

  function handleBack() {
    if (step === 'balance') setStep('name');
    else if (step === 'name') setStep('type');
    else onClose();
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
            // iOS pageSheet already insets from the status bar, so only
            // pad the top on Android where the modal is full-screen.
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
        {step === 'name' && (
          <NameStep
            value={name}
            onChange={setName}
            onNext={handleNameNext}
            typeLabel={selectedType?.label ?? ''}
          />
        )}
        {step === 'balance' && (
          <BalanceStep
            value={balance}
            onChange={setBalance}
            onSubmit={handleSubmit}
            accountName={name}
            kind={selectedType?.kind ?? 'asset'}
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
  const title =
    step === 'type'
      ? 'New Account'
      : step === 'name'
        ? selectedType?.label ?? 'New Account'
        : selectedType?.label ?? 'New Account';

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
          color={Colors.onSurface}
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
          <MaterialIcons name="close" size={22} color={Colors.onSurfaceVariant} />
        )}
      </Pressable>
    </View>
  );
}

function TypeStep({ onPick }: { onPick: (t: AccountTypeDef) => void }) {
  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.prompt}>What type of account?</Text>
      <View style={{ gap: Spacing.stackSm }}>
        {ACCOUNT_TYPES.map((t) => (
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
                {
                  backgroundColor:
                    t.kind === 'liability'
                      ? Colors.tertiaryTint10
                      : Colors.primaryTint10,
                },
              ]}
            >
              <MaterialIcons
                name={t.icon}
                size={22}
                color={t.kind === 'liability' ? Colors.tertiary : Colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.typeLabel}>{t.label}</Text>
              <Text style={styles.typeKindLabel}>
                {t.kind === 'liability' ? 'Liability' : 'Asset'}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={Colors.onSurfaceVariant}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function NameStep({
  value,
  onChange,
  onNext,
  typeLabel,
}: {
  value: string;
  onChange: (s: string) => void;
  onNext: () => void;
  typeLabel: string;
}) {
  const canContinue = value.trim().length > 0;
  return (
    <View style={styles.body}>
      <Text style={styles.prompt}>Name this {typeLabel.toLowerCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoFocus
        placeholder={`e.g. Main ${typeLabel}`}
        placeholderTextColor={Colors.onSurfaceVariant}
        returnKeyType="next"
        onSubmitEditing={onNext}
        style={styles.input}
      />
      <PrimaryButton
        label="Next"
        disabled={!canContinue}
        onPress={onNext}
      />
    </View>
  );
}

function BalanceStep({
  value,
  onChange,
  onSubmit,
  accountName,
  kind,
}: {
  value: string;
  onChange: (s: string) => void;
  onSubmit: () => void;
  accountName: string;
  kind: 'asset' | 'liability';
}) {
  const parsed = parseBalance(value);
  const canSubmit = parsed !== null;
  return (
    <View style={styles.body}>
      <Text style={styles.prompt}>
        {kind === 'liability' ? 'How much is owed on' : 'Current balance for'}{' '}
        <Text style={styles.promptName}>{accountName}</Text>?
      </Text>
      <View style={styles.balanceInputRow}>
        <Text style={styles.balanceCurrency}>$</Text>
        <TextInput
          value={value}
          onChangeText={(s) => onChange(s.replace(/[^0-9.]/g, ''))}
          autoFocus
          placeholder="0.00"
          placeholderTextColor={Colors.onSurfaceVariant}
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          style={styles.balanceInput}
        />
      </View>
      <PrimaryButton
        label="Add Account"
        disabled={!canSubmit}
        onPress={onSubmit}
      />
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        {
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function parseBalance(raw: string): number | null {
  if (raw.trim().length === 0) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackMd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Type.titleSm,
    color: Colors.onSurface,
  },
  body: {
    padding: Spacing.marginMain,
    gap: Spacing.stackLg,
  },
  prompt: {
    ...Type.headlineMd,
    color: Colors.onSurface,
  },
  promptName: {
    color: Colors.primary,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    padding: Spacing.stackMd,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceContainer,
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
    color: Colors.onSurface,
  },
  typeKindLabel: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },

  input: {
    ...Type.bodyLg,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackMd,
  },

  balanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackMd,
  },
  balanceCurrency: {
    ...Type.headlineMd,
    color: Colors.onSurfaceVariant,
  },
  balanceInput: {
    ...Type.headlineMd,
    color: Colors.onSurface,
    flex: 1,
    padding: 0,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.stackMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    ...Type.titleSm,
    color: Colors.onPrimary,
  },
});
