import { ReactNode, useEffect } from 'react';
import { Target, PenTool, Users, Zap, Rocket, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { PageShell } from '../layout';
import { useCampaignBuilder } from './CampaignBuilderContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const STEPS = [
    { id: 1, label: 'Setup', description: 'Name & Budget', icon: Target },
    { id: 2, label: 'Creatives', description: 'Ads auswählen', icon: PenTool },
    { id: 3, label: 'Targeting', description: 'Zielgruppe', icon: Users },
    { id: 4, label: 'Strategie', description: 'Optimierung', icon: Zap },
    { id: 5, label: 'Launch', description: 'Review & Push', icon: Rocket },
];

export const CampaignWizardShell = ({ children }: { children: ReactNode }) => {
    const {
        currentStep,
        totalSteps,
        handleBack,
        handleNext,
        canContinue,
        isLoading,
        error,
        campaignSetup,
        selectedCreativeIds
    } = useCampaignBuilder();

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && canContinue && currentStep < totalSteps) {
                e.preventDefault();
                handleNext();
            }
            if (e.key === 'Escape' && currentStep > 1) {
                handleBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canContinue, currentStep, totalSteps, handleNext, handleBack]);

    const progressPercent = (currentStep / totalSteps) * 100;

    return (
        <PageShell>
            <div className="relative min-h-screen pb-24">
                {/* ── Top Bar ──────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Kampagne erstellen</h1>
                            {campaignSetup.name && (
                                <Badge variant="outline" className="text-xs truncate max-w-[200px]">
                                    {campaignSetup.name}
                                </Badge>
                            )}
                            {selectedCreativeIds.length > 0 && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                    {selectedCreativeIds.length} Creatives
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <span className="font-bold text-foreground">{currentStep}</span>
                            <span> / {totalSteps}</span>
                        </div>
                    </div>

                    {/* ── Stepper ────────────────────────────────────── */}
                    <div className="relative mb-8">
                        {/* Progress Track */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 ease-out"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        />

                        <div className="relative flex justify-between">
                            {STEPS.map((step) => {
                                const isCompleted = currentStep > step.id;
                                const isActive = currentStep === step.id;
                                const isPending = currentStep < step.id;
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex flex-col items-center gap-2 transition-all duration-300",
                                            isPending && "opacity-40"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                                                isCompleted && "bg-primary border-primary text-primary-foreground",
                                                isActive && "bg-primary/10 border-primary text-primary shadow-sm shadow-primary/20",
                                                isPending && "bg-card border-border text-muted-foreground"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Icon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-xs font-semibold transition-colors",
                                                isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {step.label}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground/60 hidden sm:block">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Error ──────────────────────────────────────── */}
                {error && (
                    <div className="max-w-6xl mx-auto px-4 mb-4">
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm text-center">
                            {error}
                        </div>
                    </div>
                )}

                {/* ── Content ────────────────────────────────────── */}
                {isLoading ? (
                    <div className="max-w-6xl mx-auto px-4 text-center py-20">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                            <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground">Kampagne wird geladen…</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="animate-fade-in-up" key={currentStep}>
                            {children}
                        </div>
                    </div>
                )}

                {/* ── Fixed Bottom Navigation ────────────────────── */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40">
                    <div className="max-w-6xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            {/* Progress */}
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Schritt {currentStep} von {totalSteps}
                                </span>
                            </div>

                            {/* Keyboard hint */}
                            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">Enter</kbd>
                                <span>Weiter</span>
                                <span className="mx-1 opacity-30">·</span>
                                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">Esc</kbd>
                                <span>Zurück</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                                {currentStep > 1 && (
                                    <Button variant="outline" onClick={handleBack} size="sm" className="gap-1.5">
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Zurück</span>
                                    </Button>
                                )}
                                {currentStep < totalSteps ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canContinue}
                                        size="sm"
                                        className="gap-1.5"
                                    >
                                        <span className="hidden sm:inline">Weiter</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => { }}
                                    >
                                        <Rocket className="w-3.5 h-3.5" />
                                        <span>Veröffentlichen</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};
