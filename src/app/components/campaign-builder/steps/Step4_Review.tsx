import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { Rocket, Target, Megaphone, Loader2 } from 'lucide-react';
import { Card } from '../../ui/card';
import { useState } from 'react';

export const Step4_Review = () => {
    const { campaignSpec, selectedIds, ads, isSaving, saveDraft } = useCampaignBuilder();
    const [showConfetti, setShowConfetti] = useState(false);

    const selectedAds = ads.filter(ad => selectedIds.includes(ad.id));

    const handleLaunch = async () => {
        // In a real app we'd trigger confetti here
        setShowConfetti(true);
        await saveDraft('ready'); // 'ready' status implies launch
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Ready for Takeoff? 🚀</h2>
                <p className="text-muted-foreground">Review your campaign details before launching to Meta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Details */}
                <Card className="p-6 space-y-4 bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary" /> Campaign
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-semibold">{campaignSpec.campaign.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Objective</span>
                            <span className="font-mono bg-background px-2 py-0.5 rounded border">{campaignSpec.campaign.objective}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-semibold">{campaignSpec.campaign.daily_budget} € / day</span>
                        </div>
                    </div>
                </Card>

                {/* Creative Stats */}
                <Card className="p-6 space-y-4 bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Megaphone className="w-5 h-5 text-pink-500" /> Creatives
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ads Selected</span>
                            <span className="font-semibold">{selectedIds.length}</span>
                        </div>

                        <div className="space-y-2 mt-4">
                            {selectedAds.slice(0, 3).map(ad => (
                                <div key={ad.id} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg border border-border/50">
                                    <div className="w-8 h-8 rounded bg-muted shrink-0 overflow-hidden">
                                        {ad.thumbnail && <img src={ad.thumbnail} className="w-full h-full object-cover" />}
                                    </div>
                                    <span className="truncate flex-1 font-medium">{ad.name}</span>
                                </div>
                            ))}
                            {selectedAds.length > 3 && (
                                <p className="text-xs text-center text-muted-foreground pt-1">...and {selectedAds.length - 3} more</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Flight Plan Actions */}
            <div className="flex flex-col items-center gap-4 pt-8">
                <Button
                    size="lg"
                    className="w-full md:w-auto px-12 h-14 text-lg gap-3 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)] transition-all duration-300 transform hover:scale-105"
                    onClick={handleLaunch}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                    {isSaving ? 'Launching...' : 'Launch Campaign'}
                </Button>

                <Button variant="ghost" className="text-muted-foreground text-xs" onClick={() => saveDraft('draft')} disabled={isSaving}>
                    Save as Draft only
                </Button>
            </div>

            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    {/* Simplified confetti effect placeholder */}
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-10"></div>
                </div>
            )}
        </div>
    );
};
