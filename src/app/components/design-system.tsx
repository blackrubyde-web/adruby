import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Card as UICard } from './ui/card';
import { Button as UIButton } from './ui/button';
import { Badge as UIBadge } from './ui/badge';
import { Input as UIInput } from './ui/input';

// ============================================
// DEPRECATED TOKENS - USE TAILWIND UTILITIES
// ============================================

export const tokens = {
  container: "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8",
  marketingContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
};

// ============================================
// LAYOUT COMPONENTS
// ============================================

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(tokens.container, className)}>{children}</div>;
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center'
}: {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn("mb-10 sm:mb-12", align === 'center' && 'text-center')}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-balance-header">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

// ============================================
// CARDS (Wrappers for unified UI)
// ============================================

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <UICard
      data-deprecated="use-ui-card-directly"
      onClick={onClick}
      className={cn("p-0", className)} // Reset padding as new card handles it in variant or content
    >
      <div className="p-6 h-full flex flex-col">{children}</div>
    </UICard>
  );
}

export function FeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <UICard variant="feature" className={cn("p-8", className)}>
      {children}
    </UICard>
  );
}

// ============================================
// BUTTONS
// ============================================

export function PrimaryButton({ children, onClick, className }: any) {
  return <UIButton variant="default" onClick={onClick} className={className}>{children}</UIButton>;
}

export function SecondaryButton({ children, onClick, className }: any) {
  return <UIButton variant="secondary" onClick={onClick} className={className}>{children}</UIButton>;
}

// ============================================
// BADGES & CHIPS
// ============================================

export function Chip({
  children,
  variant = 'default',
  icon
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'neutral'
  icon?: ReactNode
}) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    default: "default",
    success: "outline", // TODO: Add success variant to Badge
    warning: "secondary",
    info: "secondary",
    neutral: "outline",
  };

  return (
    <UIBadge variant={map[variant] || "outline"} className="gap-1.5 px-3 py-1 text-xs font-medium rounded-full">
      {icon}
      {children}
    </UIBadge>
  );
}

export { Input as UIInput } from './ui/input';
export { Badge } from './ui/badge';

