const TZ = 'Asia/Ho_Chi_Minh';

const absolute = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: TZ,
});

const relative = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

export const when = (iso: string) => absolute.format(new Date(iso));

export function ago(iso: string | null, empty = 'Chưa có'): string {
  if (!iso) return empty;
  const secs = (new Date(iso).getTime() - Date.now()) / 1000;
  const size = Math.abs(secs);
  if (size < 60) return 'Vừa xong';
  if (size < 3600) return relative.format(Math.round(secs / 60), 'minute');
  if (size < 86_400) return relative.format(Math.round(secs / 3600), 'hour');
  if (size < 7 * 86_400) return relative.format(Math.round(secs / 86_400), 'day');
  return when(iso);
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '?';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
