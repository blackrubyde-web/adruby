import React from 'react';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {children}
    </div>
  );
}