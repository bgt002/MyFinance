import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  DARK_COLORS,
  LIGHT_COLORS,
  type ColorPalette,
} from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeScheme = 'light' | 'dark';

type ThemeContextValue = {
  /** User's preference. */
  mode: ThemeMode;
  /** The actual resolved scheme — equals `mode` when not 'system'. */
  scheme: ThemeScheme;
  /** Active color palette matching `scheme`. */
  colors: ColorPalette;
  /** Set + persist the user's preference. */
  setMode: (next: ThemeMode) => void;
  /** True once the persisted preference has been read from disk. */
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'myfinances.themeMode';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

async function readMode(): Promise<ThemeMode> {
  try {
    const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
    return isThemeMode(storedMode) ? storedMode : 'dark';
  } catch {
    return 'dark';
  }
}

async function writeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Persistence failure is non-fatal — the user's choice still applies in
    // this session, it just won't survive an app restart.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the persisted preference once on mount.
  useEffect(() => {
    let cancelled = false;
    void readMode().then((m) => {
      if (cancelled) return;
      setModeState(m);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void writeMode(next);
  }, []);

  const scheme: ThemeScheme = useMemo(() => {
    if (mode === 'system') return systemScheme === 'light' ? 'light' : 'dark';
    return mode;
  }, [mode, systemScheme]);

  const colors = scheme === 'light' ? LIGHT_COLORS : DARK_COLORS;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Best effort only; web and unsupported native surfaces can ignore this.
    });
  }, [colors.background]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, scheme, colors, setMode, hydrated }),
    [mode, scheme, colors, setMode, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return ctx;
}

export function useThemeColors(): ColorPalette {
  return useTheme().colors;
}

export function useThemeMode(): {
  mode: ThemeMode;
  scheme: ThemeScheme;
  setMode: (next: ThemeMode) => void;
} {
  const { mode, scheme, setMode } = useTheme();
  return { mode, scheme, setMode };
}

export function useThemeScheme(): ThemeScheme {
  return useTheme().scheme;
}
