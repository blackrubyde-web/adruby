import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../utils/formatters';
import { useAuthState, useAuthActions } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface GoalsPanelProps {
    kpis: {
        roas: number;
        spend: number;
        revenue: number;
    };
}

export function GoalsPanel({ kpis }: GoalsPanelProps) {
    const { user, profile } = useAuthState();
    const { refreshProfile } = useAuthActions();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const profileSettings = useMemo(() => {
        const raw = profile?.settings;
        if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
        return {};
    }, [profile?.settings]);

    const goalDefaults = useMemo(() => {
        const goals = profileSettings.goals as { roasTarget?: number; spendCap?: number; revenueGoal?: number } | undefined;
        return {
            roasTarget: goals?.roasTarget ?? 3.5,
            spendCap: goals?.spendCap ?? 6000,
            revenueGoal: goals?.revenueGoal ?? 18000,
        };
    }, [profileSettings]);

    const [goalDraft, setGoalDraft] = useState({
        roasTarget: goalDefaults.roasTarget.toString(),
        spendCap: goalDefaults.spendCap.toString(),
        revenueGoal: goalDefaults.revenueGoal.toString(),
    });

    useEffect(() => {
        setGoalDraft({
            roasTarget: goalDefaults.roasTarget.toString(),
            spendCap: goalDefaults.spendCap.toString(),
            revenueGoal: goalDefaults.revenueGoal.toString(),
        });
    }, [goalDefaults]);

    const { roasTarget, spendCap, revenueGoal } = goalDefaults;
    const spendProgress = Math.min(100, (kpis.spend / spendCap) * 100);
    const revenueProgress = Math.min(100, (kpis.revenue / revenueGoal) * 100);
    const roasProgress = Math.min(100, (kpis.roas / roasTarget) * 100);

    const handleOpen = () => {
        setGoalDraft({
            roasTarget: roasTarget.toString(),
            spendCap: spendCap.toString(),
            revenueGoal: revenueGoal.toString(),
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!user?.id) {
            toast.error('Bitte zuerst anmelden.');
            return;
        }
        const toNumber = (value: string, fallback: number) => {
            const parsed = Number(value.replace(',', '.'));
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        };
        const nextGoals = {
            roasTarget: toNumber(goalDraft.roasTarget, roasTarget),
            spendCap: toNumber(goalDraft.spendCap, spendCap),
            revenueGoal: toNumber(goalDraft.revenueGoal, revenueGoal),
        };

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    settings: {
                        ...profileSettings,
                        goals: nextGoals,
                    },
                })
                .eq('id', user.id);
            if (error) throw error;
            await refreshProfile();
            setIsEditing(false);
            toast.success('Ziele gespeichert');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Ziele konnten nicht gespeichert werden.';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <>
            <Card variant="glass">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Ziele</CardTitle>
                            <CardDescription>Budget & ROAS-Ziele</CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* ROAS */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground font-medium">ROAS Target</span>
                            <span className="font-bold">{kpis.roas.toFixed(2)}x / {roasTarget.toFixed(1)}x</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${roasProgress}%` }} />
                        </div>
                    </div>

                    {/* Spend */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Spend Cap</span>
                            <span className="font-bold">{formatCurrency(kpis.spend)} / {formatCurrency(spendCap)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${spendProgress}%` }} />
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Revenue Goal</span>
                            <span className="font-bold">{formatCurrency(kpis.revenue)} / {formatCurrency(revenueGoal)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${revenueProgress}%` }} />
                        </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleOpen}>
                        Ziele bearbeiten
                    </Button>
                </CardContent>
            </Card>

            {/* Edit Goals Dialog */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl border-primary/20">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Ziele bearbeiten</CardTitle>
                                    <CardDescription>Aktualisiere deine Ziele für diesen Workspace</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ROAS Target</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={goalDraft.roasTarget}
                                    onChange={(e) => setGoalDraft({ ...goalDraft, roasTarget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spend Cap</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={goalDraft.spendCap}
                                    onChange={(e) => setGoalDraft({ ...goalDraft, spendCap: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Revenue Goal</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={goalDraft.revenueGoal}
                                    onChange={(e) => setGoalDraft({ ...goalDraft, revenueGoal: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Speichern...' : 'Speichern'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
