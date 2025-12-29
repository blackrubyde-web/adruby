import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { validateForPlacements, getRecommendedDimensions, type ValidationResult } from '../../lib/format-validation';

interface FormatValidationPanelProps {
    creativeWidth: number;
    creativeHeight: number;
    headline?: string;
    primaryText?: string;
    description?: string;
    selectedPlacements: string[];
    onFixRecommendation?: (placement: string) => void;
}

export const FormatValidationPanel = ({
    creativeWidth,
    creativeHeight,
    headline = '',
    primaryText = '',
    description = '',
    selectedPlacements,
    onFixRecommendation
}: FormatValidationPanelProps) => {
    const validationResults = validateForPlacements(
        creativeWidth,
        creativeHeight,
        { headline, primaryText, description },
        selectedPlacements
    );

    const allValid = Object.values(validationResults).every(r => r.isValid);
    const hasWarnings = Object.values(validationResults).some(r => r.warnings.length > 0);

    const getPlacementIcon = (result: ValidationResult) => {
        if (!result.isValid) {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        } else if (result.warnings.length > 0) {
            return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        } else {
            return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        }
    };

    const getPlacementBadge = (result: ValidationResult) => {
        if (!result.isValid) {
            return 'bg-red-500/10 border-red-500/30 text-red-500';
        } else if (result.warnings.length > 0) {
            return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
        } else {
            return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-xl border ${allValid && !hasWarnings
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : !allValid
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                <div className="flex items-center gap-2">
                    {allValid && !hasWarnings ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <p className="font-bold text-sm text-emerald-600">Alle Placements validiert ✓</p>
                        </>
                    ) : !allValid ? (
                        <>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="font-bold text-sm text-red-600">Format-Fehler gefunden</p>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <p className="font-bold text-sm text-amber-600">Verbesserungen möglich</p>
                        </>
                    )}
                </div>
            </div>

            {/* Current Dimensions */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground">Aktuelles Format</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <p className="text-muted-foreground">Breite</p>
                        <p className="font-bold">{creativeWidth}px</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Höhe</p>
                        <p className="font-bold">{creativeHeight}px</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ratio</p>
                        <p className="font-bold">{(creativeWidth / creativeHeight).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Placement-specific validation */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground">Placement Validation</p>
                {selectedPlacements.map(placement => {
                    const result = validationResults[placement];
                    if (!result) return null;

                    const recommended = getRecommendedDimensions(placement as any);

                    return (
                        <div
                            key={placement}
                            className={`p-3 rounded-xl border ${getPlacementBadge(result)}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getPlacementIcon(result)}
                                    <p className="font-bold text-sm capitalize">{placement}</p>
                                </div>
                                {!result.isValid && onFixRecommendation && (
                                    <button
                                        onClick={() => onFixRecommendation(placement)}
                                        className="px-2 py-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Fix
                                    </button>
                                )}
                            </div>

                            {/* Errors */}
                            {result.errors.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {result.errors.map((error, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-red-600">{error}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Warnings */}
                            {result.warnings.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {result.warnings.map((warning, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-amber-600">{warning}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendation */}
                            {!result.isValid && (
                                <div className="mt-2 p-2 bg-card/50 rounded-lg">
                                    <p className="text-[10px] text-muted-foreground">
                                        Empfohlen: {recommended.width}×{recommended.height}px
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedPlacements.length === 0 && (
                <div className="p-8 text-center">
                    <Info className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Wähle Placements um Validierung zu starten</p>
                </div>
            )}
        </div>
    );
};
