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
}

interface KpiCardGridProps {
    kpis: KpiItem[];
}

export function KpiCardGrid({ kpis }: KpiCardGridProps) {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
        >
            {kpis.map((kpi, index) => (
                <motion.div key={index} variants={fadeUp}>
                    <Card variant="glass" className="hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-gradient-to-r from-primary/40 to-primary/10 group-hover:from-primary/60 group-hover:to-primary/30 transition-all duration-300" />

                        <CardContent className="p-5 pt-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-body-sm text-muted-foreground mb-2 font-medium">{kpi.label}</div>
                                    <div className="text-h3 text-foreground mb-2">
                                        {kpi.value}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md ${kpi.isPositive
                                                ? 'text-green-600 bg-green-500/10'
                                                : 'text-muted-foreground bg-muted/50'
                                                }`}
                                        >
                                            {kpi.isPositive ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            {kpi.change}
                                        </span>
                                        <span className="text-muted-foreground">{kpi.comparison}</span>
                                    </div>
                                </div>

                                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-primary/10 transition-transform duration-300">
                                    {kpi.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}

export type { KpiItem };
