import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { logCategories, type LogCategory } from '@/data/dummy';
import { useThemeColors } from '@/theme';

function getAccentMap(colors: ColorPalette) {
  return {
    primary: {
      color: colors.primary,
      tint: colors.primaryTint10,
      border: colors.primaryTint20,
    },
    secondary: {
      color: colors.secondary,
      tint: colors.secondaryTint10,
      border: colors.white05,
    },
    tertiary: {
      color: colors.tertiary,
      tint: colors.tertiaryTint10,
      border: colors.white05,
    },
    neutral: {
      color: colors.onSurfaceVariant,
      tint: colors.surfaceContainerHigh,
      border: colors.white05,
    },
  } as const;
}

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
] as const;

type KeypadKey = (typeof KEYPAD_ROWS)[number][number];

function applyKey(amount: string, key: KeypadKey): string {
  if (key === 'backspace') return amount.slice(0, -1);

  if (key === '.') {
    if (amount.includes('.')) return amount;
    if (amount === '') return '0.';
    return amount + '.';
  }

  // digit
  if (amount === '0') return key;
  if (amount.includes('.')) {
    const decimals = amount.split('.')[1] ?? '';
    if (decimals.length >= 2) return amount;
  } else if (amount.length >= 7) {
    return amount;
  }
  return amount + key;
}

function formatToday(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function useLogTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function LogSection() {
  const { styles } = useLogTheme();
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('food');
  const [note, setNote] = useState('');
  const insets = useSafeAreaInsets();

  const onKeypadPress = (key: KeypadKey) => {
    setAmount((prev) => applyKey(prev, key));
  };

  const onSubmit = () => {
    // TODO: persist transaction via repository when SQLite layer lands
    Keyboard.dismiss();
  };

  const canSubmit = amount !== '' && parseFloat(amount) > 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 64 + 24 + insets.bottom + Spacing.marginMain },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AmountDisplay amount={amount} />

        <Keypad onPress={onKeypadPress} />

        <CategoriesCard
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <View style={{ gap: Spacing.stackMd }}>
          <DateRow dateLabel={formatToday()} />
          <NoteInputCard value={note} onChange={setNote} />
        </View>
      </ScrollView>

      <SubmitButton enabled={canSubmit} onPress={onSubmit} bottomInset={insets.bottom} />
    </View>
  );
}

function AmountDisplay({ amount }: { amount: string }) {
  const { colors, styles } = useLogTheme();
  const hasValue = amount !== '';
  return (
    <View style={styles.amountSection}>
      <Text style={styles.amountEyebrow}>Amount</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amountDollar}>$</Text>
        <Text
          style={[
            styles.amountValue,
            !hasValue && { color: colors.onSurfaceVariant, opacity: 0.35 },
          ]}
        >
          {hasValue ? amount : '0.00'}
        </Text>
      </View>
    </View>
  );
}

function CategoriesCard({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { styles } = useLogTheme();

  return (
    <GlassCard radius={Radius.xl} style={styles.categoriesCard}>
      <Text style={styles.eyebrow}>Categories</Text>
      <View style={styles.categoriesGrid}>
        {logCategories.map((cat) => (
          <CategoryBubble
            key={cat.id}
            category={cat}
            selected={cat.id === selectedId}
            onPress={() => onSelect(cat.id)}
          />
        ))}
      </View>
    </GlassCard>
  );
}

function CategoryBubble({
  category,
  selected,
  onPress,
}: {
  category: LogCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, styles } = useLogTheme();
  const accent = getAccentMap(colors)[category.accent];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryItem,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      <View
        style={[
          styles.categoryBubble,
          { backgroundColor: accent.tint, borderColor: accent.border },
          selected && {
            borderColor: accent.color,
            borderWidth: 1.5,
          },
        ]}
      >
        <MaterialIcons name={category.icon} size={22} color={accent.color} />
      </View>
      <Text style={styles.categoryLabel}>{category.label}</Text>
    </Pressable>
  );
}

function DateRow({ dateLabel }: { dateLabel: string }) {
  const { colors, styles } = useLogTheme();

  return (
    <GlassCard radius={Radius.xl} style={styles.dateRow}>
      <View style={styles.dateLeft}>
        <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
    </GlassCard>
  );
}

function NoteInputCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { colors, styles } = useLogTheme();

  return (
    <GlassCard radius={Radius.xl} style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <MaterialIcons name="notes" size={20} color={colors.primary} />
        <Text style={styles.eyebrow}>Add Note</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="What was this for?"
        placeholderTextColor="rgba(187, 202, 191, 0.3)"
        multiline
        numberOfLines={2}
        style={styles.noteInput}
      />
    </GlassCard>
  );
}

function Keypad({ onPress }: { onPress: (key: KeypadKey) => void }) {
  const { styles } = useLogTheme();

  return (
    <View style={styles.keypad}>
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keypadRow}>
          {row.map((key) => (
            <KeypadButton key={key} keyValue={key} onPress={() => onPress(key)} />
          ))}
        </View>
      ))}
    </View>
  );
}

function KeypadButton({
  keyValue,
  onPress,
}: {
  keyValue: KeypadKey;
  onPress: () => void;
}) {
  const { colors, styles } = useLogTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.keypadButton,
        pressed && { transform: [{ scale: 0.95 }], opacity: 0.85 },
      ]}
    >
      <GlassCard radius={Radius.xl} style={styles.keypadCard}>
        {keyValue === 'backspace' ? (
          <MaterialIcons name="backspace" size={22} color={colors.onSurface} />
        ) : (
          <Text style={styles.keypadText}>{keyValue}</Text>
        )}
      </GlassCard>
    </Pressable>
  );
}

function SubmitButton({
  enabled,
  onPress,
  bottomInset,
}: {
  enabled: boolean;
  onPress: () => void;
  bottomInset: number;
}) {
  const { colors, styles } = useLogTheme();

  return (
    <View
      style={[
        styles.submitWrap,
        { paddingBottom: Spacing.marginMain + bottomInset },
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        style={({ pressed }) => [
          styles.submitPressable,
          { opacity: enabled ? 1 : 0.4 },
          pressed && enabled && { transform: [{ scale: 0.97 }] },
        ]}
      >
        <LinearGradient
          colors={[colors.secondaryContainer, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          <View style={styles.submitContent}>
            <MaterialIcons
              name="check-circle"
              size={22}
              color={colors.onSurface}
              style={styles.submitIcon}
            />
            <Text style={styles.submitText}>Add Transaction</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
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

  amountSection: {
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  amountEyebrow: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  amountDollar: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.6,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -1,
  },

  categoriesCard: {
    padding: Spacing.stackMd,
    gap: Spacing.stackMd,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.stackMd,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  categoryBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  categoryLabel: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  dateRow: {
    padding: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  dateText: {
    ...Type.bodyMd,
    color: colors.onSurface,
  },

  noteCard: {
    padding: Spacing.stackMd,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginBottom: Spacing.stackSm,
  },
  noteInput: {
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
    minHeight: 40,
    textAlignVertical: 'top',
  },

  keypad: {
    gap: Spacing.stackSm,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: Spacing.stackSm,
  },
  keypadButton: {
    flex: 1,
    height: 64,
  },
  keypadCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    ...Type.headlineMd,
    color: colors.onSurface,
  },

  submitWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackMd,
  },
  submitPressable: {
    width: '100%',
    borderRadius: Radius.pill,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  submitGradient: {
    height: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  submitContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 56,
  },
  submitIcon: {
    position: 'absolute',
    left: Spacing.stackLg,
  },
  submitText: {
    ...Type.titleSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  });
}
