import { AlertTriangle, Loader2 } from 'lucide-react';
import React from 'react';

// ========================================================================
// WIDGET STATE TYPES
// ========================================================================

export type WidgetState = 'loading' | 'empty' | 'ready' | 'error' | 'preview';

// ========================================================================
// HELPER: Calculate Widget State
// ========================================================================

export function getWidgetState({
  loading,
  data,
  isPreview,
  error,
}: {
  loading?: boolean;
  data?: unknown;
  isPreview?: boolean;
  error?: string | null;
}): WidgetState {
  if (isPreview) return 'preview';
  if (error) return 'error';
  if (loading) return 'loading';
  if (!data) return 'empty';
  return 'ready';
}

// ========================================================================
// WIDGET SHELL - Unified wrapper for all widgets
// ========================================================================

interface WidgetShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  state: WidgetState;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'stats';
}

export function WidgetShell({
  title,
  subtitle,
  icon,
  state,
  error,
  emptyTitle = 'No data yet',
  emptyDescription = 'Connect your ad account or wait for data to appear.',
  emptyAction,
  headerAction,
  children,
  variant = 'default',
}: WidgetShellProps) {
  // Stats variant - no header, just content
  if (variant === 'stats') {
    return (
      <div className="h-full w-full rounded-3xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-xl flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex items-center justify-center p-5">
          {state === 'loading' && <WidgetSkeletonContent />}
          {state === 'error' && <WidgetErrorContent message={error} />}
          {state === 'empty' && (
            <WidgetEmptyContent
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          )}
          {(state === 'ready' || state === 'preview') && children}
        </div>
      </div>
    );
  }

  // Default variant - with header
  return (
    <div className="h-full w-full rounded-3xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border/20 shrink-0">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {headerAction}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-5">
        {state === 'loading' && <WidgetSkeletonContent />}
        {state === 'error' && <WidgetErrorContent message={error} />}
        {state === 'empty' && (
          <WidgetEmptyContent
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        )}
        {(state === 'ready' || state === 'preview') && children}
      </div>
    </div>
  );
}

// ========================================================================
// WIDGET EMPTY STATE - Unified empty state
// ========================================================================

interface WidgetEmptyContentProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function WidgetEmptyContent({
  title = 'No data yet',
  description = 'Connect your ad account or wait for data to appear.',
  action,
}: WidgetEmptyContentProps) {
  return (
    <div className="text-center max-w-[240px]">
      <div className="mb-3 text-4xl opacity-30">📊</div>
      <div className="font-semibold text-foreground mb-2">{title}</div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  );
}

// ========================================================================
// WIDGET SKELETON - Loading state
// ========================================================================

export function WidgetSkeletonContent() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-4 bg-muted/40 rounded w-2/3" />
      <div className="h-8 bg-muted/40 rounded w-1/2" />
      <div className="h-24 bg-muted/30 rounded" />
    </div>
  );
}

// ========================================================================
// WIDGET ERROR STATE - Error state
// ========================================================================

interface WidgetErrorContentProps {
  message?: string | null;
}

export function WidgetErrorContent({ message }: WidgetErrorContentProps) {
  return (
    <div className="text-center max-w-[240px]">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
      <div className="text-sm text-red-500 font-medium mb-1">Error Loading Data</div>
      <div className="text-xs text-muted-foreground">{message || 'Something went wrong'}</div>
    </div>
  );
}

// ========================================================================
// LEGACY COMPONENTS (for backwards compatibility)
// ========================================================================

export function WidgetErrorState({ message }: { message: string }) {
  return (
    <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-red-500/30 shadow-xl flex items-center justify-center p-6">
      <WidgetErrorContent message={message} />
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}

export function WidgetEmptyState() {
  return (
    <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl flex items-center justify-center p-6">
      <WidgetEmptyContent />
    </div>
  );
}

interface WidgetLoadingOverlayProps {
  children: React.ReactNode;
}

export function WidgetLoadingOverlay({ children }: WidgetLoadingOverlayProps) {
  return (
    <div className="relative w-full h-full">
      {children}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    </div>
  );
}
