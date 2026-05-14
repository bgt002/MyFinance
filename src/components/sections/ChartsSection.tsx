import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import {
  monthlyPerformance,
  netWorthProgression,
  topSpendingCategories,
  type SpendingCategory,
} from '@/data/dummy';
import { useThemeColors } from '@/theme';

const CHART_CARD_HEIGHT = 256;

function getAccentMap(colors: ColorPalette) {
  return {
    primary: { color: colors.primary, tint: colors.primaryTint10 },
    secondary: { color: colors.secondary, tint: colors.secondaryTint10 },
    tertiary: { color: colors.tertiary, tint: colors.tertiaryTint10 },
  } as const;
}

function useChartsTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function ChartsSection() {
  const { styles } = useChartsTheme();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MonthlyPerformanceCard />
      <NetWorthProgressionChart />
      <TopSpendingCategoriesList />
    </ScrollView>
  );
}

function MonthlyPerformanceCard() {
  const { colors, styles } = useChartsTheme();
  const m = monthlyPerformance;
  return (
    <GlassCard radius={Radius.xl} style={styles.perfCard}>
      <View style={styles.perfHeader}>
        <View>
          <Text style={styles.eyebrow}>Monthly Performance</Text>
          <Text style={styles.cardHeadline}>Financial Health</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{m.status}</Text>
        </View>
      </View>

      <View style={styles.perfGrid}>
        <StatCell
          label="Savings Rate"
          value={`${m.savingsRatePct.toFixed(1)}%`}
          delta={`${m.savingsRateDeltaPct.toFixed(1)}%`}
        />
        <StatCell
          label="Efficiency"
          value={`${m.efficiencyScore}/${m.efficiencyScoreMax}`}
          delta={`${m.efficiencyDelta}`}
        />
      </View>

      <View style={styles.perfFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.perfFooterLabel}>Total Expenses vs Prev Month</Text>
          <View style={styles.perfFooterRow}>
            <View style={styles.perfFooterTrack}>
              <View
                style={[styles.perfFooterFill, { width: `${m.expensesVsPrevPct}%` }]}
              />
            </View>
            <Text style={styles.perfFooterAmount}>
              -${Math.abs(m.expensesDeltaDollars).toLocaleString()}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
      </View>
    </GlassCard>
  );
}

function StatCell({ label, value, delta }: { label: string; value: string; delta: string }) {
  const { colors, styles } = useChartsTheme();

  return (
    <View style={{ gap: Spacing.stackXs }}>
      <Text style={styles.statCellLabel}>{label}</Text>
      <View style={styles.statCellRow}>
        <Text style={styles.statCellValue}>{value}</Text>
        <View style={styles.statCellDelta}>
          <MaterialIcons name="arrow-drop-up" size={16} color={colors.primary} />
          <Text style={styles.statCellDeltaText}>{delta}</Text>
        </View>
      </View>
    </View>
  );
}

