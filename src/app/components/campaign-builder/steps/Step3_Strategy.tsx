import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { ArrowRight, Sliders, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { Card } from '../../ui/card';
import { toast } from 'sonner';
import { Slider } from '../../ui/slider';
import { useState } from 'react';
import { Badge } from '../../ui/badge';

export const Step3_Strategy = () => {
    const { campaignSpec, handleNext } = useCampaignBuilder();

    // Local state for strategy tweaks (could be moved to context if needed globally)
    const [riskTolerance, setRiskTolerance] = useState('medium');
    const [scaleSpeed, setScaleSpeed] = useState('medium');
    const [targetRoas, setTargetRoas] = useState([2.5]);

    const applyStrategy = () => {
        // In a real app, this would construct a strategy object and apply it to the spec
        // For now we just mock the application
        toast.success("Strategy parameters applied to campaign structure.");
        handleNext();
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Strategy Configuration</h2>
                        <p className="text-muted-foreground">Define how the AI should optimize this campaign.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Risk Tolerance */}
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Risk Tolerance</h3>
                                    <p className="text-xs text-muted-foreground">How aggressively should we test new audiences?</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setRiskTolerance(level)}
                                        className={`
                                        py-3 px-4 rounded-xl border text-sm font-semibold capitalize transition-all
                                        ${riskTolerance === level
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'border-border bg-muted/20 hover:bg-muted/40'}
                                    `}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Scale Speed */}
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Scale Speed</h3>
                                    <p className="text-xs text-muted-foreground">How fast should budget increase on winners?</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['slow', 'medium', 'aggressive'].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setScaleSpeed(speed)}
                                        className={`
                                        py-3 px-4 rounded-xl border text-sm font-semibold capitalize transition-all
                                        ${scaleSpeed === speed
                                                ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                                : 'border-border bg-muted/20 hover:bg-muted/40'}
                                    `}
                                    >
                                        {speed}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Target ROAS */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Target ROAS</h3>
                                        <p className="text-xs text-muted-foreground">Minimum Return on Ad Spend</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-green-400">{targetRoas[0]}x</span>
                            </div>
                            <Slider
                                value={targetRoas}
                                onValueChange={setTargetRoas}
                                min={1.0}
                                max={10.0}
                                step={0.1}
                                className="w-full"
                            />
                        </Card>
                    </div>
                </div>

                {/* Right: Summary Preview */}
                <div className="lg:col-span-1">
                    <Card className="p-6 h-full bg-muted/10 border-dashed">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Sliders className="w-4 h-4" /> Strategy Summary
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Testing Budget</span>
                                <span className="font-mono">50%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Scaling Budget</span>
                                <span className="font-mono">50%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Bid Strategy</span>
                                <Badge variant="outline" className="font-mono text-[10px]">{campaignSpec.campaign.bid_strategy || 'Lowest Cost'}</Badge>
                            </div>

                            <div className="pt-4 space-y-2">
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">AI Behavior:</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {riskTolerance === 'high' ? 'Will aggressively test broad audiences.' : 'Will focus on proven interest stacks.'}
                                    {' '}
                                    {scaleSpeed === 'aggressive' ? 'Winners will be duplicated immediately.' : 'Budget will increase 20% every 3 days.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <Button size="lg" onClick={applyStrategy} className="gap-2 px-8">
                    Review Campaign <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
