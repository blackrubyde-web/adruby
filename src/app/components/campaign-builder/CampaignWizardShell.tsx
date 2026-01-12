import { ReactNode } from 'react';
import { Target, PenTool, Coins, Rocket, CheckCircle2, ChevronLeft } from 'lucide-react';
import { PageShell, HeroHeader } from '../layout';
import { useCampaignBuilder } from './CampaignBuilderContext';
import { Button } from '../ui/button';

export const CampaignWizardShell = ({ children }: { children: ReactNode }) => {
    const { currentStep, handleBack, isLoading, error } = useCampaignBuilder();

    const STEPS = [
        { id: 1, label: 'Objective & Budget', icon: Target },
        { id: 2, label: 'Creative Selection', icon: PenTool },
        { id: 3, label: 'Strategy & Targeting', icon: Coins },
        { id: 4, label: 'Review & Launch', icon: Rocket },
    ];

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
                    subtitle="Design high-performance campaigns with AI assistance."
                    actions={
                        currentStep > 1 && (
                            <Button variant="ghost" onClick={handleBack} className="gap-2">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </Button>
                        )
                    }
                />

                {/* Stepper UI */}
                <div className="mb-8 max-w-5xl mx-auto px-4 mt-8">
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full -z-10" />

                        {/* Active Progress Bar */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary/70 transition-all duration-500 ease-out -z-10 rounded-full"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />

                        <div className="flex justify-between w-full">
                            {STEPS.map((step) => {
                                const isActive = currentStep >= step.id;
                                const isCurrent = currentStep === step.id;
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 bg-background/50 p-2 rounded-xl backdrop-blur-sm">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${isActive
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-100'
                                                    : 'bg-card border-border text-muted-foreground'
                                                }`}
                                        >
                                            {isActive && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest text-center transition-colors duration-300 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="max-w-5xl mx-auto px-4 mb-4 text-center p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="max-w-5xl mx-auto px-4 text-center py-20">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium animate-pulse">Loading Campaign Engine...</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto px-4 animate-fade-in-up">
                        {children}
                    </div>
                )}
            </div>
        </PageShell>
    );
};
