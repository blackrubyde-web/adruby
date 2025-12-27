import { useState } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { applyMetaAction } from '../../lib/api/meta';
import { supabase } from '../../lib/supabaseClient';

interface AIRecommendation {
    recommendation: 'kill' | 'duplicate' | 'increase' | 'decrease';
    confidence: number;
    reason: string;
    expectedImpact: string;
}

interface Props {
    campaignId: string;
    campaignName: string;
    recommendation: AIRecommendation;
    onSuccess?: () => void;
}

export function ApplyRecommendationButton({ campaignId, campaignName, recommendation, onSuccess }: Props) {
    const [isApplying, setIsApplying] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const getActionDetails = () => {
        switch (recommendation.recommendation) {
            case 'kill':
                return {
                    action: 'pause' as const,
                    label: 'Pause Campaign',
                    description: 'This will pause the campaign in Meta',
                    confirmText: `Pause "${campaignName}"?`,
                    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
                    color: 'bg-red-500'
                };
            case 'duplicate':
                return {
                    action: 'duplicate' as const,
                    label: 'Duplicate Campaign',
                    description: 'This will create a copy of the campaign in Meta (paused)',
                    confirmText: `Duplicate "${campaignName}"?`,
                    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                    color: 'bg-green-500'
                };
            case 'increase':
                return {
                    action: 'increase' as const,
                    label: 'Increase Budget +50%',
                    description: 'This will increase the campaign budget by 50%',
                    confirmText: `Increase budget for "${campaignName}" by 50%?`,
                    icon: <Zap className="w-5 h-5 text-blue-500" />,
                    color: 'bg-blue-500',
                    scalePct: 0.5
                };
            case 'decrease':
                return {
                    action: 'decrease' as const,
                    label: 'Decrease Budget -30%',
                    description: 'This will decrease the campaign budget by 30%',
                    confirmText: `Decrease budget for "${campaignName}" by 30%?`,
                    icon: <Zap className="w-5 h-5 text-orange-500" />,
                    color: 'bg-orange-500',
                    scalePct: 0.3
                };
        }
    };

    const actionDetails = getActionDetails();

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Log action to database
            const { data: actionLog, error: logError } = await supabase
                .from('autopilot_actions')
                .insert({
                    user_id: user.id,
                    campaign_id: campaignId,
                    campaign_name: campaignName,
                    action: actionDetails.action,
                    reason: recommendation.reason,
                    scale_pct: actionDetails.scalePct || null,
                    status: 'pending'
                })
                .select()
                .single();

            if (logError) throw logError;

            // Apply to Meta
            const result = await applyMetaAction({
                campaignId,
                action: actionDetails.action,
                scalePct: actionDetails.scalePct
            });

            // Update action log to applied
            await supabase
                .from('autopilot_actions')
                .update({
                    status: 'applied',
                    applied_at: new Date().toISOString(),
                    new_value: result
                })
                .eq('id', actionLog.id);

            // Success notification
            let successMessage = `${actionDetails.label} applied successfully`;
            if (result?.resultId) {
                successMessage += ` (ID: ${result.resultId})`;
            }
            if (result?.previous && result?.next) {
                successMessage += ` (Budget: ${result.previous} → ${result.next})`;
            }

            toast.success(successMessage);
            setShowConfirm(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to apply recommendation:', error);

            // Update action log to failed
            await supabase
                .from('autopilot_actions')
                .update({
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                })
                .eq('campaign_id', campaignId)
                .eq('status', 'pending');

            toast.error(error instanceof Error ? error.message : 'Failed to apply recommendation');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isApplying}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
                {actionDetails.icon}
                <span>{actionDetails.label}</span>
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Confirm Action</h3>

                        <div className="space-y-4">
                            {/* Action Summary */}
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {actionDetails.icon}
                                    <p className="font-semibold">{actionDetails.confirmText}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {actionDetails.description}
                                </p>
                            </div>

                            {/* AI Reasoning */}
                            <div className="border border-border rounded-xl p-4">
                                <p className="text-sm font-medium mb-2">AI Reasoning:</p>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {recommendation.reason}
                                </p>
                                <p className="text-sm font-medium mb-1">Expected Impact:</p>
                                <p className="text-sm text-muted-foreground">
                                    {recommendation.expectedImpact}
                                </p>
                                <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        Confidence: {recommendation.confidence}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isApplying}
                                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className={`flex-1 px-4 py-2 ${actionDetails.color} text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Apply Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
