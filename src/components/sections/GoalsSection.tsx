import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { GlassCard } from '@/components/ui/GlassCard';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useThemeColors } from '@/theme';
import type { Goal, GoalAccent } from '@/types/goal';

import { GoalFormModal, type GoalFormResult } from './GoalFormModal';

function getAccentMap(
  colors: ColorPalette,
): Record<GoalAccent, { color: string; tint: string }> {
  return {
    primary: { color: colors.primary, tint: colors.primaryTint10 },
    secondary: { color: colors.secondary, tint: colors.secondaryTint10 },
    secondaryContainer: {
      color: colors.secondaryContainer,
      tint: colors.secondaryContainerTint10,
    },
    tertiary: { color: colors.tertiary, tint: colors.tertiaryTint10 },
  };
}

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

function useGoalsTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

export function GoalsSection() {
  const { styles } = useGoalsTheme();
  const insets = useSafeAreaInsets();
  const { goals, addGoal, editGoal, removeGoal } = useGoals();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const totals = useMemo(() => {
    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const collectivePct =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const remaining = Math.max(0, totalTarget - totalSaved);
    return { totalSaved, totalTarget, collectivePct, remaining };
  }, [goals]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setFormOpen(true);
  }

  function handleDelete(g: Goal) {
    Alert.alert(
      'Delete goal?',
      `"${g.title}" will be removed. Saved amount tracking won't be recovered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void removeGoal(g.id);
          },
        },
      ],
    );
  }

  async function handleSubmit(result: GoalFormResult) {
    setFormOpen(false);
    const wasEditing = editing;
    setEditing(null);
    if (wasEditing) {
      await editGoal(wasEditing.id, result);
    } else {
      await addGoal(result);
    }
  }

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
        <TotalProgressCard
          totalSaved={totals.totalSaved}
          collectivePct={totals.collectivePct}
          remaining={totals.remaining}
        />
        {goals.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <View style={{ gap: Spacing.stackMd }}>
            {goals.map((goal) => (
              <StandardGoalCard
                key={goal.id}
                goal={goal}
                onPress={() => openEdit(goal)}
                onLongPress={() => handleDelete(goal)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Fab onPress={openAdd} bottomInset={insets.bottom} />

      <GoalFormModal
        visible={formOpen}
        goal={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

function Header() {
  const { styles } = useGoalsTheme();
  return (
    <View>
      <Text style={styles.pageTitle}>Savings Goals</Text>
      <Text style={styles.pageSubtitle}>
        Nurture your future with intentional growth.
      </Text>
    </View>
  );
}

function TotalProgressCard({
  totalSaved,
  collectivePct,
  remaining,
}: {
  totalSaved: number;
  collectivePct: number;
  remaining: number;
}) {
  const { colors, styles } = useGoalsTheme();
  return (
    <GlassCard radius={Radius.xl} style={styles.totalCard}>
      <View style={styles.totalBgIcon} pointerEvents="none">
        <MaterialIcons name="savings" size={96} color={colors.onSurface} />
      </View>
      <Text style={styles.totalEyebrow}>Total Saved</Text>
      <Text style={styles.totalAmount}>{formatCurrencyFull(totalSaved)}</Text>
      <View style={styles.totalProgressRow}>
        <View style={styles.totalTrack}>
          <LinearGradient
            colors={[colors.primary, colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.totalFill, { width: `${collectivePct}%` }]}
          />
        </View>
        <Text style={styles.totalPct}>{collectivePct}%</Text>
      </View>
      <Text style={styles.totalHelper}>
        {remaining > 0
          ? `You're ${formatCurrencyCompact(remaining)} away from your collective milestones.`
          : "You've hit every milestone — set a new one."}
      </Text>
    </GlassCard>
  );
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const { colors, styles } = useGoalsTheme();
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
          stroke={colors.white05}
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

function StandardGoalCard({
  goal,
  onPress,
  onLongPress,
}: {
  goal: Goal;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors, styles } = useGoalsTheme();
  const accent = getAccentMap(colors)[goal.accent];
  const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
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
                goal.statusTone === 'primary' && { color: colors.primary },
              ]}
            >
              {goal.status}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { colors, styles } = useGoalsTheme();
  return (
    <GlassCard radius={Radius.xl} style={styles.emptyCard}>
      <MaterialIcons
        name="flag"
        size={32}
        color={colors.onSurfaceVariantMuted}
      />
      <Text style={styles.emptyTitle}>No goals yet</Text>
      <Text style={styles.emptyHint}>
        Set a target for what you're saving toward — an emergency fund, a trip, a
        big purchase.
      </Text>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [
          styles.emptyBtn,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.emptyBtnText}>Add your first goal</Text>
      </Pressable>
    </GlassCard>
  );
}

function Fab({
  onPress,
  bottomInset,
}: {
  onPress: () => void;
  bottomInset: number;
}) {
  const { colors, styles } = useGoalsTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fabShadow,
        { bottom: Spacing.marginMain + bottomInset },
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
      hitSlop={8}
    >
      <LinearGradient
        colors={[colors.secondaryContainer, colors.primary]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.fab}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </LinearGradient>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Spacing.marginMain,
      paddingTop: Spacing.stackLg,
      gap: Spacing.stackLg,
    },

    pageTitle: {
      ...Type.headlineMd,
      color: colors.onSurface,
    },
    pageSubtitle: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
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
      color: colors.primary,
    },
    totalAmount: {
      ...Type.displayLg,
      color: colors.onSurface,
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
      backgroundColor: colors.white05,
      borderRadius: 4,
      overflow: 'hidden',
    },
    totalFill: {
      height: '100%',
      borderRadius: 4,
    },
    totalPct: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
    },
    totalHelper: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
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
      color: colors.onSurface,
      letterSpacing: 0.5,
    },
    goalTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    goalTarget: {
      ...Type.labelCaps,
      color: colors.onSurfaceVariant,
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
      color: colors.onSurface,
    },
    goalStatus: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
    },

    emptyCard: {
      padding: Spacing.marginMain,
      alignItems: 'center',
      gap: Spacing.stackSm,
    },
    emptyTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    emptyHint: {
      ...Type.bodyMd,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    emptyBtn: {
      marginTop: Spacing.stackSm,
      paddingHorizontal: Spacing.marginMain,
      paddingVertical: Spacing.stackMd,
      borderRadius: Radius.pill,
      backgroundColor: colors.primary,
    },
    emptyBtnText: {
      ...Type.titleSm,
      color: colors.onPrimary,
    },

    fabShadow: {
      position: 'absolute',
      right: Spacing.marginMain,
      width: 56,
      height: 56,
      borderRadius: 28,
      shadowColor: colors.shadow,
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
}
