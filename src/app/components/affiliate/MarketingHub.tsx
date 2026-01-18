import { useState } from 'react';
import { Download, Copy, Check, Image, Mail, MessageSquare, Link2, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface MarketingHubProps {
    affiliateCode: string;
    affiliateLink: string;
}

const BANNER_SIZES = [
    { id: 'story', label: 'Instagram Story', size: '1080x1920', ratio: 'aspect-[9/16]' },
    { id: 'square', label: 'Instagram Post', size: '1080x1080', ratio: 'aspect-square' },
    { id: 'landscape', label: 'Facebook/LinkedIn', size: '1200x630', ratio: 'aspect-video' },
    { id: 'leaderboard', label: 'Website Banner', size: '728x90', ratio: 'aspect-[728/90]' },
];

const SOCIAL_POSTS = [
    {
        id: 'instagram',
        platform: 'Instagram',
        icon: '📸',
        text: `🚀 Mein Geheimtipp für Meta Ads: AdRuby!

KI-gestützte Analyse, automatische Creative-Erstellung und echte Insights statt Ratespiel.

Ich nutze es täglich und spare Stunden.

Teste es 14 Tage kostenlos mit meinem Code: {CODE}

#MetaAds #DigitalMarketing #Automatisierung`
    },
    {
        id: 'linkedin',
        platform: 'LinkedIn',
        icon: '💼',
        text: `Ich werde oft gefragt, welche Tools ich für Meta Ads empfehle.

Meine Antwort: AdRuby.

Warum?
✅ KI analysiert deine Campaigns in Echtzeit
✅ Automatische Creative-Erstellung
✅ Spart 10+ Stunden pro Woche

Wenn du ernsthaft skalieren willst, schau es dir an:
{LINK}

#PerformanceMarketing #MetaAds #MarketingTools`
    },
    {
        id: 'twitter',
        platform: 'X/Twitter',
        icon: '𝕏',
        text: `Meta Ads ohne Tool = 💸 verschwendet

Seit ich @AdRuby nutze:
• 3x besserer ROAS
• 80% weniger manuelle Arbeit
• KI macht die Creative-Arbeit

Probier's aus: {LINK}`
    },
];

const EMAIL_TEMPLATES = [
    {
        id: 'intro',
        name: 'Erstkontakt',
        subject: 'Tool-Empfehlung: Meta Ads auf Autopilot',
        preview: 'Hey! Ich wollte dir kurz ein Tool zeigen, das mir mega viel Zeit spart...'
    },
    {
        id: 'followup',
        name: 'Follow-up',
        subject: 'Hast du AdRuby schon getestet?',
        preview: 'Ich hatte dir letzte Woche AdRuby empfohlen. Das Feedback aus meiner Community ist...'
    },
];

export function MarketingHub({ affiliateCode, affiliateLink }: MarketingHubProps) {
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'banners' | 'social' | 'email'>('social');

    const copyToClipboard = async (text: string, label: string) => {
        const formattedText = text
            .replace('{CODE}', affiliateCode)
            .replace('{LINK}', affiliateLink);

        await navigator.clipboard.writeText(formattedText);
        setCopiedItem(label);
        toast.success(`${label} kopiert!`);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Marketing Hub
                    </h3>
                    <p className="text-sm text-muted-foreground">Fertige Assets für deine Promotion</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0">
                    Dein Code: {affiliateCode}
                </Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {[
                    { id: 'social', label: 'Social Posts', icon: MessageSquare },
                    { id: 'banners', label: 'Banner', icon: Image },
                    { id: 'email', label: 'E-Mail Templates', icon: Mail },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Social Posts */}
            {activeTab === 'social' && (
                <div className="grid gap-4">
                    {SOCIAL_POSTS.map((post) => (
                        <Card key={post.id} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{post.icon}</span>
                                    <span className="font-semibold">{post.platform}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant={copiedItem === post.id ? "default" : "outline"}
                                    onClick={() => copyToClipboard(post.text, post.id)}
                                    className="gap-2"
                                >
                                    {copiedItem === post.id ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Kopiert!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Kopieren
                                        </>
                                    )}
                                </Button>
                            </div>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/50 p-3 rounded-lg">
                                {post.text.replace('{CODE}', affiliateCode).replace('{LINK}', affiliateLink)}
                            </pre>
                        </Card>
                    ))}
                </div>
            )}

            {/* Banners */}
            {activeTab === 'banners' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {BANNER_SIZES.map((banner) => (
                        <Card key={banner.id} className="p-4 space-y-3">
                            <div className={cn(
                                "bg-gradient-to-br from-rose-500 to-primary rounded-lg flex items-center justify-center text-white",
                                banner.ratio,
                                "max-h-40"
                            )}>
                                <div className="text-center p-2">
                                    <div className="font-black text-lg">AdRuby</div>
                                    <div className="text-xs opacity-80">Meta Ads AI</div>
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{banner.label}</div>
                                <div className="text-xs text-muted-foreground">{banner.size}</div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Email Templates */}
            {activeTab === 'email' && (
                <div className="grid gap-4">
                    {EMAIL_TEMPLATES.map((template) => (
                        <Card key={template.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Badge variant="secondary" className="mb-2">{template.name}</Badge>
                                    <h4 className="font-semibold text-sm mb-1">{template.subject}</h4>
                                    <p className="text-sm text-muted-foreground">{template.preview}</p>
                                </div>
                                <Button size="sm" variant="outline" className="gap-2 shrink-0">
                                    <Copy className="w-4 h-4" />
                                    Template kopieren
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Affiliate Link Section */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-rose-500/5 border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold mb-1 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            Dein persönlicher Affiliate-Link
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono break-all">{affiliateLink}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(affiliateLink, 'link')}
                            className="gap-2"
                        >
                            {copiedItem === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Kopieren
                        </Button>
                        <Button asChild className="gap-2">
                            <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                                Öffnen
                            </a>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
