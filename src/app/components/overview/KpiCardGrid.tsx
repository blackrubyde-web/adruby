import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
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

/** Lightweight inline SVG sparkline — no Recharts dependency */
function MiniSparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    const safeId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-80 group-hover:opacity-100 transition-opacity">
            <defs>
                <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`0,${height} ${pts} ${width},${height}`}
                fill={`url(#${safeId})`}
            />
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
                r="3"
                fill={color}
            />
        </svg>
    );
}

export function KpiCardGrid({ kpis }: KpiCardGridProps) {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
        >
            {kpis.map((kpi, index) => {
                const accent = kpi.accentColor || 'hsl(var(--primary))';
                return (
                    <motion.div key={index} variants={fadeUp}>
                        <Card variant="glass" className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                            <div
                                className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
                                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}40)` }}
                            />
                            <CardContent className="p-4 pt-5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-muted-foreground mb-1.5 font-medium truncate">{kpi.label}</div>
                                        <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums leading-tight mb-2">
                                            {kpi.value}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span
                                                className={`flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md ${kpi.isPositive
                                                    ? 'text-green-600 bg-green-500/10'
                                                    : 'text-red-500 bg-red-500/10'
                                                    }`}
                                            >
                                                {kpi.isPositive ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                {kpi.change}
                                            </span>
                                            <span className="text-muted-foreground hidden sm:inline truncate">{kpi.comparison}</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 mt-1">
                                        {kpi.sparklineData && kpi.sparklineData.length >= 2 ? (
                                            <MiniSparkline data={kpi.sparklineData} color={accent} />
                                        ) : (
                                            <div
                                                className="h-10 w-10 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                style={{
                                                    backgroundColor: `${accent}15`,
                                                    borderColor: `${accent}20`,
                                                    color: accent,
                                                }}
                                            >
                                                {kpi.icon}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

export type { KpiItem };
