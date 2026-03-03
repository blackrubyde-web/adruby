import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { stagger, fadeUp, viewport } from '../../lib/motion';

interface KpiItem {
    label: string;
    value: string;
    change: string | null;
    isPositive: boolean;
    comparison: string;
    icon: React.ReactNode;
    accentColor?: string;
    sparklineData?: number[];
}

interface KpiCardGridProps {
    kpis: KpiItem[];
}

/** Lightweight inline SVG sparkline */
function MiniSparkline({ data, width = 72, height = 28 }: { data: number[]; width?: number; height?: number }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-60">
            <polyline
                points={pts}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
            />
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
                r="2"
                fill="hsl(var(--primary))"
            />
        </svg>
    );
}

export function KpiCardGrid({ kpis }: KpiCardGridProps) {
    return (
        <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
        >
            {kpis.map((kpi, index) => (
                <motion.div
                    key={index}
                    variants={fadeUp}
                    className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">{kpi.label}</div>
                            <div className="text-xl font-bold text-foreground tabular-nums leading-tight mb-1.5">
                                {kpi.value}
                            </div>
                            <div className="flex items-center gap-1 text-[11px]">
                                <span
                                    className={`flex items-center gap-0.5 font-medium ${kpi.isPositive
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                        }`}
                                >
                                    {kpi.isPositive ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {kpi.change}
                                </span>
                                <span className="text-muted-foreground/60 hidden sm:inline">{kpi.comparison}</span>
                            </div>
                        </div>
                        {kpi.sparklineData && kpi.sparklineData.length >= 2 && (
                            <div className="shrink-0 mt-2">
                                <MiniSparkline data={kpi.sparklineData} />
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

export type { KpiItem };
