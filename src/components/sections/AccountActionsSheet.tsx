import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BankLogo } from '@/components/ui/BankLogo';
import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { ACCOUNT_CATEGORIES, type Account } from '@/data/dummy';
import { useThemeColors } from '@/theme';

type Props = {
  account: Account | null;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onUpdateBalance: () => void;
};

function getAccentColor(colors: ColorPalette): Record<string, string> {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    neutral: colors.onSurface,
  };
}

function getAccentTint(colors: ColorPalette): Record<string, string> {
  return {
    primary: colors.primaryTint10,
    secondary: colors.secondaryTint10,
    tertiary: colors.tertiaryTint10,
    neutral: colors.surfaceContainerHigh,
  };
}

function useAccountActionsTheme() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
}

function formatBalance(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AccountActionsSheet({
  account,
  onClose,
  onDelete,
  onEdit,
  onUpdateBalance,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, styles } = useAccountActionsTheme();
  // Snapshot the account so its data stays rendered during the slide-out animation,
  // even after the parent clears its selectedAccount state.
  const [snapshot, setSnapshot] = useState<Account | null>(account);

  useEffect(() => {
    if (account) setSnapshot(account);
  }, [account]);

  const visible = account !== null;
  if (!snapshot) return null;

  const cat = ACCOUNT_CATEGORIES.find((c) => c.key === snapshot.category);
  const accent = cat?.accent ?? 'neutral';
  const accentColors = getAccentColor(colors);
  const accentTints = getAccentTint(colors);

  function handleDeletePress() {
    Alert.alert(
      'Delete this account?',
      `"${snapshot!.name}" will be removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Spacing.stackMd },
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            {snapshot.logoSlug ? (
              <BankLogo slug={snapshot.logoSlug} size={48} />
            ) : (
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: accentTints[accent] },
                ]}
              >
                <MaterialIcons
                  name={snapshot.icon}
                  size={22}
                  color={accentColors[accent]}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{snapshot.name}</Text>
              <Text style={styles.accountBalance}>
                {formatBalance(snapshot.balance)}
              </Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <ActionRow
              icon="info"
              label="View Details"
              onPress={() => {
                // TODO: open account detail screen
                onClose();
              }}
            />
            <Divider />
            <ActionRow
              icon="edit"
              label="Edit Account"
              onPress={onEdit}
            />
            <Divider />
            <ActionRow
              icon="attach-money"
              label="Update Balance"
              onPress={onUpdateBalance}
            />
          </View>

          <View style={styles.actionGroup}>
            <ActionRow
              icon="delete"
              label="Delete Account"
              destructive
              onPress={handleDeletePress}
            />
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors, styles } = useAccountActionsTheme();
  const color = destructive ? colors.error : colors.onSurface;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.5 : 1 }]}
    >
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      {!destructive && (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.onSurfaceVariant}
        />
      )}
    </Pressable>
  );
}

function Divider() {
  const { styles } = useAccountActionsTheme();
  return <View style={styles.actionDivider} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: Radius.cardLg,
    borderTopRightRadius: Radius.cardLg,
    paddingTop: Spacing.stackSm,
    paddingHorizontal: Spacing.marginMain,
    gap: Spacing.stackMd,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    marginBottom: Spacing.stackSm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    paddingBottom: Spacing.stackMd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    ...Type.titleSm,
    color: colors.onSurface,
  },
  accountBalance: {
    ...Type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionGroup: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    paddingVertical: Spacing.stackMd,
    paddingHorizontal: Spacing.stackMd,
  },
  actionLabel: {
    ...Type.bodyLg,
    flex: 1,
  },
  actionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginLeft: Spacing.stackMd + 22 + Spacing.stackMd,
  },
  cancelBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.stackMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.stackSm,
  },
  cancelBtnText: {
    ...Type.titleSm,
    color: colors.onSurface,
  },
  });
}
