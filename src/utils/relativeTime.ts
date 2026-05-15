const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeUpdated(epochMs: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - epochMs);
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `Updated ${m}m ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `Updated ${h}h ago`;
  }
  if (diff < 7 * DAY) {
    const d = Math.floor(diff / DAY);
    return `Updated ${d}d ago`;
  }
  const date = new Date(epochMs);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Updated ${label}`;
}
