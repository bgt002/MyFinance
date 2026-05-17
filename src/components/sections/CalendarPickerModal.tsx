import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Radius, Spacing, Type, type ColorPalette } from '@/constants/theme';
import { useThemeColors } from '@/theme';
import {
  formatMonthYear,
  getMonthGrid,
  parseDateKey,
  todayKey,
  type DateKey,
} from '@/utils/dateKey';

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = {
  visible: boolean;
  selectedDate: DateKey;
  onSelect: (key: DateKey) => void;
  onClose: () => void;
};

export function CalendarPickerModal({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initial = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    if (visible) {
      const d = parseDateKey(selectedDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [visible, selectedDate]);

  const cells = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const today = todayKey();

  function goPrev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Pressable onPress={() => {}} style={styles.card}>
          <View style={styles.header}>
            <Pressable
              onPress={goPrev}
              hitSlop={8}
              style={({ pressed }) => [
                styles.navBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <MaterialIcons
                name="chevron-left"
                size={24}
                color={colors.onSurface}
              />
            </Pressable>
            <Text style={styles.headerTitle}>
              {formatMonthYear(viewYear, viewMonth)}
            </Text>
            <Pressable
              onPress={goNext}
              hitSlop={8}
              style={({ pressed }) => [
                styles.navBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.onSurface}
              />
            </Pressable>
          </View>

          <View style={styles.dowRow}>
            {DOW_LABELS.map((d, i) => (
              <View key={`${d}-${i}`} style={styles.cell}>
                <Text style={styles.dowText}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((cell) => {
              const isToday = cell.key === today;
              const isSelected = cell.key === selectedDate;
              return (
                <Pressable
                  key={cell.key}
                  onPress={() => onSelect(cell.key)}
                  style={({ pressed }) => [
                    styles.cell,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <View
                    style={[
                      styles.dayBubble,
                      isSelected && {
                        backgroundColor: colors.primary,
                      },
                      !isSelected && isToday && {
                        borderWidth: 1,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: isSelected
                            ? colors.onPrimary
                            : cell.inMonth
                              ? colors.onSurface
                              : colors.onSurfaceVariantMuted,
                          fontWeight: isToday || isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: Spacing.marginMain,
    },
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: Radius.cardLg,
      padding: Spacing.marginMain,
      gap: Spacing.stackMd,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...Type.titleSm,
      color: colors.onSurface,
    },
    dowRow: {
      flexDirection: 'row',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dowText: {
      ...Type.labelCaps,
      fontSize: 11,
      color: colors.onSurfaceVariant,
    },
    dayBubble: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 14,
    },
  });
}
