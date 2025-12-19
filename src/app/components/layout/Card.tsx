export function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={
        "rounded-xl border border-border/60 bg-card " +
        "shadow-[0_1px_0_rgba(255,255,255,0.6),0_10px_30px_rgba(0,0,0,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}
