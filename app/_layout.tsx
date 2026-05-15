import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDb } from '@/db/client';
import { ThemeProvider, useThemeColors, useThemeScheme } from '@/theme';

export default function RootLayout() {
  useEffect(() => {
    getDb().catch((e) => {
      console.error('[db] failed to initialize', e);
    });
  }, []);

  return (
    <ThemeProvider>
      <ThemedRoot />
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const colors = useThemeColors();
  const scheme = useThemeScheme();

  const navTheme = useMemo(
    () => ({
      dark: scheme === 'dark',
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.onBackground,
        border: colors.white05,
        notification: colors.primary,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '800' as const },
      },
    }),
    [scheme, colors],
  );

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider>
        <NavThemeProvider value={navTheme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </NavThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
