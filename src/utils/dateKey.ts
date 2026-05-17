// Date keys are 'YYYY-MM-DD' strings interpreted in the device's local timezone.
// This matches the Transaction.date format already used throughout the app.

export type DateKey = string;

export function formatDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now: Date = new Date()): DateKey {
  return formatDateKey(now);
}

export function addDaysToKey(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

export function formatDayLabel(key: DateKey): string {
  return parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWhenLabel(key: DateKey, today: DateKey = todayKey()): string {
  if (key === today) return 'Today';
  const yesterday = addDaysToKey(today, -1);
  if (key === yesterday) return 'Yesterday';
  return parseDateKey(key).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export type MonthCell = { key: DateKey; day: number; inMonth: boolean };

export function getMonthGrid(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const cells: MonthCell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ key: formatDateKey(d), day: d.getDate(), inMonth: false });
  }

  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    cells.push({ key: formatDateKey(d), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = parseDateKey(cells[cells.length - 1].key);
    last.setDate(last.getDate() + 1);
    cells.push({ key: formatDateKey(last), day: last.getDate(), inMonth: false });
  }

  return cells;
}
