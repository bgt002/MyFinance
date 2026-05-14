import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { useThemeColors, useThemeMode, type ThemeMode } from '@/theme';

const APPEARANCE_OPTIONS: { mode: ThemeMode; label: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Use the original dark fintech palette',
    icon: 'dark-mode',
  },
  {
    mode: 'light',
    label: 'Light',
    description: 'Use the brighter mint and blue palette',
    icon: 'light-mode',
  },
  {
    mode: 'system',
    label: 'System',
    description: "Match your device's setting",
    icon: 'phone-iphone',
  },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { mode, setMode } = useThemeMode();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles(colors);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.headerIcon,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + Spacing.stackLg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.card}>
          {APPEARANCE_OPTIONS.map((opt, idx) => {
            const selected = mode === opt.mode;
            return (
              <View key={opt.mode}>
                {idx > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => setMode(opt.mode)}
                  style={({ pressed }) => [
                    styles.row,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBubble,
                      {
                        backgroundColor: selected
                          ? colors.primaryTint10
                          : colors.surfaceContainerHigh,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={opt.icon}
                      size={20}
                      color={selected ? colors.primary : colors.onSurfaceVariant}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{opt.label}</Text>
                    <Text style={styles.rowDescription}>{opt.description}</Text>
                  </View>
                  {selected && (
                    <MaterialIcons
                      name="check"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          Dark remains the default. System follows your device preference.
        </Text>
      </ScrollView>
    </View>
  );
}

function useStyles(colors: ColorPalette) {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
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
          paddingTop: Spacing.stackLg,
          gap: Spacing.stackMd,
        },
        sectionHeader: {
          ...Type.labelCaps,
          color: colors.onSurfaceVariant,
          paddingHorizontal: Spacing.stackXs,
        },
        card: {
          backgroundColor: colors.surfaceContainer,
          borderRadius: Radius.xl,
          overflow: 'hidden',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.stackMd,
          padding: Spacing.stackMd,
        },
        iconBubble: {
          width: 40,
          height: 40,
          borderRadius: Radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        rowLabel: {
          ...Type.titleSm,
          color: colors.onSurface,
        },
        rowDescription: {
          ...Type.bodyMd,
          color: colors.onSurfaceVariant,
          marginTop: 2,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.outlineVariant,
          marginLeft: Spacing.stackMd + 40 + Spacing.stackMd,
        },
        footnote: {
          ...Type.bodyMd,
          color: colors.onSurfaceVariant,
          paddingHorizontal: Spacing.stackXs,
          marginTop: Spacing.stackMd,
        },
      }),
    [colors],
  );
}
