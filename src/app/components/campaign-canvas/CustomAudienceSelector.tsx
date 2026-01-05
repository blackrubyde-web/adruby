import { useState, useEffect } from 'react';
import { Users, Upload, Copy, Target, Check, Loader2, Plus, X } from 'lucide-react';
import type { CustomAudience, LookalikeAudience } from './types';
import { getMetaAudiences } from '../../lib/api/meta';

interface CustomAudienceSelectorProps {
    selectedAudiences: CustomAudience[];
    selectedLookalikes: LookalikeAudience[];
    onAudiencesChange: (audiences: CustomAudience[]) => void;
    onLookalikesChange: (lookalikes: LookalikeAudience[]) => void;
}

export const CustomAudienceSelector = ({
    selectedAudiences,
    selectedLookalikes,
    onAudiencesChange,
    onLookalikesChange
}: CustomAudienceSelectorProps) => {
    const [availableAudiences, setAvailableAudiences] = useState<CustomAudience[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'custom' | 'lookalike'>('custom');

    // Fetch available audiences from backend
    useEffect(() => {
        const fetchAudiences = async () => {
            setIsLoading(true);
            try {
                // Now using authenticated apiClient via getMetaAudiences
                const data = await getMetaAudiences();

                if (data.success && data.audiences) {
                    setAvailableAudiences(data.audiences);
                } else {
                    // Fallback or empty if failed, but backend now enforces auth
                    // If backend returns mock data currently, it stays here.
                    // Ideally we remove mock data from frontend if backend provides it.
                    // The backend code I modified still returns mocked list for now (as per original code),
                    // but properly gated behind auth.
                    setAvailableAudiences([]);
                }
            } catch (error) {
                console.error('Failed to fetch audiences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudiences();
    }, []);

    const toggleAudience = (audience: CustomAudience) => {
        const isSelected = selectedAudiences.some(a => a.id === audience.id);
        if (isSelected) {
            onAudiencesChange(selectedAudiences.filter(a => a.id !== audience.id));
        } else {
            onAudiencesChange([...selectedAudiences, audience]);
        }
    };

    const createLookalike = (sourceAudience: CustomAudience, ratio: number = 1) => {
        const lookalike: LookalikeAudience = {
            id: `la_${sourceAudience.id}_${ratio}`,
            name: `${sourceAudience.name} - ${ratio}% LAL`,
            sourceAudienceId: sourceAudience.id,
            sourceAudienceName: sourceAudience.name,
            country: 'DE',
            ratio,
            size: (sourceAudience.size || 0) * ratio * 100,
            status: 'calculating'
        };

        onLookalikesChange([...selectedLookalikes, lookalike]);
    };

    const removeLookalike = (id: string) => {
        onLookalikesChange(selectedLookalikes.filter(l => l.id !== id));
    };

    const getAudienceIcon = (type: CustomAudience['type']) => {
        switch (type) {
            case 'website': return <Target className="w-4 h-4" />;
            case 'customer_list': return <Upload className="w-4 h-4" />;
            case 'engagement': return <Users className="w-4 h-4" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Custom Audiences</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'custom'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        Custom
                    </button>
                    <button
                        onClick={() => setActiveTab('lookalike')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'lookalike'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        Lookalike
                    </button>
                </div>
            </div>

            {/* Custom Audiences Tab */}
            {activeTab === 'custom' && (
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : availableAudiences.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Keine Audiences verfügbar</p>
                            <p className="text-xs text-muted-foreground mt-1">Verbinde dein Meta Business Account</p>
                        </div>
                    ) : (
                        availableAudiences.map(audience => {
                            const isSelected = selectedAudiences.some(a => a.id === audience.id);
                            return (
                                <button
                                    key={audience.id}
                                    onClick={() => toggleAudience(audience)}
                                    className={`w-full p-3 rounded-xl border transition-all text-left ${isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-card border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'
                                                }`}>
                                                {getAudienceIcon(audience.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{audience.name}</p>
                                                <p className="text-xs text-muted-foreground">{audience.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {audience.size?.toLocaleString()} Personen
                                                    </span>
                                                    {audience.status === 'ready' && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded">
                                                            Ready
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {/* Lookalike Audiences Tab */}
            {activeTab === 'lookalike' && (
                <div className="space-y-3">
                    {/* Created Lookalikes */}
                    {selectedLookalikes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground">Erstellt ({selectedLookalikes.length})</p>
                            {selectedLookalikes.map(lookalike => (
                                <div key={lookalike.id} className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{lookalike.name}</p>
                                            <p className="text-xs text-muted-foreground">Quelle: {lookalike.sourceAudienceName}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                ~{lookalike.size?.toLocaleString()} Personen • {lookalike.country}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeLookalike(lookalike.id)}
                                            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create New Lookalike */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground">Neue Lookalike erstellen</p>
                        {selectedAudiences.length === 0 ? (
                            <div className="p-4 bg-muted/50 rounded-xl text-center">
                                <Copy className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">Wähle zuerst eine Custom Audience</p>
                            </div>
                        ) : (
                            selectedAudiences.map(audience => (
                                <div key={audience.id} className="p-3 bg-card border border-border rounded-xl">
                                    <p className="text-sm font-bold mb-2">{audience.name}</p>
                                    <div className="flex gap-2">
                                        {[1, 3, 5, 10].map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => createLookalike(audience, ratio)}
                                                disabled={selectedLookalikes.some(l => l.sourceAudienceId === audience.id && l.ratio === ratio)}
                                                className="flex-1 px-2 py-1.5 text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-3 h-3 inline mr-1" />
                                                {ratio}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Summary */}
            {(selectedAudiences.length > 0 || selectedLookalikes.length > 0) && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-xs font-bold text-primary">
                        {selectedAudiences.length} Custom + {selectedLookalikes.length} Lookalike Audiences ausgewählt
                    </p>
                </div>
            )}
        </div>
    );
};
