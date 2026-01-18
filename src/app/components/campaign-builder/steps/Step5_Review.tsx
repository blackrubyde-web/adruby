import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Rocket, Target, Megaphone, MapPin, Users, Zap, DollarSign, Eye, CheckCircle2, Loader2, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState } from 'react';

export const Step5_Review = () => {
    const {
        campaignSetup,
        targeting,
        strategyConfig,
        selectedCreatives,
        selectedStrategy,
        isPublishing,
        error,
        previewCampaign,
        publishToMeta,
    } = useCampaignBuilder();

    const [showConfetti, setShowConfetti] = useState(false);
    const [publishResult, setPublishResult] = useState<{ success: boolean; campaignId?: string } | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const result = await previewCampaign();
            console.log('Preview result:', result);
            // Could show preview modal here
        } catch (err) {
            console.error('Preview error:', err);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleLaunch = async () => {
        const result = await publishToMeta();
        if (result.success) {
            setShowConfetti(true);
            setPublishResult(result);
            // Celebration animation
            setTimeout(() => setShowConfetti(false), 5000);
        }
    };

    const objectiveLabels: Record<string, string> = {
        'OUTCOME_SALES': '🛒 Sales',
        'OUTCOME_LEADS': '📋 Leads',
        'OUTCOME_TRAFFIC': '🔗 Traffic',
        'OUTCOME_AWARENESS': '📢 Awareness',
    };

    const bidStrategyLabels: Record<string, string> = {
        'LOWEST_COST': 'Lowest Cost',
        'COST_CAP': 'Cost Cap',
        'BID_CAP': 'Bid Cap',
        'ROAS_GOAL': 'ROAS Goal',
    };

    // Success State
    if (publishResult?.success) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-ping"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 0.5}s`,
                                    }}
                                >
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight">🚀 Kampagne Live!</h2>
                    <p className="text-lg text-muted-foreground">
                        Deine Kampagne wurde erfolgreich zu Meta gepusht.
                    </p>
                </div>

                <Card className="p-6 bg-green-500/5 border-green-500/20">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-left">
                            <p className="text-sm text-muted-foreground">Campaign ID</p>
                            <p className="font-mono font-bold">{publishResult.campaignId}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`https://business.facebook.com/adsmanager/manage/campaigns?act=${publishResult.campaignId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Im Ads Manager öffnen
                            </a>
                        </Button>
                    </div>
                </Card>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => window.location.href = '/campaigns'}>
                        Zu meinen Kampagnen
                    </Button>
                    <Button onClick={() => window.location.href = '/campaign-builder'}>
                        Neue Kampagne erstellen
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-3">
                    <Rocket className="w-8 h-8 text-primary" />
                    Ready for Takeoff?
                </h2>
                <p className="text-muted-foreground">Überprüfe deine Kampagne und pushe sie zu Meta.</p>
            </div>

            {/* Campaign Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Campaign Setup */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold">Campaign</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-semibold truncate max-w-[150px]">{campaignSetup.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ziel</span>
                            <Badge variant="secondary" className="text-xs">{objectiveLabels[campaignSetup.objective]}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-semibold">€{campaignSetup.budgetType === 'daily' ? campaignSetup.dailyBudget : campaignSetup.lifetimeBudget} / {campaignSetup.budgetType === 'daily' ? 'Tag' : 'Laufzeit'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bidding</span>
                            <span className="font-mono text-xs">{bidStrategyLabels[campaignSetup.bidStrategy]}</span>
                        </div>
                    </div>
                </Card>

                {/* Creatives */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                            <Megaphone className="w-5 h-5 text-pink-500" />
                        </div>
                        <h3 className="font-bold">Creatives</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Anzahl</span>
                            <span className="font-bold text-lg">{selectedCreatives.length}</span>
                        </div>
                        <div className="flex -space-x-2">
                            {selectedCreatives.slice(0, 5).map(creative => (
                                creative.thumbnail ? (
                                    <img
                                        key={creative.id}
                                        src={creative.thumbnail}
                                        alt=""
                                        className="w-10 h-10 rounded-lg border-2 border-background object-cover"
                                    />
                                ) : (
                                    <div key={creative.id} className="w-10 h-10 rounded-lg border-2 border-background bg-muted flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                )
                            ))}
                            {selectedCreatives.length > 5 && (
                                <div className="w-10 h-10 rounded-lg border-2 border-background bg-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">+{selectedCreatives.length - 5}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Targeting */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="font-bold">Targeting</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Standorte</span>
                            <span className="font-semibold">{targeting.locations.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Alter</span>
                            <span className="font-semibold">{targeting.ageMin} - {targeting.ageMax}+</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Geschlecht</span>
                            <span className="font-semibold">{targeting.gender === 'all' ? 'Alle' : targeting.gender === 'male' ? 'Männer' : 'Frauen'}</span>
                        </div>
                        {targeting.interests.length > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Interessen</span>
                                <span className="font-semibold">{targeting.interests.length}</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Placements */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-violet-500" />
                        </div>
                        <h3 className="font-bold">Placements</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {targeting.placements.map(p => (
                            <Badge key={p} variant="secondary" className="text-xs capitalize">
                                {p.replace('_', ' ')}
                            </Badge>
                        ))}
                    </div>
                    {targeting.advantagePlus && (
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Advantage+ aktiv
                        </Badge>
                    )}
                </Card>

                {/* Strategy */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="font-bold">Strategy</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Blueprint</span>
                            <span className="font-semibold">{selectedStrategy?.title || 'Custom'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Target ROAS</span>
                            <span className="font-semibold text-green-500">{strategyConfig.targetRoas.toFixed(1)}x</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Risiko</span>
                            <span className="font-semibold capitalize">{strategyConfig.riskTolerance}</span>
                        </div>
                    </div>
                </Card>

                {/* Budget Summary */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="font-bold">Budget</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Testing</span>
                            <span className="font-semibold">{strategyConfig.testingBudgetPct}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Scaling</span>
                            <span className="font-semibold">{strategyConfig.scalingBudgetPct}%</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Monatlich ca.</span>
                            <span className="font-bold text-green-500">€{((campaignSetup.budgetType === 'daily' ? campaignSetup.dailyBudget : campaignSetup.lifetimeBudget / 30) * 30).toFixed(0)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="p-4 bg-red-500/10 border-red-500/20 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-500 text-sm">{error}</p>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePreview}
                        disabled={isPreviewLoading || isPublishing}
                        className="gap-2"
                    >
                        {isPreviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        Preview
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleLaunch}
                        disabled={isPublishing}
                        className="px-12 h-14 text-lg gap-3 bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-600/90 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)] transition-all duration-300 transform hover:scale-105"
                    >
                        {isPublishing ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Wird gepusht...
                            </>
                        ) : (
                            <>
                                <Rocket className="w-6 h-6" />
                                Zu Meta pushen
                            </>
                        )}
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center max-w-md">
                    Die Kampagne wird in deinem verbundenen Meta Ads Account erstellt.
                    Du kannst sie jederzeit im Ads Manager bearbeiten.
                </p>
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-10" />
                </div>
            )}
        </div>
    );
};
