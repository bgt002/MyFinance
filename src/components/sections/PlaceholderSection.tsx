import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Type } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function PlaceholderSection({ title, subtitle = 'Coming soon.' }: Props) {
  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.eyebrow}>Section</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
    color: Colors.onSurfaceVariant,
  },
  title: {
    ...Type.headlineMd,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },
});
