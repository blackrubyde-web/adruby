import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import Skeleton from '../../../components/ui/Skeleton';
import Button from '../../../components/ui/Button';

const MetaAdPreview = ({ ad }) => {
  const hasContent = ad && (ad.headline || ad.primaryText);
  return (
    <div className={`${UI.card} ${UI.cardHover} p-6 space-y-4`}>
      <div>
        <p className={UI.meta}>Live Preview</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-accent/80 border border-border" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{ad?.brand || 'Brand'}</p>
          <p className="text-[11px] text-muted-foreground">Sponsored</p>
        </div>
      </div>
      {hasContent ? (
        <>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground line-clamp-2">{ad?.headline || 'Headline'}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-4">
              {ad?.primaryText || ad?.text || 'Ad copy folgt...'}
            </p>
            {ad?.description && <p className="text-xs text-muted-foreground">{ad.description}</p>}
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 space-y-3">
            <div className="h-36 w-full rounded-lg bg-background border border-border/60" />
            {ad?.cta && (
              <Button size="sm" className="w-fit" variant="secondary">
                {ad.cta}
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-20 w-full rounded-xl bg-card" />
          <Skeleton className="h-32 w-full rounded-xl bg-card" />
        </div>
      )}
    </div>
  );
};

export default MetaAdPreview;
