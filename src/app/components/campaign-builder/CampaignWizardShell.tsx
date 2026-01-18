import { ReactNode, useEffect } from 'react';
import { Target, PenTool, Users, Zap, Rocket, ChevronLeft, ChevronRight, Sparkles, Brain } from 'lucide-react';
import { PageShell, HeroHeader } from '../layout';
import { useCampaignBuilder } from './CampaignBuilderContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const STEPS = [
    { id: 1, label: 'Setup', description: 'Name & Budget', icon: Target, color: 'from-rose-500 to-pink-600' },
    { id: 2, label: 'Creatives', description: 'Ads auswählen', icon: PenTool, color: 'from-violet-500 to-purple-600' },
    { id: 3, label: 'Targeting', description: 'Zielgruppe', icon: Users, color: 'from-blue-500 to-cyan-600' },
    { id: 4, label: 'Strategy', description: 'Optimierung', icon: Zap, color: 'from-amber-500 to-orange-600' },
    { id: 5, label: 'Launch', description: 'Review & Push', icon: Rocket, color: 'from-green-500 to-emerald-600' },
];

// AI Tips per step
const AI_TIPS: Record<number, string> = {
    1: '💡 Tipp: Kampagnen mit klaren Namen performen 23% besser im Reporting.',
    2: '💡 Tipp: 3-5 verschiedene Creatives pro Ad Set erhöhen die Chance auf einen Winner.',
    3: '💡 Tipp: Advantage+ kann deine Reichweite um bis zu 40% erhöhen.',
    4: '💡 Tipp: Ein 50/50 Split zwischen Testing und Scaling ist für neue Kampagnen optimal.',
    5: '💡 Alles bereit! Überprüfe deine Einstellungen und push zu Meta.',
};

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

    // Progress indicator
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <PageShell>
            <div className="relative min-h-screen pb-24">
                {/* Premium Background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-[100px]" />
                </div>

                {/* Header */}
                <HeroHeader
                    title="Campaign Builder"
                    subtitle="Build high-performance Meta campaigns with AI assistance."
                    chips={
                        <div className="flex items-center gap-2">
                            {campaignSetup.name && (
                                <Badge variant="outline" className="text-xs animate-fade-in">
                                    {campaignSetup.name}
                                </Badge>
                            )}
                            {selectedCreativeIds.length > 0 && (
                                <Badge variant="secondary" className="text-xs animate-fade-in">
                                    {selectedCreativeIds.length} Creatives
                                </Badge>
                            )}
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            {currentStep > 1 && (
                                <Button variant="ghost" onClick={handleBack} className="gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Zurück
                                </Button>
                            )}
                            {currentStep < totalSteps && (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canContinue}
                                    className="gap-2 bg-gradient-to-r from-primary to-rose-600 hover:opacity-90"
                                >
                                    Weiter <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Premium Stepper */}
                <div className="max-w-6xl mx-auto px-4 mt-8 mb-8">
                    {/* Progress Bar Container */}
                    <div className="relative bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-lg">
                        {/* Progress Track */}
                        <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-muted/50 rounded-full -translate-y-1/2 -z-10" />
                        <div
                            className="absolute top-1/2 left-[10%] h-1 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 rounded-full -translate-y-1/2 -z-10 transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent * 0.8}%` }}
                        />

                        {/* Steps */}
                        <div className="flex justify-between items-start">
                            {STEPS.map((step, index) => {
                                const isCompleted = currentStep > step.id;
                                const isActive = currentStep === step.id;
                                const isPending = currentStep < step.id;
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            "flex flex-col items-center gap-3 transition-all duration-500",
                                            isActive && "scale-110",
                                            isPending && "opacity-50"
                                        )}
                                    >
                                        {/* Step Circle */}
                                        <div
                                            className={cn(
                                                "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                                                isCompleted && "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
                                                isActive && `bg-gradient-to-br ${step.color} text-white shadow-xl`,
                                                isPending && "bg-card border-2 border-border text-muted-foreground"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}

                                            {/* Active Pulse */}
                                            {isActive && (
                                                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-sm font-bold transition-colors",
                                                isActive ? "text-foreground" : isCompleted ? "text-green-500" : "text-muted-foreground"
                                            )}>
                                                {step.label}
                                            </div>
                                            <div className={cn(
                                                "text-[10px] mt-0.5 hidden sm:block transition-colors",
                                                isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                                            )}>
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Tip */}
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {AI_TIPS[currentStep]}
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-6xl mx-auto px-4 mb-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center animate-shake">
                            {error}
                        </div>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="max-w-6xl mx-auto px-4 text-center py-20">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <p className="text-muted-foreground font-medium">Lade Campaign Engine...</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="animate-fade-in-up" key={currentStep}>
                            {children}
                        </div>
                    </div>
                )}

                {/* Fixed Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left: Progress Info */}
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Schritt </span>
                                    <span className="font-bold text-foreground">{currentStep}</span>
                                    <span className="text-muted-foreground"> von </span>
                                    <span className="font-bold text-foreground">{totalSteps}</span>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="hidden sm:block w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Center: Keyboard Hint */}
                            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                                <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">Enter</kbd>
                                <span>Weiter</span>
                                <span className="mx-2">•</span>
                                <kbd className="px-2 py-1 bg-muted rounded border border-border font-mono">Esc</kbd>
                                <span>Zurück</span>
                            </div>

                            {/* Right: Navigation Buttons */}
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <Button variant="outline" onClick={handleBack} size="sm" className="gap-1">
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Zurück</span>
                                    </Button>
                                )}
                                {currentStep < totalSteps ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canContinue}
                                        size="sm"
                                        className="gap-1 bg-gradient-to-r from-primary to-rose-600 hover:opacity-90 shadow-lg shadow-primary/30"
                                    >
                                        <span className="hidden sm:inline">Weiter</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 shadow-lg shadow-green-500/30"
                                        onClick={() => { }} // Scroll to launch section
                                    >
                                        <Rocket className="w-4 h-4" />
                                        <span className="hidden sm:inline">Launch</span>
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
