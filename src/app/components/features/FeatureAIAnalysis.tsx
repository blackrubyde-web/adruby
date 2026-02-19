import { Brain, Lightbulb, AlertTriangle, TrendingUp, Sparkles, Search } from 'lucide-react';
import { FeaturePageTemplate } from './FeaturePageTemplate';

interface FeatureAIAnalysisProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAIAnalysis({ onNavigate, onSignIn, onGetStarted }: FeatureAIAnalysisProps) {
    return (
        <FeaturePageTemplate
            currentPage="feature-ai-analysis"
            badge="KI-Analyse"
            badgeIcon={Brain}
            headlineTop="Automatische Insights,"
            headlineGradient="intelligente Empfehlungen."
            subtitle="Unsere KI analysiert deine Kampagnen kontinuierlich, erkennt Anomalien und gibt dir datenbasierte Empfehlungen zur Optimierung."
            accentGradient="from-amber-500 to-orange-400"
            accentColor="#F59E0B"
            capabilities={[
                { icon: Lightbulb, title: 'Smart Insights', description: 'Automatische Erkennung von Optimierungspotenzial.' },
                { icon: AlertTriangle, title: 'Anomaly Detection', description: 'Sofortige Benachrichtigung bei ungewöhnlichen Metriken.' },
                { icon: TrendingUp, title: 'Performance-Prognosen', description: 'KI sagt voraus, wie sich Kampagnen entwickeln werden.' },
                { icon: Sparkles, title: 'Creative Scoring', description: 'Jedes Creative wird bewertet — finde deine Top-Performer.' },
                { icon: Search, title: 'Wettbewerbs-Analyse', description: 'Verstehe was deine Konkurrenz macht und bleib vorne.' },
                { icon: Brain, title: 'Lernende KI', description: 'Je mehr du nutzt, desto besser werden die Empfehlungen.' },
            ]}
            steps={[
                { step: '01', title: 'Kampagnen verbinden', desc: 'Verbinde deinen Ad Account für automatische Analyse.' },
                { step: '02', title: 'KI analysiert', desc: 'Unsere KI scannt alle Kampagnen und erkennt Muster.' },
                { step: '03', title: 'Empfehlungen umsetzen', desc: 'Setze die KI-Empfehlungen um und sieh die Ergebnisse.' },
            ]}
            onNavigate={onNavigate}
            onSignIn={onSignIn}
            onGetStarted={onGetStarted}
        />
    );
}
