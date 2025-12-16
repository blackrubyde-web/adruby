export function statusBadgeClasses(variant = 'neutral') {
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium';
  const map = {
    neutral: 'bg-card/60 border-border/60 text-muted-foreground',
    info: 'bg-accent/60 border-border/60 text-foreground',
    success: 'bg-secondary/70 border-border/60 text-foreground',
    warning: 'bg-secondary/60 border-border/60 text-foreground',
    danger: 'bg-accent/50 border-border/60 text-foreground',
  };
  return `${base} ${map[variant] ?? map.neutral}`;
}

export function deltaClasses(direction = 'flat') {
  const base = 'inline-flex items-center gap-1 text-xs font-semibold';
  const map = {
    up: 'text-foreground',
    down: 'text-muted-foreground',
    flat: 'text-muted-foreground',
  };
  return `${base} ${map[direction] ?? map.flat}`;
}
