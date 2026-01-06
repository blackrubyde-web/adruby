import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StrategySimulationPreviewProps {
    targetRoas: number;
    riskTolerance: 'low' | 'medium' | 'high';
    scaleSpeed: 'slow' | 'medium' | 'fast' | 'aggressive';
}

export function StrategySimulationPreview({ targetRoas, riskTolerance, scaleSpeed }: StrategySimulationPreviewProps) {
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

    useEffect(() => {
        // Generate simulation data based on parameters
        const newPoints = [];
        let currentRoas = targetRoas * 0.8; // Start slightly below target
        const volatility = riskTolerance === 'high' ? 0.4 : riskTolerance === 'medium' ? 0.2 : 0.05;
        const growthRate = scaleSpeed === 'aggressive' ? 0.05 : scaleSpeed === 'fast' ? 0.03 : scaleSpeed === 'medium' ? 0.015 : 0.005;

        for (let i = 0; i <= 30; i++) {
            // Simple random walk with trend
            const randomChange = (Math.random() - 0.5) * volatility;
            // Aggressive strategies correct faster but wiggle more
            const trendCorrection = (targetRoas - currentRoas) * (scaleSpeed === 'aggressive' ? 0.2 : 0.1);

            currentRoas = currentRoas + randomChange + trendCorrection + (Math.random() * growthRate);

            // Clamp reasonable values
            if (currentRoas < 0.5) currentRoas = 0.5;
            if (currentRoas > targetRoas * 1.5) currentRoas = targetRoas * 1.5;

            newPoints.push({ x: i, y: currentRoas });
        }
        setPoints(newPoints);
    }, [targetRoas, riskTolerance, scaleSpeed]);

    // SVG Path generation
    const width = 100;
    const height = 50;
    const maxY = Math.max(...points.map(p => p.y), targetRoas * 1.2);
    const minY = Math.min(...points.map(p => p.y), targetRoas * 0.5);

    const getCoord = (p: { x: number, y: number }) => {
        const x = (p.x / 30) * width;
        const y = height - ((p.y - minY) / (maxY - minY)) * height;
        return `${x},${y}`;
    };

    const pathD = points.length > 0 ? `M ${points.map(getCoord).join(' L ')}` : '';
    const areaD = points.length > 0 ? `${pathD} L ${width},${height} L 0,${height} Z` : '';

    return (
        <div className="w-full h-full min-h-[120px] relative bg-black/20 rounded-xl overflow-hidden border border-white/5 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start z-10">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">30-Day Projection</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskTolerance === 'high' ? 'bg-red-500/20 text-red-400' :
                        riskTolerance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {riskTolerance === 'high' ? 'VOLATILE' : riskTolerance === 'medium' ? 'BALANCED' : 'STABLE'}
                </span>
            </div>

            <div className="absolute inset-0 pt-8 px-0 pb-0">
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Target Line */}
                    <line
                        x1="0"
                        y1={height - ((targetRoas - minY) / (maxY - minY)) * height}
                        x2={width}
                        y2={height - ((targetRoas - minY) / (maxY - minY)) * height}
                        stroke="rgba(255,255,255,0.1)"
                        strokeDasharray="4 2"
                        strokeWidth="1"
                    />

                    {/* Gradient Defs */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={riskTolerance === 'high' ? '#ef4444' : '#10b981'} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={riskTolerance === 'high' ? '#ef4444' : '#10b981'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <motion.path
                        d={areaD}
                        fill="url(#chartGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke={riskTolerance === 'high' ? '#ef4444' : '#10b981'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
            </div>

            <div className="flex justify-between items-end z-10 mt-auto pt-8">
                <div className="text-[10px] text-muted-foreground">Ad Spend</div>
                <div className={`text-lg font-bold ${riskTolerance === 'high' ? 'text-red-400' : 'text-emerald-400'}`}>
                    ~{targetRoas}x <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">ROAS</span>
                </div>
            </div>
        </div>
    );
}
