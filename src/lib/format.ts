export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** "10:00" from an ISO timestamp that already carries the listing's UTC offset. */
export const clock = (iso: string) => iso.slice(11, 16);

export function formatDay(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso));
}

export function hoursLabel(minutes: number): string {
  const hours = minutes / 60;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export interface CalendarDay {
  /** YYYY-MM-DD in the listing's time zone */
  date: string;
  weekday: (typeof WEEKDAYS)[number];
  label: { weekday: string; day: string; month: string };
}

/** The next `count` calendar days, starting today in the given time zone. */
export function upcomingDays(timeZone: string, count: number, now = new Date()): CalendarDay[] {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number);

  return Array.from({ length: count }, (_, i) => {
    const day = new Date(Date.UTC(y, m - 1, d + i));
    const part = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(day);
    return {
      date: day.toISOString().slice(0, 10),
      weekday: WEEKDAYS[day.getUTCDay()] ?? 'sunday',
      label: {
        weekday: part({ weekday: 'short' }),
        day: part({ day: 'numeric' }),
        month: part({ month: 'short' }),
      },
    };
  });
}
