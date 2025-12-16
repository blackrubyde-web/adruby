import React, { useEffect, useRef, useState } from 'react';
import { UI, cx } from './uiPrimitives';

const ActionMenu = ({ trigger, items = [], align = 'right' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={UI.btnQuiet} aria-haspopup="menu">
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute z-30 mt-2 min-w-[180px] rounded-xl border border-border bg-popover text-popover-foreground shadow-lg',
            align === 'left' ? 'left-0' : 'right-0'
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className={cx(
                'w-full px-4 py-3 text-left text-sm transition-colors',
                item.danger ? 'hover:bg-accent/40 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
              role="menuitem"
            >
              <span className="inline-flex items-center gap-2">
                {item.icon || null}
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
