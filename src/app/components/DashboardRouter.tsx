import { lazy, Suspense, memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Footer } from './Footer';
import { PageSkeleton } from '../lib/skeletons';
import { useAdmin } from '../contexts/AdminContext';
import type { PageType } from '../lib/routing';

// Lazy-loaded dashboard page components
const OverviewPage = lazy(() => import('./OverviewPage').then((mod) => ({ default: mod.OverviewPage })));
const LazyAnalyticsPage = lazy(() => import('./AnalyticsPage').then((mod) => ({ default: mod.AnalyticsPage })));
const CampaignsPage = lazy(() => import('./CampaignsPage').then((mod) => ({ default: mod.CampaignsPage })));
const CampaignBuilderPage = lazy(() => import('./CampaignBuilderPage').then((mod) => ({ default: mod.CampaignBuilderPage })));
const LazyAIAnalysisPage = lazy(() => import('./AIAnalysisPage').then((mod) => ({ default: mod.AIAnalysisPage })));
const SettingsPage = lazy(() => import('./SettingsPage').then((mod) => ({ default: mod.SettingsPage })));
const AffiliatePage = lazy(() => import('./AffiliatePage').then((mod) => ({ default: mod.AffiliatePage })));
const ProfilePage = lazy(() => import('./ProfilePage').then((mod) => ({ default: mod.ProfilePage })));
const HelpSupportPage = lazy(() => import('./HelpSupportPage').then((mod) => ({ default: mod.HelpSupportPage })));
const CreativeLibraryPage = lazy(() => import('./CreativeLibraryPage').then((mod) => ({ default: mod.CreativeLibraryPage })));
const LazyStudioPage = lazy(() => import('./StudioPage').then((mod) => ({ default: mod.StudioPage })));
const LazyAIAdBuilderPage = lazy(() => import('./AIAdBuilderPage').then((mod) => ({ default: mod.AIAdBuilderPage })));
const LazyAdminDashboardPage = lazy(() => import('./AdminDashboardPage').then((mod) => ({ default: mod.AdminDashboardPage })));
const LazyCampaignCanvasPage = lazy(() => import('./CampaignCanvasPage').then((mod) => ({ default: mod.CampaignCanvasPage })));

const skeletonFallback = <PageSkeleton />;

function DashboardPageInner({
    currentPage,
    onNavigate,
}: {
    currentPage: PageType;
    onNavigate: (page: PageType, query?: Record<string, string | undefined | null>) => void;
}) {
    const { isAdmin } = useAdmin();
    const fullPage = 'flex flex-col min-h-[calc(100vh-64px)] pt-0 md:pt-[var(--header-height)]';
    const canvasPage = 'min-h-screen bg-background flex flex-col';

    switch (currentPage) {
        case 'dashboard':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><OverviewPage onNavigate={(page, query) => onNavigate(page as PageType, query)} /></Suspense><Footer /></div>);
        case 'analytics':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><LazyAnalyticsPage /></Suspense><Footer /></div>);
        case 'campaigns':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><CampaignsPage /></Suspense><Footer /></div>);
        case 'campaign-builder':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><CampaignBuilderPage /></Suspense><Footer /></div>);
        case 'aianalysis':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><LazyAIAnalysisPage /></Suspense><Footer /></div>);
        case 'settings':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><SettingsPage /></Suspense><Footer /></div>);
        case 'affiliate':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><AffiliatePage /></Suspense><Footer /></div>);
        case 'profile':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><ProfilePage onNavigate={onNavigate} /></Suspense><Footer /></div>);
        case 'help':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><HelpSupportPage /></Suspense><Footer /></div>);
        case 'library':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><CreativeLibraryPage /></Suspense><Footer /></div>);
        case 'studio':
            return (<div className={canvasPage}><Suspense fallback={skeletonFallback}><LazyStudioPage /></Suspense></div>);
        case 'aibuilder':
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><LazyAIAdBuilderPage /></Suspense><Footer /></div>);
        case 'admin':
            if (!isAdmin) return (<div className={fullPage}><div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"><svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg></div><h2 className="text-xl font-bold text-foreground">Zugriff verweigert</h2><p className="text-muted-foreground text-sm">Du hast keine Berechtigung für diese Seite.</p></div></div>);
            return (<div className={fullPage}><Suspense fallback={skeletonFallback}><LazyAdminDashboardPage /></Suspense><Footer /></div>);
        case 'campaign-canvas':
            return (<div className={canvasPage}><Suspense fallback={skeletonFallback}><LazyCampaignCanvasPage /></Suspense></div>);
        default:
            return null;
    }
}

export const DashboardPageContent = memo(function DashboardPageContent({
    currentPage,
    onNavigate,
}: {
    currentPage: PageType;
    onNavigate: (page: PageType, query?: Record<string, string | undefined | null>) => void;
}) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <DashboardPageInner currentPage={currentPage} onNavigate={onNavigate} />
            </motion.div>
        </AnimatePresence>
    );
});
