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
    hero?: React.ReactNode; // Custom hero content overrides default HeroHeader
}

export function DashboardShell({
    children,
    className,
    title,
    subtitle,
    headerActions,
    headerChips,
    hero,
}: DashboardShellProps) {
    return (
        <div className={cn("w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 animate-fade-in-up", className)}>
            {/* 
        If a custom hero is provided, render it.
        Otherwise, if title is provided, render the standard HeroHeader.
      */}
            {hero ? (
                hero
            ) : title ? (
                <HeroHeader
                    title={title}
                    subtitle={subtitle}
                    actions={headerActions}
                    chips={headerChips}
                />
            ) : null}

            <div className="space-y-8">
                {children}
            </div>
        </div>
    );
}