function NetWorthProgressionChart() {
  const { colors, styles } = useChartsTheme();
  const c = netWorthProgression;
  const activeMarker = c.markers.find((m) => m.isActive);
  return (
    <View style={{ gap: Spacing.stackMd }}>
      <View style={styles.chartHeader}>
        <Text style={styles.cardTitle}>Net Worth Progression</Text>
        <View style={styles.rangePills}>
          {c.ranges.map((r) => {
            const active = r === c.activeRange;
            return (
              <View
                key={r}
                style={[styles.rangePill, active && styles.rangePillActive]}
              >
                <Text
                  style={[
                    styles.rangePillText,
                    active && styles.rangePillTextActive,
                  ]}
                >
                  {r}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <GlassCard radius={Radius.xl} style={styles.chartCard}>
        <View style={styles.chartArea}>
          <View style={styles.gridLines} pointerEvents="none">
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          <View style={styles.svgWrap}>
            <Svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${c.viewBox.width} ${c.viewBox.height}`}
              preserveAspectRatio="none"
            >
              <Defs>
                <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity={1} />
                  <Stop offset="100%" stopColor={colors.secondary} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Path
                d={c.pathD}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                strokeLinecap="round"
              />
              {c.markers.map((m, i) => (
                <Circle
                  key={i}
                  cx={m.x}
                  cy={m.y}
                  r={m.isActive ? 6 : 5}
                  fill={colors.primary}
                />
              ))}
              {activeMarker && (
                <Circle
                  cx={activeMarker.x}
                  cy={activeMarker.y}
                  r={11}
                  fill={colors.primary}
                  fillOpacity={0.25}
                />
              )}
            </Svg>

            {activeMarker?.label && (
              <View
                style={[
                  styles.tooltipAnchor,
                  { left: `${(activeMarker.x / c.viewBox.width) * 100}%` },
                ]}
                pointerEvents="none"
              >
                <View style={styles.tooltipPill}>
                  <Text style={styles.tooltipText}>{activeMarker.label}</Text>
                </View>
                <View style={styles.tooltipLine} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.monthRow}>
          {c.monthLabels.map((label, i) => (
            <Text
              key={label}
              style={[
                styles.monthLabel,
                i === c.activeMonthIndex && styles.monthLabelActive,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

function TopSpendingCategoriesList() {
  const { styles } = useChartsTheme();

  return (
    <View style={{ gap: Spacing.stackMd }}>
      <Text style={styles.cardTitle}>Top Spending Categories</Text>
      <View style={{ gap: Spacing.stackSm }}>
        {topSpendingCategories.map((cat) => (
          <SpendingCategoryRow key={cat.id} cat={cat} />
        ))}
      </View>
    </View>
  );
}

function SpendingCategoryRow({ cat }: { cat: SpendingCategory }) {
  const { colors, styles } = useChartsTheme();
  const accent = getAccentMap(colors)[cat.accent];
  return (
    <GlassCard radius={Radius.xl} style={styles.catRow}>
      <View style={[styles.catIconBubble, { backgroundColor: accent.tint }]}>
        <MaterialIcons name={cat.icon} size={22} color={accent.color} />
      </View>
      <View style={styles.catContent}>
        <View style={styles.catHeaderRow}>
          <Text style={styles.catLabel}>{cat.label}</Text>
          <Text style={styles.catAmount}>
            ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.catTrack}>
          <View
            style={[
              styles.catFill,
              { width: `${cat.fillPct}%`, backgroundColor: accent.color },
            ]}
          />
        </View>
      </View>
    </GlassCard>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackLg * 2,
    gap: Spacing.stackLg,
  },

  eyebrow: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
  },
  cardHeadline: {
    ...Type.headlineMd,
    color: colors.onSurface,
    marginTop: Spacing.stackXs,
  },
  cardTitle: {
    ...Type.titleSm,
    color: colors.onSurface,
  },

  perfCard: {
    padding: Spacing.marginMain,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.marginMain,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: colors.primaryTint10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryTint20,
  },
  statusPillText: {
    ...Type.labelCaps,
    color: colors.primary,
  },
  perfGrid: {
    flexDirection: 'row',
    gap: Spacing.gutterGrid,
  },
  statCellLabel: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
  },
  statCellRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.stackSm,
  },
  statCellValue: {
    ...Type.headlineMd,
    color: colors.onSurface,
  },
  statCellDelta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCellDeltaText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  perfFooter: {
    marginTop: Spacing.marginMain,
    paddingTop: Spacing.marginMain,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.white05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perfFooterLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  perfFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginTop: Spacing.stackXs,
  },
  perfFooterTrack: {
    height: 8,
    width: 128,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  perfFooterFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  perfFooterAmount: {
    ...Type.titleSm,
    color: colors.onSurface,
  },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rangePills: {
    flexDirection: 'row',
    gap: Spacing.stackSm,
  },
  rangePill: {
    paddingHorizontal: Spacing.stackSm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  rangePillActive: {
    backgroundColor: colors.primaryTint10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryTint20,
  },
  rangePillText: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
  },
  rangePillTextActive: {
    color: colors.primary,
  },

  chartCard: {
    height: CHART_CARD_HEIGHT,
    padding: Spacing.marginMain,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.white05,
  },
  svgWrap: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    bottom: 16,
  },
  tooltipAnchor: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -34 }],
  },
  tooltipPill: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(78, 222, 163, 0.3)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tooltipText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  tooltipLine: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(78, 222, 163, 0.3)',
    marginTop: 4,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.stackMd,
  },
  monthLabel: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 1,
  },
  monthLabelActive: {
    color: colors.primary,
  },

  catRow: {
    padding: Spacing.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
  },
  catIconBubble: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catContent: {
    flex: 1,
  },
  catHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.stackSm,
  },
  catLabel: {
    ...Type.bodyMd,
    color: colors.onSurface,
  },
  catAmount: {
    ...Type.labelCaps,
    color: colors.onSurfaceVariant,
  },
  catTrack: {
    height: 8,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
  },
  });
}
