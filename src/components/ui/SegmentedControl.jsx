import React, { useCallback, useMemo } from 'react';
import { cx } from './uiPrimitives';

const sizes = {
  sm: 'text-xs h-8',
  md: 'text-sm h-10',
};

const SegmentedControl = ({ options = [], value, onChange, size = 'md', className = '' }) => {
  const selected = useMemo(() => options.find((o) => o.value === value)?.value, [options, value]);

  const handleKeyDown = useCallback(
    (e, idx) => {
      if (!onChange) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = options[(idx + 1) % options.length];
        onChange(next?.value);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = options[(idx - 1 + options.length) % options.length];
        onChange(prev?.value);
      }
    },
    [onChange, options]
  );

  return (
    <div
      className={cx(
        'inline-flex items-center rounded-full border border-border/60 bg-card/60 p-1 gap-1',
        className
      )}
      role="group"
      aria-label="Segmented control"
    >
      {options.map((opt, idx) => {
        const active = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cx(
              'rounded-full px-3 font-medium transition-colors',
              sizes[size] || sizes.md,
              active
                ? 'bg-accent text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            )}
            aria-pressed={active}
          >
            <span className="inline-flex items-center gap-2">
              {opt.icon || null}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
