import { Skeleton } from '../components/ui/skeleton';
import { cn } from './utils';

// ─── Generic Skeletons for Dashboard ──────────────────

/** Metric card skeleton (KPI card placeholder) */
export function MetricCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-card border border-border/50 rounded-2xl p-6 space-y-4', className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

/** Chart skeleton (area/bar chart placeholder) */
export function ChartSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-card border border-border/50 rounded-2xl p-6 space-y-4', className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
            </div>
            <div className="flex items-end gap-1 h-48 pt-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

/** Table skeleton (5-row table placeholder) */
export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <div className={cn('bg-card border border-border/50 rounded-2xl overflow-hidden', className)}>
            {/* Header */}
            <div className="flex gap-4 px-6 py-4 bg-muted/30 border-b border-border/30">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28 ml-auto" />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border/20 last:border-0">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20 rounded-full ml-auto" />
                </div>
            ))}
        </div>
    );
}

/** Full page skeleton (for Suspense fallbacks) */
export function PageSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('p-6 md:p-8 space-y-6 animate-in fade-in duration-300', className)}>
            {/* Page header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <MetricCardSkeleton key={i} />
                ))}
            </div>

            {/* Chart + table row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ChartSkeleton className="lg:col-span-2" />
                <TableSkeleton rows={4} />
            </div>
        </div>
    );
}
