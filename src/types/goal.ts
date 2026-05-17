import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type GoalAccent =
  | 'primary'
  | 'secondary'
  | 'secondaryContainer'
  | 'tertiary';

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  icon: MaterialIconName;
  accent: GoalAccent;
  status: string;
  statusTone: 'primary' | 'neutral';
  description?: string;
};
