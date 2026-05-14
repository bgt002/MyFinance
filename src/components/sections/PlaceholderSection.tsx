import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { Spacing, Type } from '@/constants/theme';
import { useThemeColors } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function PlaceholderSection({ title, subtitle = 'Coming soon.' }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={[styles.eyebrow, { color: colors.onSurfaceVariant }]}>Section</Text>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackLg,
  },
  card: {
    padding: Spacing.marginMain,
    gap: Spacing.stackSm,
  },
  eyebrow: {
    ...Type.labelCaps,
  },
  title: {
    ...Type.headlineMd,
  },
  subtitle: {
    ...Type.bodyMd,
  },
});
