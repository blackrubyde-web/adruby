import { cn } from '../ui/utils';
import type { ReactNode } from 'react';

export function Chip({ children, variant = 'default', icon, className }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'info' | 'neutral'; icon?: ReactNode; className?: string }) {
  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    neutral: "bg-muted/10 text-muted-foreground border-border/40",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
      variants[variant] || variants.default,
      className
    )}>
      {icon}
      {children}
    </span>
  );
}
