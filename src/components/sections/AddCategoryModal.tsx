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
import { useThemeColors } from '@/theme';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

const SPEND_ICONS: MaterialIconName[] = [
  'restaurant',
  'home',
  'directions-car',
  'shopping-bag',
  'local-cafe',
  'medical-services',
  'school',
  'fitness-center',
  'flight',
  'pets',
  'palette',
  'bolt',
];

const GAIN_ICONS: MaterialIconName[] = [
  'payments',
  'trending-up',
  'business',
  'redeem',
  'savings',
  'work',
  'attach-money',
  'card-giftcard',
];

export type CategoryKind = 'spend' | 'gain';

export type NewCategoryInput = {
  name: string;
  icon: MaterialIconName;
  kind: CategoryKind;
};

type Props = {
  visible: boolean;
  kind: CategoryKind;
  onClose: () => void;
  onSubmit: (input: NewCategoryInput) => void;
};

export function AddCategoryModal({ visible, kind, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<MaterialIconName | null>(null);

  useEffect(() => {
    if (visible) {
      setName('');
      setIcon(null);
    }
  }, [visible]);

  const icons = kind === 'gain' ? GAIN_ICONS : SPEND_ICONS;
  const accentColor = kind === 'gain' ? colors.primary : colors.error;
  const canSubmit = name.trim().length > 0 && icon !== null;

  function handleSubmit() {
    if (!canSubmit || !icon) return;
    onSubmit({ name: name.trim(), icon, kind });
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
          <Text style={styles.headerTitle}>
            New {kind === 'gain' ? 'Gain' : 'Spend'} Category
          </Text>
          <View style={styles.headerIcon} />
        </View>

        <View style={styles.body}>
          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={kind === 'gain' ? 'e.g. Freelance' : 'e.g. Coffee'}
              placeholderTextColor={colors.onSurfaceVariant}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              style={styles.input}
            />
          </View>

          <View style={{ gap: Spacing.stackSm }}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {icons.map((name) => {
                const selected = icon === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setIcon(name)}
                    style={[
                      styles.iconCell,
                      selected && {
                        backgroundColor:
                          kind === 'gain'
                            ? colors.primaryTint10
                            : colors.surfaceContainerHigh,
                        borderColor: accentColor,
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={name}
                      size={24}
                      color={selected ? accentColor : colors.onSurfaceVariant}
                      style={styles.iconGlyph}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

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
            <Text
              style={[
                styles.primaryBtnText,
                { color: kind === 'gain' ? colors.onPrimary : colors.onError },
              ]}
            >
              Add Category
            </Text>
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
    iconGlyph: {
      width: 24,
      height: 24,
      lineHeight: 24,
      textAlign: 'center',
      textAlignVertical: 'center',
      includeFontPadding: false,
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
