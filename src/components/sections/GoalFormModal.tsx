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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { useThemeColors } from '@/theme';
import type { Goal } from '@/types/goal';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

const GOAL_ICONS: MaterialIconName[] = [
  'savings',
  'shield',
  'flight',
  'directions-car',
  'home-work',
  'laptop-mac',
  'school',
  'family-restroom',
  'card-giftcard',
  'celebration',
  'fitness-center',
  'pets',
];

export type GoalFormResult = {
  title: string;
  target: number;
  saved: number;
  icon: MaterialIconName;
  description?: string;
};

type Props = {
  visible: boolean;
  goal: Goal | null; // null = add mode, set = edit mode
  onClose: () => void;
  onSubmit: (result: GoalFormResult) => void;
};

function useStyles() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function GoalFormModal({ visible, goal, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, styles } = useStyles();
  const isEdit = goal !== null;

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [icon, setIcon] = useState<MaterialIconName | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (goal) {
      setTitle(goal.title);
      setTarget(String(goal.target));
      setSaved(String(goal.saved));
      setIcon(goal.icon);
      setDescription(goal.description ?? '');
    } else {
      setTitle('');
      setTarget('');
      setSaved('');
      setIcon(null);
      setDescription('');
    }
  }, [visible, goal]);

  const parsedTarget = Number(target);
  const parsedSaved = saved ? Number(saved) : 0;
  const canSubmit =
    title.trim().length > 0 &&
    icon !== null &&
    Number.isFinite(parsedTarget) &&
    parsedTarget > 0 &&
    Number.isFinite(parsedSaved) &&
    parsedSaved >= 0;

  function handleSubmit() {
    if (!canSubmit || !icon) return;
    const result: GoalFormResult = {
      title: title.trim(),
      target: parsedTarget,
      saved: parsedSaved,
      icon,
      ...(description.trim() ? { description: description.trim() } : {}),
    };
    onSubmit(result);
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
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Goal' : 'New Goal'}</Text>
          <View style={styles.headerIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Emergency Fund"
              placeholderTextColor={colors.onSurfaceVariant}
              autoFocus={!isEdit}
              returnKeyType="next"
              style={styles.input}
            />
          </View>

          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Target</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                value={target}
                onChangeText={(s) => setTarget(s.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="decimal-pad"
                returnKeyType="next"
                style={styles.amountInput}
              />
            </View>
          </View>

          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Currently saved</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                value={saved}
                onChangeText={(s) => setSaved(s.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="decimal-pad"
                returnKeyType="next"
                style={styles.amountInput}
              />
            </View>
          </View>

          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {GOAL_ICONS.map((name) => {
                const selected = icon === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setIcon(name)}
                    style={[
                      styles.iconCell,
                      selected && {
                        backgroundColor: colors.primaryTint10,
                        borderColor: colors.primary,
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={name}
                      size={24}
                      color={selected ? colors.primary : colors.onSurfaceVariant}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. 3 months of expenses"
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              style={[styles.input, { minHeight: 64 }]}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={canSubmit ? handleSubmit : undefined}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: canSubmit ? (pressed ? 0.85 : 1) : 0.4 },
            ]}
          >
            <Text style={styles.primaryBtnText}>{isEdit ? 'Save' : 'Add Goal'}</Text>
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
      padding: Spacing.marginMain,
      gap: Spacing.stackLg,
      paddingBottom: Spacing.stackLg * 3,
    },
    label: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
    },
    input: {
      ...Type.bodyLg,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: Spacing.stackMd,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.stackSm,
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.stackMd,
      paddingVertical: Spacing.stackMd,
    },
    amountPrefix: {
      ...Type.bodyLg,
      color: colors.onSurfaceVariant,
    },
    amountInput: {
      ...Type.bodyLg,
      flex: 1,
      color: colors.onSurface,
      padding: 0,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: Spacing.stackSm,
      rowGap: Spacing.stackSm,
    },
    iconCell: {
      width: '22%',
      aspectRatio: 1,
      minHeight: 64,
      borderRadius: Radius.lg,
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.white05,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.stackMd,
    },
    footer: {
      padding: Spacing.marginMain,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.outlineVariant,
      backgroundColor: colors.background,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: Radius.pill,
      paddingVertical: Spacing.stackMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      ...Type.titleSm,
      color: colors.onPrimary,
    },
  });
}
