import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../layout';
import { RiskToleranceSlider } from './RiskToleranceSlider';
import { ArrowRight, ArrowLeft, Target, Briefcase, Zap, Check } from 'lucide-react';

interface StrategyWizardProps {
    onComplete: (strategy: any) => void;
    onCancel: () => void;
}

const STEPS = [
    { id: 1, title: 'Identity', icon: Briefcase },
    { id: 2, title: 'Autopilot', icon: Target },
    { id: 3, title: 'Review', icon: Check },
];

export function StrategyWizard({ onComplete, onCancel }: StrategyWizardProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        name: '',
        industry_type: 'ecommerce',
        target_roas: 3.0,
        risk_tolerance: 'medium' as 'low' | 'medium' | 'high',
        scale_speed: 'medium' as 'slow' | 'medium' | 'fast' | 'aggressive',
        max_daily_budget: 100
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete(data);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0A0A0A] relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Create Master Strategy
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Define your creative voice and autopilot rules in one go.
                            </p>
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                            Step {step} of 3
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((s) => (
                            <div key={s.id} className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${s.id <= step ? 'bg-gradient-to-r from-primary to-purple-400 shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'bg-transparent'}`}
                                    style={{ width: s.id < step ? '100%' : s.id === step ? '100%' : '0%' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label>Internal Strategy Name</Label>
                                <Input
                                    placeholder="e.g. Q4 Aggressive Scaling"
                                    value={data.name}
                                    onChange={e => setData({ ...data, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Primary Industry</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'ecommerce', label: 'E-Commerce' },
                                        { id: 'saas', label: 'SaaS / App' },
                                        { id: 'local', label: 'Local Business' },
                                        { id: 'info', label: 'Info / Course' }
                                    ].map(ind => (
                                        <div
                                            key={ind.id}
                                            onClick={() => setData({ ...data, industry_type: ind.id })}
                                            className={`
                        p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group
                        ${data.industry_type === ind.id
                                                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                                                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                                                }
                      `}
                                        >
                                            <span className={`font-medium transition-colors ${data.industry_type === ind.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{ind.label}</span>
                                            {data.industry_type === ind.id && <Check className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <RiskToleranceSlider
                                value={data.risk_tolerance}
                                scaleSpeed={data.scale_speed}
                                onChange={(val) => {
                                    // Auto-map risk to speed for simplicity in wizard
                                    const speedMap = { low: 'slow', medium: 'medium', high: 'aggressive' };
                                    setData({
                                        ...data,
                                        risk_tolerance: val,
                                        scale_speed: speedMap[val] as any
                                    });
                                }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Target ROAS</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={data.target_roas}
                                            onChange={e => setData({ ...data, target_roas: parseFloat(e.target.value) })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                                            x
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Max Daily Budget</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                                            €
                                        </div>
                                        <Input
                                            type="number"
                                            className="pl-7"
                                            value={data.max_daily_budget}
                                            onChange={e => setData({ ...data, max_daily_budget: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-primary" />
                            </div>

                            <h3 className="text-lg font-bold">Ready to Launch</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your Master Strategy <strong>"{data.name}"</strong> is configured for <strong>{data.industry_type}</strong> with a <strong>{data.risk_tolerance}</strong> risk profile.
                            </p>

                            <div className="bg-muted p-4 rounded-xl border border-border inline-block text-left w-full max-w-sm">
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-muted-foreground">Target ROAS</span>
                                    <span className="font-mono font-medium">{data.target_roas}x</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span className="text-muted-foreground">Budget Cap</span>
                                    <span className="font-mono font-medium">€{data.max_daily_budget}/day</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-t border-border mt-2 pt-2">
                                    <span className="text-muted-foreground">Autopilot</span>
                                    <span className="text-green-500 font-bold flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Enabled
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30 flex justify-between">
                    <Button variant="ghost" onClick={handleBack}>
                        {step === 1 ? 'Cancel' : (
                            <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</span>
                        )}
                    </Button>
                    <Button onClick={handleNext} disabled={!data.name}>
                        {step === 3 ? 'Create Strategy' : (
                            <span className="flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></span>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
