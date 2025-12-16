import React from 'react';
import { UI } from './uiPrimitives';

const PageShell = ({ title, subtitle, rightActions, children }) => {
  return (
    <div className="px-4 lg:px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {title ? <h1 className={UI.h1}>{title}</h1> : null}
          {subtitle ? <p className={UI.meta}>{subtitle}</p> : null}
        </div>
        {rightActions || null}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
};

export default PageShell;
