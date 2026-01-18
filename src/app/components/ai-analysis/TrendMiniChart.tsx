import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendMiniChartProps {
    data: number[];
    label?: string;
    unit?: string;
    showTrend?: boolean;
    height?: number;
    color?: 'auto' | 'green' | 'red' | 'blue';
}

export const TrendMiniChart = memo(function TrendMiniChart({
    data,
    label,
    unit = '',
    showTrend = true,
    height = 40,
    color = 'auto',
}: TrendMiniChartProps) {
    const { points, trend, trendColor, currentValue, changePercent } = useMemo(() => {
        if (!data || data.length < 2) {
            return { points: '', trend: 'stable', trendColor: 'text-white/40', currentValue: data?.[0] ?? 0, changePercent: 0 };
        }

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        // Calculate SVG path
        const width = 100;
        const stepX = width / (data.length - 1);
        const padding = 2;
        const effectiveHeight = height - padding * 2;

        const pathPoints = data.map((value, i) => {
            const x = i * stepX;
            const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
            return `${x},${y}`;
        });

        // Calculate trend
        const first = data.slice(0, Math.ceil(data.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(data.length / 3);
        const last = data.slice(-Math.ceil(data.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(data.length / 3);
        const change = first !== 0 ? ((last - first) / first) * 100 : 0;

        let trend = 'stable';
        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';

        let trendColor = 'text-white/40';
        if (color === 'auto') {
            trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40';
        } else if (color === 'green') {
            trendColor = 'text-emerald-400';
        } else if (color === 'red') {
            trendColor = 'text-red-400';
        } else if (color === 'blue') {
            trendColor = 'text-blue-400';
        }

        return {
            points: `M ${pathPoints.join(' L ')}`,
            trend,
            trendColor,
            currentValue: data[data.length - 1],
            changePercent: change,
        };
    }, [data, height, color]);

    const strokeColor = useMemo(() => {
        if (color === 'green') return '#10b981';
        if (color === 'red') return '#ef4444';
        if (color === 'blue') return '#3b82f6';
        // Auto
        if (trend === 'up') return '#10b981';
        if (trend === 'down') return '#ef4444';
        return '#6b7280';
    }, [color, trend]);

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    if (!data || data.length < 2) {
        return (
            <div className="flex items-center gap-2 text-white/40 text-sm">
                <Minus className="w-4 h-4" />
                <span>Keine Daten</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {/* Sparkline Chart */}
            <div className="relative" style={{ width: 80, height }}>
                <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
                    {/* Gradient fill */}
                    <defs>
                        <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                        d={`${points} L 100,${height} L 0,${height} Z`}
                        fill={`url(#gradient-${label})`}
                    />

                    {/* Line */}
                    <path
                        d={points}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* End dot */}
                    <circle
                        cx="100"
                        cy={data.length > 1 ? 2 + (height - 4) - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 4) : height / 2}
                        r="3"
                        fill={strokeColor}
                    />
                </svg>
            </div>

            {/* Stats */}
            <div className="flex flex-col">
                {label && <span className="text-xs text-white/50">{label}</span>}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">
                        {typeof currentValue === 'number' ? currentValue.toFixed(2) : currentValue}{unit}
                    </span>
                    {showTrend && (
                        <div className={`flex items-center gap-0.5 ${trendColor}`}>
                            <TrendIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">
                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// Export a row of trend charts for an entity
interface TrendChartRowProps {
    ctr?: number[];
    roas?: number[];
    conversions?: number[];
    spend?: number[];
}

export const TrendChartRow = memo(function TrendChartRow({
    ctr,
    roas,
    conversions,
    spend,
}: TrendChartRowProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            {ctr && <TrendMiniChart data={ctr} label="CTR" unit="%" />}
            {roas && <TrendMiniChart data={roas} label="ROAS" unit="x" />}
            {conversions && <TrendMiniChart data={conversions} label="Conv." color="blue" />}
            {spend && <TrendMiniChart data={spend} label="Spend" unit="€" color="blue" />}
        </div>
    );
});
