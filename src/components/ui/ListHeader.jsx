import React from 'react';
import { UI, cx } from './uiPrimitives';

const ListHeader = ({ title, subtitle, left, right, count }) => {
  return (
    <div className={cx(UI.card, UI.cardHover, 'p-4 flex flex-wrap items-start justify-between gap-4')}>
      <div className="space-y-1">
        {title ? <h2 className={UI.h2}>{title}</h2> : null}
        {subtitle ? <p className={UI.meta}>{subtitle}</p> : null}
        {typeof count === 'number' ? <p className="text-xs text-muted-foreground">Einträge: {count}</p> : null}
        {left}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
};

export default ListHeader;
