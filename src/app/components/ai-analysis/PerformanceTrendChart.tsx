import { memo, useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card } from '../ui/card';

interface DataPoint {
    date: string;
    roas: number;
    ctr: number;
    spend: number;
    revenue: number;
}

interface PerformanceTrendChartProps {
    data: DataPoint[];
    title?: string;
}

type TimeRange = '7d' | '14d' | '30d';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
            <p className="text-xs text-white/50 mb-2">{label}</p>
            <div className="space-y-2">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-white/70">{entry.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                            {entry.name === 'ROAS' ? `${entry.value.toFixed(2)}x` :
                                entry.name === 'CTR' ? `${entry.value.toFixed(2)}%` :
                                    `€${entry.value.toFixed(0)}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PerformanceTrendChart = memo(function PerformanceTrendChart({
    data,
    title = 'Performance Trend',
}: PerformanceTrendChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [activeMetric, setActiveMetric] = useState<'roas' | 'ctr' | 'spend'>('roas');

    const filteredData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
        return data.slice(-days);
    }, [data, timeRange]);

    const trend = useMemo(() => {
        if (filteredData.length < 2) return { direction: 'stable', change: 0 };
        const first = filteredData[0][activeMetric];
        const last = filteredData[filteredData.length - 1][activeMetric];
        const change = first > 0 ? ((last - first) / first) * 100 : 0;
        return {
            direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
            change,
        };
    }, [filteredData, activeMetric]);

    const gradientColors = useMemo(() => {
        if (activeMetric === 'roas') return { start: '#8b5cf6', end: '#a855f7' };
        if (activeMetric === 'ctr') return { start: '#10b981', end: '#34d399' };
        return { start: '#3b82f6', end: '#60a5fa' };
    }, [activeMetric]);

    if (!data.length) {
        return (
            <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">Keine Trend-Daten verfügbar</p>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950 border-white/5 p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),transparent_60%)] blur-[60px] animate-pulse-slow" />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center">
                            {trend.direction === 'up' ? (
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            ) : trend.direction === 'down' ? (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            ) : (
                                <Calendar className="w-5 h-5 text-violet-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <p className="text-xs text-white/50 flex items-center gap-2">
                                <span className={trend.direction === 'up' ? 'text-emerald-400' : trend.direction === 'down' ? 'text-red-400' : 'text-white/50'}>
                                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                                </span>
                                <span>vs. Periode</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Metric Toggles */}
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {(['roas', 'ctr', 'spend'] as const).map((metric) => (
                                <button
                                    key={metric}
                                    onClick={() => setActiveMetric(metric)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeMetric === metric
                                            ? 'bg-violet-600 text-white shadow-lg'
                                            : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    {metric.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Time Range */}
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.05)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                dy={10}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                dx={-10}
                                tickFormatter={(value) =>
                                    activeMetric === 'roas' ? `${value}x` :
                                        activeMetric === 'ctr' ? `${value}%` :
                                            `€${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                                }
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                type="monotone"
                                dataKey={activeMetric}
                                name={activeMetric.toUpperCase()}
                                stroke={gradientColors.start}
                                strokeWidth={2.5}
                                fill={`url(#gradient-${activeMetric})`}
                                animationDuration={1000}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
});
