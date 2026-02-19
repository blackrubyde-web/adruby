import { Layers, FolderSearch, Tag, Download, Image, Grid3x3 } from 'lucide-react';
import { FeaturePageTemplate } from './FeaturePageTemplate';

interface FeatureCreativeLibraryProps {
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeatureCreativeLibrary({ onNavigate, onSignIn, onGetStarted }: FeatureCreativeLibraryProps) {
    return (
        <FeaturePageTemplate
            currentPage="feature-creative-library"
            badge="Creative Library"
            badgeIcon={Layers}
            headlineTop="Deine Creatives,"
            headlineGradient="perfekt organisiert."
            subtitle="Finde, tagge und organisiere all deine Creatives an einem Ort. Keine chaotischen Ordner mehr — sofort das richtige Asset finden."
            accentGradient="from-violet-500 to-purple-400"
            accentColor="#8B5CF6"
            capabilities={[
                { icon: FolderSearch, title: 'Smart Search', description: 'Finde jedes Creative instant mit KI-gestützter Suche.' },
                { icon: Tag, title: 'Auto-Tagging', description: 'Creatives werden automatisch kategorisiert und getaggt.' },
                { icon: Grid3x3, title: 'Grid View', description: 'Visueller Überblick über alle Assets in deiner Library.' },
                { icon: Image, title: 'Format-Vorschau', description: 'Sieh sofort wie dein Creative in verschiedenen Formaten aussieht.' },
                { icon: Download, title: 'Bulk Export', description: 'Exportiere mehrere Creatives gleichzeitig in allen Formaten.' },
                { icon: Layers, title: 'Varianten-Management', description: 'Verwalte A/B-Test Varianten und Performance-Vergleiche.' },
            ]}
            steps={[
                { step: '01', title: 'Creatives hochladen', desc: 'Lade deine bestehenden Creatives hoch oder generiere neue.' },
                { step: '02', title: 'Automatisch organisiert', desc: 'KI taggt und kategorisiert deine Assets automatisch.' },
                { step: '03', title: 'Suchen & Finden', desc: 'Finde das perfekte Creative in Sekunden.' },
            ]}
            onNavigate={onNavigate}
            onSignIn={onSignIn}
            onGetStarted={onGetStarted}
        />
    );
}
