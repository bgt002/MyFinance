import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import {
  goals,
  goalsCollectivePct,
  goalsRemaining,
  goalsTotalSaved,
  type Goal,
  type GoalAccent,
} from '@/data/dummy';

const ACCENT_MAP: Record<GoalAccent, { color: string; tint: string }> = {
  primary: { color: Colors.primary, tint: Colors.primaryTint10 },
  secondary: { color: Colors.secondary, tint: Colors.secondaryTint10 },
  secondaryContainer: {
    color: Colors.secondaryContainer,
    tint: Colors.secondaryContainerTint10,
  },
  tertiary: { color: Colors.tertiary, tint: Colors.tertiaryTint10 },
};

const RING_SIZE = 64;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatCurrencyCompact(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function GoalsSection() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + insets.bottom + Spacing.marginMain },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <TotalProgressCard />
        <View style={{ gap: Spacing.stackMd }}>
          {goals.map((goal) =>
            goal.variant === 'featured' ? (
              <FeaturedGoalCard key={goal.id} goal={goal} />
            ) : (
              <StandardGoalCard key={goal.id} goal={goal} />
            ),
          )}
        </View>
      </ScrollView>

      <Fab bottomInset={insets.bottom} />
    </View>
  );
}

function Header() {
  return (
    <View>
      <Text style={styles.pageTitle}>Savings Goals</Text>
      <Text style={styles.pageSubtitle}>
        Nurture your future with intentional growth.
      </Text>
    </View>
  );
}

function TotalProgressCard() {
  return (
    <GlassCard radius={Radius.xl} style={styles.totalCard}>
      <View style={styles.totalBgIcon} pointerEvents="none">
        <MaterialIcons name="savings" size={96} color={Colors.onSurface} />
      </View>
      <Text style={styles.totalEyebrow}>Total Saved</Text>
      <Text style={styles.totalAmount}>{formatCurrencyFull(goalsTotalSaved)}</Text>
      <View style={styles.totalProgressRow}>
        <View style={styles.totalTrack}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.totalFill, { width: `${goalsCollectivePct}%` }]}
          />
        </View>
        <Text style={styles.totalPct}>{goalsCollectivePct}%</Text>
      </View>
      <Text style={styles.totalHelper}>
        You're {formatCurrencyCompact(goalsRemaining)} away from your collective
        milestones.
      </Text>
    </GlassCard>
  );
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);
  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="transparent"
          stroke={Colors.white05}
          strokeWidth={RING_STROKE}
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="transparent"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={styles.ringLabelWrap}>
        <Text style={styles.ringLabel}>{Math.round(clamped)}%</Text>
      </View>
    </View>
  );
}

