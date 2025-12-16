import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRangeValue } from '../api/types';

export const TIMEZONES = [
  'Europe/Berlin',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Singapore'
];

export const formatTimestamp = (iso: string, timezone: string, pattern = 'dd.MM HH:mm') => {
  // NOTE: date-fns-tz not available; fallback to native Date in provided timezone context is omitted.
  const date = new Date(iso);
  return format(date, pattern);
};

export const toUtcIso = (date: Date, timezone: string) => {
  // Fallback: ignore timezone conversion, use UTC ISO from provided Date.
  return date.toISOString();
};

export const buildPresetRange = (preset: DateRangeValue['preset'], timezone: string): DateRangeValue => {
  const end = endOfDay(new Date());
  const start =
    preset === '7d'
      ? startOfDay(subDays(end, 6))
      : preset === '30d'
        ? startOfDay(subDays(end, 29))
        : preset === '90d'
          ? startOfDay(subDays(end, 89))
          : startOfDay(end);

  return {
    start,
    end,
    preset,
    timezone
  };
};

export const formatRangeLabel = (range: DateRangeValue) => {
  const { start, end, timezone } = range;
  const startLabel = formatTimestamp(start.toISOString(), timezone, 'dd.MM.yyyy');
  const endLabel = formatTimestamp(end.toISOString(), timezone, 'dd.MM.yyyy');
  return `${startLabel} – ${endLabel} (${timezone})`;
};
