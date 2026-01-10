import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../layout';
import { RiskToleranceSlider } from './RiskToleranceSlider';
import { StrategySimulationPreview } from './StrategySimulationPreview';
import { ArrowRight, ArrowLeft, Target, Briefcase, Zap, Check, Sparkles, Globe, BarChart3, Loader2, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface StrategyWizardProps {
    onComplete: (strategy: Record<string, unknown>) => void;
    onCancel: () => void;
    initialData?: {
        name: string;
        industry_type: string;
        target_roas: number;
        risk_tolerance: 'low' | 'medium' | 'high';
        scale_speed: 'slow' | 'medium' | 'fast' | 'aggressive';
        max_daily_budget: number;
    } | null;
}

export function StrategyWizard({ onComplete, onCancel, initialData }: StrategyWizardProps) {
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form Data
    const [data, setData] = useState({
        // Identity
        name: '',
        website_url: '',
        industry_type: 'ecommerce',
        primary_goal: 'sales', // sales, leads, awareness

        // Strategy Config (AI will fill these)
        target_roas: 3.0,
        risk_tolerance: 'medium' as 'low' | 'medium' | 'high',
        scale_speed: 'medium' as 'slow' | 'medium' | 'fast' | 'aggressive',
        max_daily_budget: 100
    });

    useEffect(() => {
        if (initialData) {
            setData(prev => ({ ...prev, ...initialData }));
            // If editing, skip briefing? Or maybe show it filled. Let's start at step 2 if editing.
            setStep(2);
        }
    }, [initialData]);

    const handleBriefingSubmit = () => {
        if (!data.name) {
            toast.error("Please name your strategy");
            return;
        }

        setIsAnalyzing(true);

        // Mock AI Analysis
        setTimeout(() => {
            // Intelligent Defaults based on Industry
            let newRoas = 3.0;
            let newRisk: 'low' | 'medium' | 'high' = 'medium';
            let newSpeed: 'slow' | 'medium' | 'fast' | 'aggressive' = 'medium';

            if (data.industry_type === 'ecommerce') {
                newRoas = 3.5; newRisk = 'medium'; newSpeed = 'fast';
            } else if (data.industry_type === 'saas') {
                newRoas = 2.0; newRisk = 'high'; newSpeed = 'aggressive'; // Growth focus
            } else if (data.industry_type === 'local') {
                newRoas = 4.0; newRisk = 'low'; newSpeed = 'slow';
            }

            setData(prev => ({
                ...prev,
                target_roas: newRoas,
                risk_tolerance: newRisk,
                scale_speed: newSpeed
            }));

            setIsAnalyzing(false);
            setStep(2);
        }, 2000);
    };

    const handleNext = () => {
        if (step === 1) {
            handleBriefingSubmit();
        } else if (step === 2) {
            setStep(3);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-4xl h-[600px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-[#050505] relative flex flex-col">
                {/* Ambient Background */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            {step === 1 && <Briefcase className="w-5 h-5 text-indigo-400" />}
                            {step === 2 && <Sparkles className="w-5 h-5 text-purple-400" />}
                            {step === 3 && <Zap className="w-5 h-5 text-amber-400" />}

                            {initialData ? 'Refine Strategy' : 'AI Strategy Designer'}
                        </h2>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span className={step >= 1 ? "text-indigo-400 font-medium" : ""}>1. Briefing</span>
                            <span className="text-white/10">/</span>
                            <span className={step >= 2 ? "text-purple-400 font-medium" : ""}>2. Proposal</span>
                            <span className="text-white/10">/</span>
                            <span className={step >= 3 ? "text-amber-400 font-medium" : ""}>3. Launch</span>
                        </div>
                    </div>
                    {isAnalyzing && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-300 text-xs font-medium animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Analyzing Market Data...
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative z-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                    {/* STEP 1: BRIEFING */}
                    {step === 1 && !isAnalyzing && (
                        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-2">Let's build your growth engine.</h3>
                                <p className="text-muted-foreground">Tell us about your business, and our AI will architect the perfect scaling strategy.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-base">Strategy Name</Label>
                                    <Input
                                        placeholder="e.g. Q1 Growth, Black Friday Blitz"
                                        className="h-12 bg-white/5 border-white/10 focus:border-indigo-500/50 text-lg"
                                        value={data.name}
                                        onChange={e => setData({ ...data, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base">Target Industry</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'ecommerce', icon: Globe, label: 'E-Commerce' },
                                            { id: 'saas', icon: Loader2, label: 'SaaS / App' },
                                            { id: 'local', icon: Briefcase, label: 'Local Biz' },
                                            { id: 'info', icon: Brain, label: 'Course / Info' }
                                        ].map(ind => (
                                            <button
                                                key={ind.id}
                                                onClick={() => setData({ ...data, industry_type: ind.id })}
                                                className={`
                                                    p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 group
                                                    ${data.industry_type === ind.id
                                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                                        : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    p-2 rounded-lg 
                                                    ${data.industry_type === ind.id ? 'bg-indigo-500 text-white' : 'bg-white/10 group-hover:bg-white/20'}
                                                `}>
                                                    {/* Simplistic Icon selection */}
                                                    {ind.id === 'ecommerce' && <Globe className="w-4 h-4" />}
                                                    {ind.id === 'saas' && <Briefcase className="w-4 h-4" />}
                                                    {ind.id === 'local' && <Target className="w-4 h-4" />}
                                                    {ind.id === 'info' && <BarChart3 className="w-4 h-4" />}
                                                </div>
                                                <span className="font-medium">{ind.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOADING STATE */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                                <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin reverse duration-1000" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-white/50 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
                                Architecting Strategy...
                            </h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">
                                Analyzing {data.industry_type} benchmarks and calculating optimal risk/reward ratios.
                            </p>
                        </div>
                    )}


                    {/* STEP 2: AI PROPOSAL */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in slide-in-from-bottom-8 duration-500 fade-in">
                            {/* Left: Controls */}
                            <div className="lg:col-span-7 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-purple-400" />
                                        Suggested Configuration
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Based on your briefing, we've calibrated these settings for optimal growth. Adjust if needed.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <RiskToleranceSlider
                                        value={data.risk_tolerance}
                                        scaleSpeed={data.scale_speed}
                                        onChange={(val) => {
                                            const speedMap: Record<string, 'slow' | 'medium' | 'fast' | 'aggressive'> = {
                                                low: 'slow',
                                                medium: 'medium',
                                                high: 'aggressive'
                                            };
                                            setData({
                                                ...data,
                                                risk_tolerance: val,
                                                scale_speed: speedMap[val] // Keep sync for simplicity
                                            });
                                        }}
                                    />

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                            <Label className="text-muted-foreground">Target ROAS</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={isNaN(data.target_roas) ? '' : data.target_roas}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value);
                                                        setData({ ...data, target_roas: isNaN(val) ? 0 : val });
                                                    }}
                                                    step="0.1"
                                                    className="text-2xl font-bold h-12 bg-transparent border-none focus-visible:ring-0 px-0 w-24"
                                                />
                                                <span className="text-xl font-bold text-muted-foreground">x</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {data.target_roas > 4 ? "Very Conservative" : data.target_roas < 2 ? "Aggressive Growth" : "Balanced"}
                                            </p>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                            <Label className="text-muted-foreground">Daily Budget Cap</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-muted-foreground">€</span>
                                                <Input
                                                    type="number"
                                                    value={isNaN(data.max_daily_budget) ? '' : data.max_daily_budget}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value);
                                                        setData({ ...data, max_daily_budget: isNaN(val) ? 0 : val });
                                                    }}
                                                    className="text-2xl font-bold h-12 bg-transparent border-none focus-visible:ring-0 px-0 w-full"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Hard reset at midnight</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Simulation */}
                            <div className="lg:col-span-5 h-full min-h-[300px] flex flex-col">
                                <Label className="mb-4">Projected Performance (30 Days)</Label>
                                <StrategySimulationPreview
                                    targetRoas={data.target_roas}
                                    riskTolerance={data.risk_tolerance}
                                    scaleSpeed={data.scale_speed}
                                />
                                <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
                                    <h4 className="font-bold flex items-center gap-2 mb-1">
                                        <Brain className="w-4 h-4" /> AI Insight
                                    </h4>
                                    <p className="leading-relaxed opacity-90">
                                        {data.risk_tolerance === 'high'
                                            ? "This strategy prioritizes rapid scaling. Expect volatility in the first 7 days as the algorithm finds winners."
                                            : data.risk_tolerance === 'low'
                                                ? "A safe, steady approach. Good for preserving capital but may scale slowly."
                                                : "Balanced approach recommended for most stable growth phases."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500 fade-in">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-500/10">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>

                            <h3 className="text-3xl font-bold mb-2">Ready to Launch</h3>
                            <p className="text-muted-foreground max-w-md mb-8">
                                Strategy <strong>"{data.name}"</strong> is ready to control your campaigns.
                            </p>

                            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ROAS</div>
                                    <div className="text-xl font-bold">{data.target_roas}x</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">RiskModel</div>
                                    <div className="text-xl font-bold capitalize">{data.risk_tolerance}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Budget</div>
                                    <div className="text-xl font-bold">€{data.max_daily_budget}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center z-10 backdrop-blur-md">
                    <Button variant="ghost" onClick={handleBack} disabled={isAnalyzing} className="text-muted-foreground hover:text-white">
                        {step === 1 ? 'Cancel' : (
                            <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</span>
                        )}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!data.name || isAnalyzing}
                        className={`
                            px-8 py-6 rounded-xl font-bold text-md transition-all
                            ${step === 3
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                                : 'bg-white text-black hover:bg-gray-200'
                            }
                        `}
                    >
                        {step === 1 ? 'Analyze & Design' : step === 3 ? 'Activate Strategy' : 'Continue'}
                        {step !== 3 && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// Brain icon is imported from lucide-react above.
