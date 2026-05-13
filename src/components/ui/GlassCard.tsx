import { StyleSheet, View, ViewProps } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Props = ViewProps & {
  radius?: number;
};

export function GlassCard({ children, style, radius = Radius.cardLg, ...rest }: Props) {
  return (
    <View style={[styles.card, { borderRadius: radius }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glassBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.white08,
    overflow: 'hidden',
  },
});
