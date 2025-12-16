import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import Skeleton from '../../../components/ui/Skeleton';
import Button from '../../../components/ui/Button';

const MetaAdPreview = ({ ad }) => {
  const hasContent = ad && (ad.headline || ad.primaryText);
  return (
    <div className={`${UI.card} p-4 space-y-2`}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-accent" />
        <div>
          <p className="text-sm font-semibold text-foreground">{ad?.brand || 'Brand'}</p>
          <p className="text-xs text-muted-foreground">Sponsored</p>
        </div>
      </div>
      {hasContent ? (
        <>
          <p className="text-sm font-semibold text-foreground">{ad?.headline || 'Headline'}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {ad?.primaryText || ad?.text || 'Ad copy folgt...'}
          </p>
          {ad?.description && <p className="text-xs text-muted-foreground">{ad.description}</p>}
          {ad?.cta && (
            <Button size="sm" className="mt-2 w-fit" variant="default">
              {ad.cta}
            </Button>
          )}
        </>
      ) : (
        <Skeleton className="h-32 w-full rounded-xl bg-card" />
      )}
    </div>
  );
};

export default MetaAdPreview;
