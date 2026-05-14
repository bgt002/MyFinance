import { Image, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/theme';
import { LOGO_REGISTRY, type LogoSlug } from '@/utils/logoRegistry';

type Props = {
  /** A known slug from the LOGO_REGISTRY. */
  slug: LogoSlug;
  /** Tile size in dp. Defaults to 32. */
  size?: number;
  /** Whether to round the corners. Defaults to true. */
  rounded?: boolean;
};

/**
 * Renders a bank/card/fintech logo by registry slug. 100% offline — every
 * logo is a bundled PNG asset, rendered via <Image>. Unknown slugs fall back
 * to a colored monogram tile.
 */
export function BankLogo({ slug, size = 32, rounded = true }: Props) {
  const entry = LOGO_REGISTRY[slug];
  const radius = rounded ? size / 5 : 0;

  if (!entry) {
    return (
      <MonogramTile
        char={slug.charAt(0).toUpperCase()}
        size={size}
        radius={radius}
      />
    );
  }

  return (
    <Image
      source={entry.source}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: '#fff',
      }}
    />
  );
}

function MonogramTile({
  char,
  size,
  radius,
}: {
  char: string;
  size: number;
  radius: number;
}) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.surfaceContainerHigh,
        },
      ]}
    >
      <Text
        style={{
          color: colors.onSurface,
          fontWeight: '700',
          fontSize: size * 0.45,
        }}
      >
        {char}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
