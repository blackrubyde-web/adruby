import type { ComponentType, SVGProps } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { fadeUp, scaleIn } from '../lib/motion';

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Compact mode for inline widgets (no outer card wrapper) */
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const content = (
    <motion.div
      className="flex flex-col items-center text-center"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Icon container with gradient ring */}
      <motion.div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center mb-5 shadow-sm"
        variants={scaleIn}
      >
        <Icon className="w-7 h-7 text-primary/60" />
      </motion.div>

      <h3 className="text-lg font-bold text-foreground mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );

  if (compact) return content;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-12 sm:p-16">
      {content}
    </div>
  );
}
