import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CheckCircle2, Sparkles, Filter, TrendingUp, Star, Search, ImageIcon, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState, useMemo } from 'react';

type FilterType = 'all' | 'top' | 'favorites' | 'recent';

export const Step2_Creative = () => {
    const { creatives, selectedCreativeIds, setSelectedCreativeIds, isLoading } = useCampaignBuilder();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggle = (id: string) => {
        setSelectedCreativeIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedCreativeIds(displayedCreatives.map(c => c.id));
    };

    const handleDeselectAll = () => {
        setSelectedCreativeIds([]);
    };

    const displayedCreatives = useMemo(() => {
        let filtered = creatives;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.productName.toLowerCase().includes(query) ||
                c.headline.toLowerCase().includes(query)
            );
        }

        // Category filter
        switch (filter) {
            case 'top':
                // Sort by ROAS descending, take top performers
                filtered = [...filtered].sort((a, b) => (b.metrics?.roas || 0) - (a.metrics?.roas || 0)).slice(0, 10);
                break;
            case 'favorites':
                // TODO: Implement favorites from localStorage
                break;
            case 'recent':
                filtered = [...filtered].slice(0, 10);
                break;
        }

        return filtered;
    }, [creatives, filter, searchQuery]);

    const formatMetric = (value?: number, suffix = '') => {
        if (value === undefined || value === null) return '—';
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K${suffix}`;
        return `${value.toFixed(value < 10 ? 1 : 0)}${suffix}`;
    };

    if (isLoading) {
        return (
            <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Lade Creatives aus deiner Library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Creative Library
                    </h2>
                    <p className="text-muted-foreground">Wähle Ads aus deiner Library für diese Kampagne.</p>
                </div>

                <div className="flex items-center gap-2">
                    {selectedCreativeIds.length > 0 && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                            {selectedCreativeIds.length} ausgewählt
                        </Badge>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Suche nach Namen, Produkt..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground text-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        {([
                            { id: 'all', label: 'Alle', icon: ImageIcon },
                            { id: 'top', label: 'Top Performer', icon: TrendingUp },
                            { id: 'recent', label: 'Neueste', icon: Filter },
                        ] as const).map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                                    filter === id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="w-3 h-3" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            Alle auswählen
                        </button>
                        {selectedCreativeIds.length > 0 && (
                            <button
                                onClick={handleDeselectAll}
                                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                Auswahl löschen
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Creative Grid */}
            {displayedCreatives.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedCreatives.map(creative => {
                        const isSelected = selectedCreativeIds.includes(creative.id);
                        return (
                            <div
                                key={creative.id}
                                onClick={() => handleToggle(creative.id)}
                                className={cn(
                                    "relative group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-card",
                                    isSelected
                                        ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "border-transparent hover:border-primary/50 hover:shadow-md"
                                )}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-square bg-muted relative overflow-hidden">
                                    {creative.thumbnail ? (
                                        <img
                                            src={creative.thumbnail}
                                            alt={creative.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                            <Sparkles className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Selection Indicator */}
                                    <div className={cn(
                                        "absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                        isSelected
                                            ? "bg-primary border-primary scale-110"
                                            : "bg-background/80 backdrop-blur-sm border-border group-hover:border-primary/50"
                                    )}>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>

                                    {/* Performance Badge */}
                                    {creative.metrics?.roas && creative.metrics.roas > 2 && (
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-white" />
                                            <span className="text-[10px] font-bold text-white">{creative.metrics.roas.toFixed(1)}x ROAS</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-foreground truncate">{creative.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{creative.productName}</p>
                                    </div>

                                    {/* Metrics Row */}
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span className="px-2 py-1 bg-muted/50 rounded-md font-mono">
                                            CTR: {formatMetric(creative.metrics?.ctr, '%')}
                                        </span>
                                        <span className="px-2 py-1 bg-muted/50 rounded-md font-mono">
                                            {formatMetric(creative.metrics?.impressions)} Impr.
                                        </span>
                                        {creative.metrics?.spend !== undefined && creative.metrics.spend > 0 && (
                                            <span className="px-2 py-1 bg-muted/50 rounded-md font-mono">
                                                €{creative.metrics.spend.toFixed(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-12 text-center border-2 border-dashed">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keine Creatives gefunden</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? 'Keine Ergebnisse für deine Suche.' : 'Erstelle zuerst Ads in der Creative Library.'}
                    </p>
                    <button
                        onClick={() => window.location.href = '/creative-library'}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Creative Library öffnen
                    </button>
                </Card>
            )}

            {/* Selection Summary */}
            {selectedCreativeIds.length > 0 && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{selectedCreativeIds.length} Creatives ausgewählt</p>
                                <p className="text-xs text-muted-foreground">Diese werden in deine Kampagne eingebunden</p>
                            </div>
                        </div>
                        <div className="flex -space-x-2">
                            {selectedCreativeIds.slice(0, 4).map(id => {
                                const creative = creatives.find(c => c.id === id);
                                return creative?.thumbnail ? (
                                    <img
                                        key={id}
                                        src={creative.thumbnail}
                                        alt=""
                                        className="w-10 h-10 rounded-full border-2 border-background object-cover"
                                    />
                                ) : (
                                    <div key={id} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                );
                            })}
                            {selectedCreativeIds.length > 4 && (
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">+{selectedCreativeIds.length - 4}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
