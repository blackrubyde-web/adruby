export function FeatureCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-primary/20 bg-card " +
        "shadow-[0_1px_0_rgba(255,255,255,0.7),0_20px_60px_rgba(0,0,0,0.12)] " +
        className
      }
    >
      {children}
    </div>
  );
}
