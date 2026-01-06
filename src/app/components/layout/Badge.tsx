import { cn } from '../ui/utils';
import type { ReactNode } from 'react';

export function Badge({
    children,
    variant = 'default',
    className
}: {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'primary';
    className?: string;
}) {
    const variants: Record<string, string> = {
        default: "bg-primary/10 text-primary border-primary/20",
        success: "bg-green-500/10 text-green-600 border-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        primary: "bg-primary/10 text-primary border-primary/20",
    };

    return (
        <span className={cn(
            "inline-flex px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
            variants[variant] || variants.default,
            className
        )}>
            {children}
        </span>
    );
}
