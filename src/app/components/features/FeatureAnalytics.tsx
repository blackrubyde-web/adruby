import { BarChart3, TrendingUp, Eye, DollarSign, PieChart, LineChart } from 'lucide-react';
import { FeaturePageTemplate } from './FeaturePageTemplate';

interface FeatureAnalyticsProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureAnalytics({ onNavigate, onSignIn, onGetStarted }: FeatureAnalyticsProps) {
    return (
        <FeaturePageTemplate
            currentPage="feature-analytics"
            badge="Analytics Dashboard"
            badgeIcon={BarChart3}
            headlineTop="Performance"
            headlineGradient="in Echtzeit."
            subtitle="Tracke ROAS, CTR, CPA und mehr in einem übersichtlichen Dashboard. Alle Kampagnen-Daten an einem Ort."
            accentGradient="from-emerald-500 to-green-400"
            accentColor="#10B981"
            capabilities={[
                { icon: TrendingUp, title: 'Echtzeit-Metriken', description: 'ROAS, CTR, CPA und alle relevanten KPIs live überwachen.' },
                { icon: Eye, title: 'Kampagnen-Übersicht', description: 'Alle Kampagnen auf einen Blick mit Performance-Bewertung.' },
                { icon: DollarSign, title: 'Cost Tracking', description: 'Verfolge Ausgaben und ROI über alle Kampagnen hinweg.' },
                { icon: PieChart, title: 'Audience Insights', description: 'Verstehe deine Zielgruppe mit demografischen Daten.' },
                { icon: LineChart, title: 'Trend-Analyse', description: 'Erkenne Trends und reagiere bevor es zu spät ist.' },
                { icon: BarChart3, title: 'Custom Reports', description: 'Erstelle individuelle Reports für Stakeholder.' },
            ]}
            steps={[
                { step: '01', title: 'Kampagnen verbinden', desc: 'Verbinde deinen Meta Ads Account mit einem Klick.' },
                { step: '02', title: 'Daten sync', desc: 'Alle Kampagnen-Daten werden automatisch synchronisiert.' },
                { step: '03', title: 'Insights erhalten', desc: 'Dein Dashboard zeigt die wichtigsten Metriken und Trends.' },
            ]}
            onNavigate={onNavigate}
            onSignIn={onSignIn}
            onGetStarted={onGetStarted}
        />
    );
}