function StandardGoalCard({ goal }: { goal: Goal }) {
  const accent = ACCENT_MAP[goal.accent];
  const pct = (goal.saved / goal.target) * 100;
  return (
    <GlassCard radius={Radius.xl} style={styles.goalCard}>
      <View style={styles.goalCardTop}>
        <View style={[styles.goalIconBubble, { backgroundColor: accent.tint }]}>
          <MaterialIcons name={goal.icon} size={22} color={accent.color} />
        </View>
        <ProgressRing pct={pct} color={accent.color} />
      </View>
      <View>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <Text style={styles.goalTarget}>
          Target: {formatCurrencyCompact(goal.target)}
        </Text>
        <View style={styles.goalFooter}>
          <Text style={styles.goalSaved}>
            {formatCurrencyCompact(goal.saved)}
          </Text>
          <Text
            style={[
              styles.goalStatus,
              goal.statusTone === 'primary' && { color: Colors.primary },
            ]}
          >
            {goal.status}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function FeaturedGoalCard({ goal }: { goal: Goal }) {
  const pct = (goal.saved / goal.target) * 100;
  return (
    <GlassCard radius={Radius.xl} style={styles.featuredCard}>
      <View style={styles.featuredImageWrap}>
        <LinearGradient
          colors={['#3a2542', '#22324b', '#1a2236']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <MaterialIcons
          name={goal.icon}
          size={56}
          color={Colors.tertiary}
          style={styles.featuredImageIcon}
        />
      </View>
      <View style={styles.featuredBody}>
        <View style={styles.featuredHeader}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.pillLabel && (
            <View style={styles.featuredPill}>
              <Text style={styles.featuredPillText}>{goal.pillLabel}</Text>
            </View>
          )}
        </View>
        {goal.description && (
          <Text style={styles.featuredDescription}>{goal.description}</Text>
        )}
        <View style={styles.featuredProgressLabels}>
          <Text style={styles.featuredSavedLabel}>
            {formatCurrencyCompact(goal.saved)} saved
          </Text>
          <Text style={styles.featuredTargetLabel}>
            Target: {formatCurrencyCompact(goal.target)}
          </Text>
        </View>
        <View style={styles.featuredTrack}>
          <LinearGradient
            colors={[Colors.tertiary, Colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.featuredFill, { width: `${pct}%` }]}
          />
        </View>
      </View>
    </GlassCard>
  );
}

function Fab({ bottomInset }: { bottomInset: number }) {
  return (
    <Pressable
      onPress={() => {
        // TODO: open Add Goal flow
      }}
      style={({ pressed }) => [
        styles.fabShadow,
        {
          bottom: Spacing.marginMain + bottomInset,
        },
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
      hitSlop={8}
    >
      <LinearGradient
        colors={[Colors.secondaryContainer, Colors.primary]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.fab}
      >
        <MaterialIcons name="add" size={28} color={Colors.onPrimary} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.marginMain,
    paddingTop: Spacing.stackLg,
    gap: Spacing.stackLg,
  },

  pageTitle: {
    ...Type.headlineMd,
    color: Colors.onSurface,
  },
  pageSubtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.stackXs,
  },

  totalCard: {
    padding: Spacing.marginMain,
    position: 'relative',
    overflow: 'hidden',
  },
  totalBgIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.stackMd,
    opacity: 0.1,
  },
  totalEyebrow: {
    ...Type.labelCaps,
    color: Colors.primary,
  },
  totalAmount: {
    ...Type.displayLg,
    color: Colors.onSurface,
    marginTop: Spacing.stackXs,
  },
  totalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm,
    marginTop: Spacing.stackMd,
  },
  totalTrack: {
    height: 8,
    flex: 1,
    backgroundColor: Colors.white05,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalPct: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  totalHelper: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.stackMd,
  },

  goalCard: {
    padding: Spacing.marginMain,
    minHeight: 220,
    justifyContent: 'space-between',
  },
  goalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalIconBubble: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  ringSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  ringLabelWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 0.5,
  },
  goalTitle: {
    ...Type.titleSm,
    color: Colors.onSurface,
  },
  goalTarget: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.stackXs,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.stackMd,
  },
  goalSaved: {
    ...Type.headlineMd,
    color: Colors.onSurface,
  },
  goalStatus: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },

  featuredCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featuredImageWrap: {
    height: 160,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageIcon: {
    opacity: 0.7,
  },
  featuredBody: {
    padding: Spacing.marginMain,
    gap: Spacing.stackMd,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPill: {
    backgroundColor: Colors.tertiaryTint10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  featuredPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 1,
  },
  featuredDescription: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  featuredProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredSavedLabel: {
    ...Type.labelCaps,
    color: Colors.onSurface,
  },
  featuredTargetLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  featuredTrack: {
    height: 12,
    width: '100%',
    backgroundColor: Colors.white05,
    borderRadius: 6,
    overflow: 'hidden',
  },
  featuredFill: {
    height: '100%',
    borderRadius: 6,
  },

  fabShadow: {
    position: 'absolute',
    right: Spacing.marginMain,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
