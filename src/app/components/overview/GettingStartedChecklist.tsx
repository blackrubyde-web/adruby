import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, PartyPopper } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface ChecklistStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    actionLabel: string;
    onAction: () => void;
}

interface GettingStartedChecklistProps {
    steps: ChecklistStep[];
}

export function GettingStartedChecklist({ steps }: GettingStartedChecklistProps) {
    const completedSteps = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    const allDone = completedSteps === totalSteps;
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Hide entirely if all steps done
    if (allDone) {
        return (
            <Card variant="glass" className="group">
                <CardContent className="p-5 flex items-center gap-3">
                    <PartyPopper className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">Alle Schritte abgeschlossen!</span>
                        <span className="text-xs text-muted-foreground ml-2">Du bist startklar</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{completedSteps}/{totalSteps}</Badge>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="group">
            <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <button
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                            <h2 className="text-h5 text-foreground mb-0.5">
                                Erste Schritte
                            </h2>
                            <p className="text-body-sm text-muted-foreground">
                                Schalte die volle Power in 5 Minuten frei
                            </p>
                        </div>
                    </button>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                        {completedSteps}/{totalSteps}
                    </Badge>
                </div>

                {/* Progress Bar — always visible */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Collapsible Steps */}
                {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${step.completed
                                    ? 'bg-muted/30 border-border/50'
                                    : 'bg-background/50 border-border hover:border-primary/30 hover:shadow-sm'
                                    }`}
                            >
                                <div className="pt-0.5 shrink-0">
                                    {step.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div
                                        className={`font-semibold text-sm mb-0.5 ${step.completed
                                            ? 'text-muted-foreground line-through'
                                            : 'text-foreground'
                                            }`}
                                    >
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                        {step.description}
                                    </div>

                                    {!step.completed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={step.onAction}
                                            className="w-full h-8 text-xs"
                                        >
                                            {step.actionLabel}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
