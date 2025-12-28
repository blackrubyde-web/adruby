import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, Sparkles, Check, X, Loader2, ChevronRight, Zap } from 'lucide-react';
import type { AdDocument } from '../../types/studio';

interface Suggestion {
    id: string;
    type: 'warning' | 'improvement' | 'tip';
    category: 'headline' | 'cta' | 'layout' | 'colors' | 'image' | 'copy';
    title: string;
    description: string;
    priority: number;
    autoFixAvailable: boolean;
    autoFixAction?: Record<string, unknown>;
}

interface AISuggestionsPanelProps {
    document: AdDocument | null;
    isVisible: boolean;
    onApplySuggestion?: (suggestion: Suggestion) => void;
    onClose: () => void;
}

export const AISuggestionsPanel = ({ document, isVisible, onApplySuggestion, onClose }: AISuggestionsPanelProps) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isVisible && document) {
            fetchSuggestions();
        }
    }, [isVisible, document]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchSuggestions = async () => {
        if (!document) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/ai-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adDocument: document })
            });

            const data = await response.json();
            if (data.success && data.suggestions) {
                setSuggestions(data.suggestions.sort((a: Suggestion, b: Suggestion) => b.priority - a.priority));
            } else {
                // Fallback suggestions
                setSuggestions([
                    {
                        id: '1',
                        type: 'improvement',
                        category: 'headline',
                        title: 'Headline kürzer machen',
                        description: 'Kürzere Headlines performen besser auf Mobile. Versuche max. 5 Wörter.',
                        priority: 4,
                        autoFixAvailable: false
                    },
                    {
                        id: '2',
                        type: 'tip',
                        category: 'cta',
                        title: 'CTA Button größer',
                        description: 'Ein größerer CTA-Button erhöht die Klickrate um bis zu 30%.',
                        priority: 3,
                        autoFixAvailable: true
                    },
                    {
                        id: '3',
                        type: 'warning',
                        category: 'colors',
                        title: 'Kontrast prüfen',
                        description: 'Der Text könnte auf dem Hintergrund schwer lesbar sein.',
                        priority: 5,
                        autoFixAvailable: false
                    }
                ]);
            }
        } catch (error) {
            console.error('Suggestions fetch error:', error);
            // Use fallback
            setSuggestions([
                {
                    id: '1',
                    type: 'tip',
                    category: 'layout',
                    title: 'Mobile-First denken',
                    description: '85% der Nutzer sehen deine Ad auf dem Smartphone.',
                    priority: 4,
                    autoFixAvailable: false
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = (suggestion: Suggestion) => {
        setAppliedIds(prev => new Set([...prev, suggestion.id]));
        onApplySuggestion?.(suggestion);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'improvement': return <Sparkles className="w-4 h-4 text-violet-500" />;
            case 'tip': return <Lightbulb className="w-4 h-4 text-blue-500" />;
            default: return <Sparkles className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-500/10 border-amber-500/30';
            case 'improvement': return 'bg-violet-500/10 border-violet-500/30';
            case 'tip': return 'bg-blue-500/10 border-blue-500/30';
            default: return 'bg-muted';
        }
    };

    if (!isVisible) return null;

    return (
        <div className="absolute right-4 top-20 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-40 animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-violet-500" />
                        <h3 className="font-bold">AI Vorschläge</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Optimierungsvorschläge für deine Ad</p>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-500" />
                        <p className="text-sm text-muted-foreground mt-3">Analysiere deine Ad...</p>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="p-8 text-center">
                        <Check className="w-10 h-10 mx-auto text-green-500 mb-3" />
                        <p className="font-bold text-green-600">Alles perfekt!</p>
                        <p className="text-sm text-muted-foreground mt-1">Keine Verbesserungen gefunden.</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {suggestions.map(suggestion => (
                            <div
                                key={suggestion.id}
                                className={`p-3 rounded-xl border transition-all ${appliedIds.has(suggestion.id)
                                        ? 'bg-green-500/10 border-green-500/30 opacity-60'
                                        : getTypeColor(suggestion.type)
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {appliedIds.has(suggestion.id)
                                            ? <Check className="w-4 h-4 text-green-500" />
                                            : getIcon(suggestion.type)
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold">{suggestion.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>

                                        {suggestion.autoFixAvailable && !appliedIds.has(suggestion.id) && (
                                            <button
                                                onClick={() => handleApply(suggestion)}
                                                className="mt-2 flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-600 transition-colors"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                Auto-Fix anwenden
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${suggestion.priority >= 4 ? 'bg-red-500/20 text-red-500' :
                                            suggestion.priority >= 2 ? 'bg-amber-500/20 text-amber-600' :
                                                'bg-muted text-muted-foreground'
                                        }`}>
                                        P{suggestion.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/30">
                <button
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Sparkles className="w-3 h-3" />
                    {isLoading ? 'Analysiere...' : 'Neu analysieren'}
                </button>
            </div>
        </div>
    );
};
