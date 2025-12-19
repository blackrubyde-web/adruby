import React from 'react';

interface MarketingShellProps {
  children: React.ReactNode;
}

/**
 * MARKETING SHELL
 * 
 * For Landing, Features, Pricing pages.
 * Full-width sections, marketing spacing rhythm, no sidebar.
 * 
 * NEVER use AppShell components here (no Sidebar, no Header, no max-width container).
 */
export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Marketing content renders its own GlobalNav */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
