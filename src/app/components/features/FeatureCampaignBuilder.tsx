import { Rocket, Target, Megaphone, Gauge, Settings2, Calendar } from 'lucide-react';
import { FeaturePageTemplate } from './FeaturePageTemplate';

interface FeatureCampaignBuilderProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureCampaignBuilder({ onNavigate, onSignIn, onGetStarted }: FeatureCampaignBuilderProps) {
    return (
        <FeaturePageTemplate
            currentPage="feature-campaign-builder"
            badge="Campaign Builder"
            badgeIcon={Rocket}
            headlineTop="Meta-Kampagnen"
            headlineGradient="Schritt für Schritt."
            subtitle="Baue und launche Meta-Kampagnen mit einem geführten Wizard. Von der Strategie bis zum Launch — alles in einem Tool."
            accentGradient="from-blue-500 to-cyan-400"
            accentColor="#3B82F6"
            capabilities={[
                { icon: Target, title: 'Zielgruppen-Builder', description: 'Definiere präzise Targeting-Optionen mit KI-Empfehlungen.' },
                { icon: Megaphone, title: 'Ad Set Konfiguration', description: 'Stelle Budget, Zeitplan und Platzierungen visuell ein.' },
                { icon: Gauge, title: 'Performance-Prognose', description: 'Sieh vorher, wie deine Kampagne performen kann.' },
                { icon: Calendar, title: 'Zeitplan-Management', description: 'Plane Kampagnen-Starts und automatische Pausierungen.' },
                { icon: Settings2, title: 'A/B Testing', description: 'Erstelle Varianten und lass die KI den Gewinner finden.' },
                { icon: Rocket, title: 'One-Click Launch', description: 'Pushe deine Kampagne direkt zu Meta Ads Manager.' },
            ]}
            steps={[
                { step: '01', title: 'Kampagnen-Ziel wählen', desc: 'Wähle dein Ziel: Conversions, Traffic, Awareness oder Lead Gen.' },
                { step: '02', title: 'Zielgruppe & Budget', desc: 'Definiere Targeting, Budget und Zeitraum.' },
                { step: '03', title: 'Creatives zuweisen', desc: 'Wähle Creatives aus deiner Library oder generiere neue.' },
                { step: '04', title: 'Launchen', desc: 'Prüfe alles im Review und launche mit einem Klick.' },
            ]}
            onNavigate={onNavigate}
            onSignIn={onSignIn}
            onGetStarted={onGetStarted}
        />
    );
}
