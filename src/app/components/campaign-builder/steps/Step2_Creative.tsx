import { useCampaignBuilder, SavedAd } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { CheckCircle2, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState, useMemo } from 'react';

const AdCard = ({ ad, isSelected, onToggle }: { ad: SavedAd; isSelected: boolean; onToggle: (id: string) => void }) => (
    <div
        onClick={() => onToggle(ad.id)}
        className={cn(
            "relative group p-4 rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-4",
            isSelected
                ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(167,139,250,0.15)]"
                : "border-transparent bg-muted/40 hover:bg-muted/60 hover:border-border"
        )}
    >
        <div className="flex gap-4 items-start">
            {ad.thumbnail ? (
                <img src={ad.thumbnail} className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0" alt="" />
            ) : (
                <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 opacity-40" />
                </div>
            )}
            <div className="min-w-0">
                <h3 className="font-bold text-foreground truncate text-sm">{ad.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>
                <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-background/50 border border-border text-[10px] font-mono text-muted-foreground">
                        ROAS: 2.4x
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-background/50 border border-border text-[10px] font-mono text-muted-foreground">
                        CTR: 1.2%
                    </span>
                </div>
            </div>
        </div>

        <div className={cn(
            "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            isSelected ? "bg-primary border-primary scale-110" : "border-border group-hover:border-primary/50"
        )}>
            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
    </div>
);

export const Step2_Creative = () => {
    const { ads, selectedIds, setSelectedIds, handleNext } = useCampaignBuilder();
    const [filter, setFilter] = useState<'all' | 'top'>('all');

    const handleToggle = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const displayedAds = useMemo(() => {
        // In a real app, 'top' would filter by performance metrics
        return filter === 'top' ? ads.slice(0, 3) : ads;
    }, [ads, filter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Select Creatives</h2>
                    <p className="text-muted-foreground">Choose high-performing ads for this campaign.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All Creatives
                    </Button>
                    <Button
                        variant={filter === 'top' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('top')}
                        className="gap-2"
                    >
                        <Filter className="w-3 h-3" /> Top Performers
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                {displayedAds.map(ad => (
                    <AdCard
                        key={ad.id}
                        ad={ad}
                        isSelected={selectedIds.includes(ad.id)}
                        onToggle={handleToggle}
                    />
                ))}
                {displayedAds.length === 0 && (
                    <div className="col-span-3 py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        No creatives found.
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-8 border-t border-border">
                <div className="text-sm text-muted-foreground flex items-center">
                    {selectedIds.length} ads selected
                </div>
                <Button size="lg" onClick={handleNext} disabled={selectedIds.length === 0} className="gap-2 px-8">
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
