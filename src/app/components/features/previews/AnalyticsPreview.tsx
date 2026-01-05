
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Target, DollarSign } from 'lucide-react';

const data = [
    { name: 'Mon', roas: 2.4, spend: 1200 },
    { name: 'Tue', roas: 3.1, spend: 1400 },
    { name: 'Wed', roas: 2.8, spend: 1100 },
    { name: 'Thu', roas: 4.2, spend: 1800 },
    { name: 'Fri', roas: 5.1, spend: 2200 },
    { name: 'Sat', roas: 4.8, spend: 2000 },
    { name: 'Sun', roas: 5.6, spend: 2400 },
];

export const AnalyticsPreview = () => {
    return (
        <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none flex flex-col">
            {/* Fake Top Bar */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Overview
                </h3>
                <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-md bg-zinc-800 text-xs text-zinc-400">Last 7 Days</div>
                    <div className="px-3 py-1 rounded-md bg-white text-xs text-black font-bold">Export Report</div>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-zinc-400">Total ROAS</span>
                            <Target className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">4.82x</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +12.4% vs last week
                        </div>
                    </div>
                    <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-zinc-400">Total Spend</span>
                            <DollarSign className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">€12.4K</div>
                        <div className="text-[10px] text-zinc-500">
                            On track
                        </div>
                    </div>
                    <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-zinc-400">Conversions</span>
                            <div className="w-4 h-4 rounded-full border border-zinc-700"></div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">482</div>
                        <div className="text-[10px] text-green-400">
                            CpA €25.12
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-xl p-4 relative">
                    <div className="absolute top-4 left-4 text-xs font-semibold text-zinc-300 z-10">Performance Trend</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRoas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};
