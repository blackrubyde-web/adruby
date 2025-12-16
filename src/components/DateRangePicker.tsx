import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateRangeValue } from '../api/types';
import { TIMEZONES, buildPresetRange } from '../utils/dateUtils';

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
}

const presets: { label: string; value: DateRangeValue['preset'] }[] = [
  { label: 'Letzte 7 Tage', value: '7d' },
  { label: 'Letzte 30 Tage', value: '30d' },
  { label: 'Letzte 90 Tage', value: '90d' }
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const handlePreset = (preset: DateRangeValue['preset']) => {
    const nextRange = buildPresetRange(preset, value.timezone);
    onChange(nextRange);
  };

  const handleCustomDate = (start: Date | null, end: Date | null) => {
    if (!start || !end) return;
    onChange({ start, end, preset: 'custom', timezone: value.timezone });
  };

  const handleTimezoneChange = (timezone: string) => {
    onChange({ ...value, timezone });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2" aria-label="Datumsbereich Presets">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePreset(preset.value)}
            className={`rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              value.preset === preset.value
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-background text-foreground border-border hover:bg-accent'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...value, preset: 'custom' })}
          className={`rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
            value.preset === 'custom'
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-background text-foreground border-border hover:bg-accent'
          }`}
        >
          Benutzerdefiniert
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Start</label>
          <DatePicker
            selected={value.start}
            onChange={(date) => handleCustomDate(date, value.end)}
            selectsStart
            startDate={value.start}
            endDate={value.end}
            showTimeSelect
            dateFormat="dd.MM.yyyy HH:mm"
            className="w-48 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Ende</label>
          <DatePicker
            selected={value.end}
            onChange={(date) => handleCustomDate(value.start, date)}
            selectsEnd
            startDate={value.start}
            endDate={value.end}
            minDate={value.start}
            showTimeSelect
            dateFormat="dd.MM.yyyy HH:mm"
            className="w-48 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Timezone</label>
          <select
            aria-label="Timezone auswaehlen"
            value={value.timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-56 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
