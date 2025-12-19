export function HeroHeader({
  title,
  subtitle,
  actions,
  chips,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  chips?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_1px_0_rgba(255,255,255,0.6),0_16px_40px_rgba(0,0,0,0.08)]">
      {/* Animated Rainbow Line - Only Top */}
      <div 
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #C80000, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff, #9b59b6, #C80000)',
          backgroundSize: '200% 100%',
          animation: 'rainbow-border 8s linear infinite'
        }}
      />
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {chips && <div className="mt-4 flex flex-wrap gap-2">{chips}</div>}
          </div>

          {actions && <div className="shrink-0 flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}