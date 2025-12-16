import React from 'react';
import { UI } from './uiPrimitives';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

const ChartCard = ({
  title,
  subtitle,
  rightActions,
  isLoading = false,
  isEmpty = false,
  emptyTitle = 'Keine Daten',
  emptyDescription = 'Für diesen Zeitraum liegen keine Daten vor.',
  emptyActionLabel,
  emptyOnAction,
  className = '',
  children,
}) => {
  return (
    <div className={`${UI.card} ${UI.cardHover} p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {title ? <p className={UI.h2}>{title}</p> : null}
          {subtitle ? <p className={`${UI.meta} mt-1`}>{subtitle}</p> : null}
        </div>
        {rightActions}
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl bg-card" />
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={emptyActionLabel} onAction={emptyOnAction} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
