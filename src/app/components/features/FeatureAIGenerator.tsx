import { Sparkles, Wand2, Target, Zap, Bot, Palette, Languages } from 'lucide-react';
import { FeaturePageTemplate } from './FeaturePageTemplate';

interface FeatureAIGeneratorProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAIGenerator({ onNavigate, onSignIn, onGetStarted }: FeatureAIGeneratorProps) {
    return (
        <FeaturePageTemplate
            currentPage="feature-ai-generator"
            badge="AI Ad Generator"
            badgeIcon={Sparkles}
            headlineTop="High-Converting Ads"
            headlineGradient="mit KI-Power"
            subtitle="Lade dein Produktbild hoch, beschreibe dein Angebot – und unsere KI erstellt professionelle Meta-Ads die verkaufen. Ohne Design-Skills nötig."
            accentGradient="from-[#E63946] to-rose-400"
            accentColor="#E63946"
            capabilities={[
                { icon: Wand2, title: 'One-Click Generation', description: 'Erstelle komplette Anzeigen mit einem Klick basierend auf deinem Produkt.' },
                { icon: Target, title: 'Zielgruppen-Optimierung', description: 'KI analysiert deine Zielgruppe und erstellt passende Creatives.' },
                { icon: Palette, title: 'Marken-Konsistenz', description: 'Behalte deine Markenidentität in jeder generierten Anzeige.' },
                { icon: Languages, title: 'Multi-Language', description: 'Generiere Ads in Deutsch, Englisch und weiteren Sprachen.' },
                { icon: Bot, title: 'Smart Copy', description: 'KI-generierte Headlines, CTAs und Beschreibungen die konvertieren.' },
                { icon: Zap, title: 'Blitzschnell', description: 'Von der Idee zur fertigen Anzeige in unter 60 Sekunden.' },
            ]}
            steps={[
                { step: '01', title: 'Produkt hochladen', desc: 'Lade dein Produktbild hoch oder gib eine URL ein.' },
                { step: '02', title: 'Details beschreiben', desc: 'Beschreibe dein Produkt, Zielgruppe und Angebot.' },
                { step: '03', title: 'KI generiert', desc: 'Unsere KI erstellt professionelle Ad Creatives.' },
                { step: '04', title: 'Anpassen & Nutzen', desc: 'Bearbeite bei Bedarf und exportiere für Meta Ads.' },
            ]}
            onNavigate={onNavigate}
            onSignIn={onSignIn}
            onGetStarted={onGetStarted}
        />
    );
}
