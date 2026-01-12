
import { Check, Star } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

export function PricingCard({
    title,
    price,
    period,
    features,
    cta,
    onCtaClick,
    featured = false,
    className
}: {
    title: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
    onCtaClick: () => void;
    featured?: boolean;
    className?: string;
}) {
    return (
        <Card className={cn("relative p-8 flex flex-col h-full", featured ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "border-border/50", className)}>
            {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">Most Popular</Badge>
                </div>
            )}

            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">{price}</span>
                    <span className="text-muted-foreground">/{period}</span>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                ))}
            </div>

            <Button
                onClick={onCtaClick}
                variant={featured ? "default" : "outline"}
                className="w-full font-bold"
            >
                {cta}
            </Button>
        </Card>
    );
}

export function Tabs({
    tabs,
    activeTab,
    onTabChange,
    className
}: {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-wrap justify-center gap-2", className)}>
            {tabs.map((tab) => (
                <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "ghost"}
                    onClick={() => onTabChange(tab)}
                    className={cn("rounded-full px-6", activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                    {tab}
                </Button>
            ))}
        </div>
    );
}
