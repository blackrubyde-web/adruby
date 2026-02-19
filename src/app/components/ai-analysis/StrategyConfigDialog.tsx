import { Brain, Rocket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';

interface StrategyConfig {
    risk_tolerance: string;
    scale_speed: string;
    target_roas: number;
    max_daily_budget_increase: number;
}

interface StrategyConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategyConfig: StrategyConfig;
    onConfigChange: (update: Partial<StrategyConfig>) => void;
    onSaveAndRun: () => void;
}

export function StrategyConfigDialog({
    open,
    onOpenChange,
    strategyConfig,
    onConfigChange,
    onSaveAndRun,
}: StrategyConfigDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-primary/20 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Brain className="w-5 h-5 text-primary" />
                        AI Strategy Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Fine-tune the "Pro Marketer" engine logic.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="flex items-center justify-between">
                            <span>Risk Tolerance</span>
                            <span className="text-xs text-muted-foreground uppercase">{strategyConfig.risk_tolerance}</span>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((risk) => (
                                <div
                                    key={risk}
                                    onClick={() => onConfigChange({ risk_tolerance: risk })}
                                    className={`cursor-pointer border rounded-lg p-3 text-center text-sm transition-all ${strategyConfig.risk_tolerance === risk
                                        ? 'bg-primary/20 border-primary text-primary font-bold'
                                        : 'bg-muted/20 border-transparent hover:bg-muted/40'
                                        }`}
                                >
                                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center justify-between">
                            <span>Scale Speed</span>
                            <span className="text-xs text-muted-foreground uppercase">{strategyConfig.scale_speed}</span>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['slow', 'medium', 'aggressive'].map((speed) => (
                                <div
                                    key={speed}
                                    onClick={() => onConfigChange({ scale_speed: speed })}
                                    className={`cursor-pointer border rounded-lg p-3 text-center text-sm transition-all ${strategyConfig.scale_speed === speed
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-500 font-bold'
                                        : 'bg-muted/20 border-transparent hover:bg-muted/40'
                                        }`}
                                >
                                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Target ROAS</Label>
                            <span className="font-mono text-sm">{strategyConfig.target_roas.toFixed(1)}x</span>
                        </div>
                        <Slider
                            min={1.0}
                            max={10.0}
                            step={0.1}
                            value={[strategyConfig.target_roas]}
                            onValueChange={([val]) => onConfigChange({ target_roas: val })}
                            className="py-2"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-r from-primary to-rose-600 text-white" onClick={onSaveAndRun}>
                        <Rocket className="w-4 h-4 mr-2" />
                        Save & Run Analysis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
