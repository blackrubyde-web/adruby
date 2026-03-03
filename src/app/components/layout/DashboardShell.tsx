import React from 'react';
import { cn } from '../../lib/utils';
import { HeroHeader } from './HeroHeader';

interface DashboardShellProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    headerActions?: React.ReactNode;
    headerChips?: React.ReactNode;
    hero?: React.ReactNode;
    hideHero?: boolean;
}

export function DashboardShell({
    children,
    className,
    title,
    subtitle,
    headerActions,
    headerChips,
    hero,
    hideHero,
}: DashboardShellProps) {
    return (
        <>
            {/* Skip-to-content accessibility link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm font-semibold"
            >
                Zum Inhalt springen
            </a>
            <div
                id="main-content"
                role="main"
                className={cn("w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in-up", className)}
            >
                {/* 
        If a custom hero is provided, render it.
        Otherwise, if title is provided, render the standard HeroHeader.
      */}
                {hideHero ? null : hero ? (
                    hero
                ) : title ? (
                    <HeroHeader
                        title={title}
                        subtitle={subtitle}
                        actions={headerActions}
                        chips={headerChips}
                    />
                ) : null}

                <div className="space-y-6 sm:space-y-8">
                    {children}
                </div>
            </div>
        </>
    );
}
