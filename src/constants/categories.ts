import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type StapleCategoryKind = 'spend' | 'gain';

export type StapleCategory = {
  name: string;
  icon: MaterialIconName;
  kind: StapleCategoryKind;
};

// Staple categories always appear in the Log section's category grid,
// even on days with no transactions. They cannot be deleted by the user.
export const STAPLE_CATEGORIES: StapleCategory[] = [
  { name: 'Food & Drink', icon: 'restaurant',     kind: 'spend' },
  { name: 'Home Bills',   icon: 'home',           kind: 'spend' },
  { name: 'Transport',    icon: 'directions-car', kind: 'spend' },
  { name: 'Salary',       icon: 'payments',       kind: 'gain'  },
  { name: 'Investments',  icon: 'trending-up',    kind: 'gain'  },
];

export const STAPLE_CATEGORY_NAMES: ReadonlySet<string> = new Set(
  STAPLE_CATEGORIES.map((c) => c.name),
);

export function isStapleCategory(name: string): boolean {
  return STAPLE_CATEGORY_NAMES.has(name);
}
