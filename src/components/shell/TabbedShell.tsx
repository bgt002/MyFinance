import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountsSection } from '@/components/sections/AccountsSection';
import { ChartsSection } from '@/components/sections/ChartsSection';
import { GoalsSection } from '@/components/sections/GoalsSection';
import { HomeSection } from '@/components/sections/HomeSection';
import { LogSection } from '@/components/sections/LogSection';
import { PlaceholderSection } from '@/components/sections/PlaceholderSection';
import { Colors, Spacing, Type } from '@/constants/theme';

const TAB_WIDTH = 92;
const UNDERLINE_WIDTH = 56;
const TAB_INACTIVE_COLOR = 'rgba(187, 202, 191, 0.6)';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'log', label: 'Log' },
  { key: 'charts', label: 'Charts' },
  { key: 'goals', label: 'Goals' },
  { key: 'subscribe', label: 'Subscribe' },
] as const;

function renderSection(key: (typeof TABS)[number]['key'], label: string) {
  if (key === 'home') return <HomeSection />;
  if (key === 'accounts') return <AccountsSection />;
  if (key === 'log') return <LogSection />;
  if (key === 'charts') return <ChartsSection />;
  if (key === 'goals') return <GoalsSection />;
  return <PlaceholderSection title={label} />;
}

export function TabbedShell() {
  const { width: screenWidth } = useWindowDimensions();
  const pagerRef = useAnimatedRef<Animated.ScrollView>();
  const tabStripRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [, setActiveIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  // Keep the active tab centered in the header strip as the pager scrolls.
  useAnimatedReaction(
    () => (screenWidth > 0 ? scrollX.value / screenWidth : 0),
    (fractionalIndex) => {
      scrollTo(tabStripRef, fractionalIndex * TAB_WIDTH, 0, false);
    },
  );

  // Mirror the snapped tab index back into React state (currently unused for render,
  // but available for future "active tab" affordances like an FAB or page-specific UI).
  useAnimatedReaction(
    () => (screenWidth > 0 ? Math.round(scrollX.value / screenWidth) : 0),
    (current, prev) => {
      if (current !== prev) runOnJS(setActiveIndex)(current);
    },
  );

  const goToTab = useCallback(
    (i: number) => {
      pagerRef.current?.scrollTo({ x: i * screenWidth, animated: true });
    },
    [pagerRef, screenWidth],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            style={styles.settingsBtn}
            hitSlop={10}
            onPress={() => {
              // TODO: wire to /settings route once that screen exists.
            }}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={Colors.onSurfaceVariant}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.appTitle}>MyFinance</Text>

            <View style={styles.tabsWrap}>
              <Animated.ScrollView
                ref={tabStripRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{
                  paddingHorizontal: (screenWidth - TAB_WIDTH) / 2,
                  alignItems: 'flex-end',
                }}
              >
                {TABS.map((tab, i) => (
                  <TabLabel
                    key={tab.key}
                    index={i}
                    label={tab.label}
                    scrollX={scrollX}
                    screenWidth={screenWidth}
                    onPress={() => goToTab(i)}
                  />
                ))}
              </Animated.ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        style={styles.pager}
      >
        {TABS.map((tab) => (
          <View key={tab.key} style={{ width: screenWidth, flex: 1 }}>
            {renderSection(tab.key, tab.label)}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function TabLabel({
  index,
  label,
  scrollX,
  screenWidth,
  onPress,
}: {
  index: number;
  label: string;
  scrollX: SharedValue<number>;
  screenWidth: number;
  onPress: () => void;
}) {
  const textStyle = useAnimatedStyle(() => {
    const fractionalIndex = screenWidth > 0 ? scrollX.value / screenWidth : 0;
    const activeness = Math.max(0, 1 - Math.abs(fractionalIndex - index));
    return {
      color: interpolateColor(
        activeness,
        [0, 1],
        [TAB_INACTIVE_COLOR, Colors.primary],
      ),
    };
  });

  const underlineStyle = useAnimatedStyle(() => {
    const fractionalIndex = screenWidth > 0 ? scrollX.value / screenWidth : 0;
    const activeness = Math.max(0, 1 - Math.abs(fractionalIndex - index));
    return {
      opacity: activeness,
      transform: [{ scaleX: 0.6 + 0.4 * activeness }],
    };
  });

  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.tabBtn}>
      <Animated.Text style={[styles.tabLabel, textStyle]}>
        {label.toUpperCase()}
      </Animated.Text>
      <Animated.View style={[styles.tabUnderline, underlineStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerSafe: {
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.white05,
  },
  header: {
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackSm,
    position: 'relative',
  },
  settingsBtn: {
    position: 'absolute',
    top: Spacing.stackMd + 4,
    left: Spacing.marginMain,
    zIndex: 2,
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  appTitle: {
    ...Type.displayLg,
    color: Colors.primary,
    letterSpacing: -1.5,
  },
  tabsWrap: {
    width: '100%',
    height: 36,
    marginTop: Spacing.stackMd,
  },
  tabBtn: {
    width: TAB_WIDTH,
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabLabel: {
    ...Type.labelCaps,
    paddingBottom: 4,
  },
  tabUnderline: {
    width: UNDERLINE_WIDTH,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pager: {
    flex: 1,
  },
});
