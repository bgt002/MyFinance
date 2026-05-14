import { StyleSheet, View, ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/theme';

type Props = ViewProps & {
  radius?: number;
};

export function GlassCard({ children, style, radius = Radius.cardLg, ...rest }: Props) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.glassBackground,
          borderColor: colors.white08,
          borderRadius: radius,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
