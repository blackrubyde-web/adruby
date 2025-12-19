import { ReactNode } from 'react';
import { cn } from '../lib/utils';

// ============================================
// BASE TOKENS & CLASSES
// ============================================

export const tokens = {
  // Layout
  container: "max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8", // For dashboard pages
  marketingContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", // For landing/marketing pages (1280px)
  
  // Cards
  card: "rounded-xl bg-card border border-border/60 shadow-[0_1px_0_rgba(255,255,255,0.6),0_10px_30px_rgba(0,0,0,0.06)]",
  featureCard: "rounded-2xl bg-card border border-primary/20 shadow-[0_1px_0_rgba(255,255,255,0.7),0_20px_60px_rgba(0,0,0,0.12)]",
  
  // Buttons
  primaryButton: "px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20",
  secondaryButton: "px-6 py-3 rounded-xl border border-border/70 bg-card hover:bg-muted font-semibold transition-colors",
  
  // Spacing
  sectionSpacing: "py-20 sm:py-24",
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
    <div className={cn("mb-12 sm:mb-16", align === 'center' && 'text-center')}>
      <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

// ============================================
// CARDS
// ============================================

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(tokens.card, "p-6", className)}
    >
      {children}
    </div>
  );
}

export function FeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(tokens.featureCard, "p-8", className)}>
      {children}
    </div>
  );
}

export function StatCard({ 
  value, 
  label, 
  icon 
}: { 
  value: string; 
  label: string; 
  icon?: ReactNode 
}) {
  return (
    <div className={tokens.card + " p-6"}>
      {icon && <div className="mb-4">{icon}</div>}
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  avatar 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  avatar?: string 
}) {
  return (
    <div className={tokens.card + " p-6"}>
      <p className="text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
            {avatar}
          </div>
        )}
        <div>
          <div className="font-semibold text-sm">{author}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}

export function PricingCard({ 
  title, 
  price, 
  period, 
  features, 
  cta, 
  onCtaClick,
  featured = false 
}: { 
  title: string; 
  price: string; 
  period: string; 
  features: string[]; 
  cta: string; 
  onCtaClick: () => void;
  featured?: boolean 
}) {
  return (
    <div className={cn(
      featured ? tokens.featureCard : tokens.card,
      "p-8",
      featured && "border-primary/30"
    )}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={onCtaClick}
        className={cn(
          "w-full py-3 rounded-xl font-semibold transition-all",
          featured 
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            : "border border-border bg-card hover:bg-muted"
        )}
      >
        {cta}
      </button>
    </div>
  );
}

// ============================================
// BUTTONS
// ============================================

export function PrimaryButton({ 
  children, 
  onClick, 
  className 
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  className?: string 
}) {
  return (
    <button onClick={onClick} className={cn(tokens.primaryButton, className)}>
      {children}
    </button>
  );
}

export function SecondaryButton({ 
  children, 
  onClick, 
  className 
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  className?: string 
}) {
  return (
    <button onClick={onClick} className={cn(tokens.secondaryButton, className)}>
      {children}
    </button>
  );
}

// ============================================
// FORM ELEMENTS
// ============================================

export function Input({ 
  placeholder, 
  value, 
  onChange, 
  className 
}: { 
  placeholder?: string; 
  value?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  className?: string 
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
        className
      )}
    />
  );
}

// ============================================
// TABS
// ============================================

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}: { 
  tabs: string[]; 
  activeTab: string; 
  onTabChange: (tab: string) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
            activeTab === tab
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-card border border-border/60 hover:bg-muted"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
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
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    neutral: "bg-muted/10 text-muted-foreground border-border/40",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
      variants[variant]
    )}>
      {icon}
      {children}
    </span>
  );
}

export function Badge({ 
  children, 
  variant = 'default',
  className
}: { 
  children: ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'primary',
  className?: string
}) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
  };
  
  return (
    <span className={cn(
      "inline-flex px-2 py-1 rounded-full border text-xs font-semibold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
