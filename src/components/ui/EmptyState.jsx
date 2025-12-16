import React from 'react';
import Button from './Button';
import { UI } from './uiPrimitives';

const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className={`${UI.card} ${UI.cardHover} p-5 text-center`}>
      <h3 className={UI.h2}>{title}</h3>
      {description ? <p className={`${UI.meta} mt-1`}>{description}</p> : null}
      {actionLabel ? (
        <div className="mt-4 flex justify-center">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
