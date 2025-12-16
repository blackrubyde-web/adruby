import React from 'react';
import { UI, cx } from './uiPrimitives';

const DateRangeChip = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(UI.pill, active ? UI.pillActive : '', 'transition-colors')}
      aria-pressed={active}
    >
      {label}
    </button>
  );
};

export default DateRangeChip;
