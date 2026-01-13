import { memo } from 'react';
import { cn } from '../../lib/utils';

export const HeroHeader = memo(function HeroHeader({
  title,
  subtitle,
  actions,
  chips,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  chips?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm", className)}>
      {/* Premium Gradient Background - Subtle & Professional */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle at top right, var(--primary), transparent 60%)',
        }}
      />

      {/* Accent Line - Refined Ruby Gradient */}
      <div
        className="absolute inset-x-0 top-0 h-[1px] opacity-70"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 max-w-3xl space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance-header animate-fade-in-up">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl animate-fade-in-up delay-100">
                {subtitle}
              </p>
            )}
            {chips && <div className="mt-5 flex flex-wrap gap-2 animate-fade-in-up delay-200">{chips}</div>}
          </div>

          {actions && (
            <div className="shrink-0 flex flex-wrap gap-3 items-center w-full sm:w-auto sm:justify-end animate-fade-in-up delay-300">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
