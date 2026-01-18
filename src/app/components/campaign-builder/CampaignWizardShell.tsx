import { ReactNode } from 'react';
import { Target, PenTool, Users, Zap, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageShell, HeroHeader } from '../layout';
import { useCampaignBuilder } from './CampaignBuilderContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const STEPS = [
    { id: 1, label: 'Setup', description: 'Name & Budget', icon: Target },
    { id: 2, label: 'Creatives', description: 'Ads auswählen', icon: PenTool },
    { id: 3, label: 'Targeting', description: 'Zielgruppe', icon: Users },
    { id: 4, label: 'Strategy', description: 'Optimierung', icon: Zap },
    { id: 5, label: 'Launch', description: 'Review & Push', icon: Rocket },
];

export const CampaignWizardShell = ({ children }: { children: ReactNode }) => {
    const { currentStep, totalSteps, handleBack, handleNext, canContinue, isLoading, error, campaignSetup } = useCampaignBuilder();

    return (
        <PageShell>
            <div className="relative min-h-screen pb-20">
                {/* Background Gradients */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[100px] mix-blend-screen" />
                </div>

                <HeroHeader
                    title="Campaign Builder"
                    subtitle="Build high-performance Meta campaigns with AI assistance."
                    chips={
                        campaignSetup.name && (
                            <Badge variant="outline" className="text-xs">
                                {campaignSetup.name}
                            </Badge>
                        )
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            {currentStep > 1 && (
                                <Button variant="ghost" onClick={handleBack} className="gap-2">
                                    <ChevronLeft className="w-4 h-4" /> Zurück
                                </Button>
                            )}
                            {currentStep < totalSteps && (
                                <Button onClick={handleNext} disabled={!canContinue} className="gap-2">
                                    Weiter <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Premium Stepper UI */}
                <div className="mb-8 max-w-6xl mx-auto px-4 mt-8">
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-6 w-full h-0.5 bg-muted rounded-full -z-10" />

                        {/* Active Progress Bar */}
                        <div
                            className="absolute left-0 top-6 h-0.5 bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 transition-all duration-500 ease-out -z-10 rounded-full"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        />

                        <div className="flex justify-between w-full">
                            {STEPS.map((step) => {
                                const isCompleted = currentStep > step.id;
                                const isActive = currentStep === step.id;
                                const isPending = currentStep < step.id;
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className="flex flex-col items-center gap-2 relative z-10"
                                    >
                                        {/* Step Circle */}
                                        <div
                                            className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border-2
                                                ${isCompleted
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 text-white shadow-lg shadow-green-500/30'
                                                    : isActive
                                                        ? 'bg-gradient-to-br from-primary to-violet-600 border-primary text-white shadow-lg shadow-primary/40 scale-110'
                                                        : 'bg-card border-border text-muted-foreground'
                                                }
                                            `}
                                        >
                                            {isCompleted ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>

                                        {/* Step Label */}
                                        <div className="text-center">
                                            <div className={`text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-foreground' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                                                }`}>
                                                {step.label}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 hidden sm:block ${isActive || isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
                                                }`}>
                                                {step.description}
                                            </div>
                                        </div>

                                        {/* Step Number Badge */}
                                        {isPending && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                                                <span className="text-[8px] font-bold text-muted-foreground">{step.id}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="max-w-6xl mx-auto px-4 mb-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
                            {error}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="max-w-6xl mx-auto px-4 text-center py-20">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium animate-pulse">Lade Campaign Engine...</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto px-4 animate-fade-in-up">
                        {children}
                    </div>
                )}

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 py-4 z-40">
                    <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Schritt <span className="font-bold text-foreground">{currentStep}</span> von <span className="font-bold text-foreground">{totalSteps}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {currentStep > 1 && (
                                <Button variant="outline" onClick={handleBack} size="sm">
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
                                </Button>
                            )}
                            {currentStep < totalSteps && (
                                <Button onClick={handleNext} disabled={!canContinue} size="sm" className="gap-2">
                                    Weiter <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};
