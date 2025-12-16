import React from 'react';
import { cx, UI } from './uiPrimitives';

const FilterBar = ({ left, right, className = '' }) => {
  return (
    <div className={cx(UI.card, 'p-3 md:p-4 flex flex-wrap items-center justify-between gap-3 bg-card/60 border-border/60', className)}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
};

export default FilterBar;
