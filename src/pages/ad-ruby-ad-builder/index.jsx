import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Sparkles, Zap, Brain, TrendingUp, Clock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageShell from '../../components/ui/PageShell';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { UI } from '../../components/ui/uiPrimitives';
import StepBriefing from './steps/StepBriefing';
import StepMarketScan from './steps/StepMarketScan';
import StepCreativeDNA from './steps/StepCreativeDNA';
import StepResults from './steps/StepResults';
import { adBuilderReducer, initialAdBuilderState } from './state/adBuilderMachine';
import { runAdBuilderFlow } from './utils/runAdBuilderFlow';
import { useAuth } from '../../contexts/AuthContext';

const sampleAds = [
  {
    headline: 'Erreiche deine Ziele 3x schneller',
    hook: 'Social proof + Klarer Nutzen',
    primaryText:
      'Über 50.000 Kunden nutzen unseren Tracker, um mehr Fokus und Energie in den Alltag zu bringen. 14 Tage kostenlos testen.',
    description: 'Perfekt für E-Com & Fitness | deutsch',
    cta: 'Jetzt testen',
    ctr: '+238%',
    hookScore: '9.2/10'
  },
  {
    headline: 'Mehr Umsatz mit weniger Ad-Spend',
    hook: 'Value-first Offer',
    primaryText:
      'Starte mit 1.000 kostenlosen Credits und lass die KI deine besten Creatives bauen. Ohne Kreditkarte, sofort live.',
    description: 'B2B SaaS | englisch',
    cta: 'Free Trial starten',
    ctr: '+312%',
    hookScore: '9.5/10'
  },
  {
    headline: 'Lokale Leads in 48 Stunden',
    hook: 'Dringlichkeit + Lokal',
    primaryText:
      'Für Coaches & Agenturen: KI-generierte Anzeigen, die hyperlokal targeten. Mehr Termine, weniger Streuverlust.',
    description: 'Local Service | deutsch',
    cta: 'Demo sichern',
    ctr: '+186%',
    hookScore: '8.7/10'
  }
];

const ProgressSteps = ({ phase }) => {
  const steps = [
    { key: 'scraping', label: 'Scraping' },
    { key: 'analyzing', label: 'Analyse' },
    { key: 'results', label: 'Ergebnisse' }
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s) => {
        const active = phase === s.key;
        const done = ['analyzing', 'results'].includes(phase) && s.key !== 'results';
        return (
          <div
            key={s.key}
            className={`rounded-xl px-3 py-2 text-xs flex items-center gap-2 border ${done ? 'bg-secondary border-border text-foreground' : active ? 'bg-accent border-border text-foreground' : 'bg-card border-border text-muted-foreground'}`}
          >
            <span className={`w-2 h-2 rounded-full ${done ? 'bg-primary' : active ? 'bg-foreground' : 'bg-border'}`} />
            {s.label}
          </div>
        );
      })}
    </div>
  );
};

const AdRubyAdBuilder = () => {
  const [state, dispatch] = useReducer(adBuilderReducer, initialAdBuilderState);
  const runRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const runIdRef = useRef(0);
  const saveTimerRef = useRef(null);
  const draftKey = 'adruby_ad_builder_draft_v1';
  const { user } = useAuth();
  const [searchUrl, setSearchUrl] = useState('');
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('');
  const [market, setMarket] = useState('');
  const [language, setLanguage] = useState('de');
  const [selectedTab, setSelectedTab] = useState('creatives');
  const [creativeTone, setCreativeTone] = useState('balanced');

  const filteredAds = useMemo(() => state.generatedAds || [], [state.generatedAds]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (draft) {
        setSearchUrl(draft.searchUrl || '');
        setProduct(draft.product || '');
        setGoal(draft.goal || '');
        setMarket(draft.market || '');
        setLanguage(draft.language || 'de');
        setCreativeTone(draft.creativeTone || 'balanced');
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist draft (debounced)
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const payload = { searchUrl, product, goal, market, language, creativeTone };
      localStorage.setItem(draftKey, JSON.stringify(payload));
    }, 300);
    return () => clearTimeout(saveTimerRef.current);
  }, [searchUrl, product, goal, market, language, creativeTone]);

  // Abort on unmount
  useEffect(() => () => handleCancel(), []);

  const normalizeError = (msg) =>
    msg || 'Unbekannter Fehler. Bitte Eingaben prüfen und erneut versuchen.';

  const handleUseSampleData = () => {
    dispatch({ type: 'AI_SUCCESS', payload: sampleAds });
  };

  const handleResetDraft = () => {
    localStorage.removeItem(draftKey);
    setSearchUrl('');
    setProduct('');
    setGoal('');
    setMarket('');
    setLanguage('de');
    setCreativeTone('balanced');
    dispatch({ type: 'RESET' });
  };

  const handleStart = () => {
    if (isLocked || !searchUrl) return;
    if (runRef.current) {
      runRef.current.abort();
      runRef.current = null;
    }
    setIsLocked(true);
    dispatch({ type: 'START' });
    const currentRun = ++runIdRef.current;
    runRef.current = runAdBuilderFlow({
      inputs: { searchUrl, product, goal, market, language },
      onPhase: (phase) => {
        if (runIdRef.current !== currentRun) return;
        if (phase === 'scraping') dispatch({ type: 'START' });
      },
      onScrapeItems: (items) => {
        if (runIdRef.current !== currentRun) return;
        dispatch({ type: 'SCRAPE_SUCCESS', payload: items });
      },
      onResults: (ads) => {
        if (runIdRef.current !== currentRun) return;
        dispatch({ type: 'AI_SUCCESS', payload: ads });
        setIsLocked(false);
        runRef.current = null;
      },
      onError: (message) => {
        if (runIdRef.current !== currentRun) return;
        dispatch({ type: 'SCRAPE_ERROR', payload: normalizeError(message) });
        setIsLocked(false);
        runRef.current = null;
      },
    });
  };

  const handleCancel = () => {
    runRef.current?.abort?.();
    runRef.current = null;
    setIsLocked(false);
    dispatch({ type: 'RESET' });
  };
  const handleRetry = () => {
    dispatch({ type: 'RESET' });
    handleStart();
  };

  const BuilderHeader = () => (
    <div className={`${UI.card} ${UI.cardHover} p-5 flex flex-wrap items-center justify-between gap-4`}>
      <div className="space-y-1">
        <p className={UI.meta}>Ad Builder</p>
        <h2 className={UI.h1}>Von Briefing zu fertigen Creatives</h2>
        <p className={UI.meta}>Scrape Library → Analysiere → Generiere Varianten.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={handleUseSampleData} iconName="Sparkles">
          Sample laden
        </Button>
        {(state.phase === 'scraping' || state.phase === 'analyzing') && (
          <Button variant="secondary" onClick={handleCancel} iconName="X">
            Abbrechen
          </Button>
        )}
        <Button variant="default" onClick={handleStart} iconName="Zap" disabled={isLocked || state.phase === 'scraping' || state.phase === 'analyzing' || !searchUrl}>
          {state.phase === 'scraping' || state.phase === 'analyzing' ? 'Läuft...' : 'Ads generieren'}
        </Button>
        <Button variant="secondary" onClick={handleResetDraft}>
          Draft zurücksetzen
        </Button>
      </div>
    </div>
  );

  const BuilderForm = () => (
    <div className={`${UI.card} ${UI.cardHover} p-5 space-y-4`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Brain size={16} />
        </div>
        <div>
          <p className={UI.meta}>Briefing</p>
          <p className="text-foreground font-semibold">Eingaben für den Flow</p>
        </div>
      </div>
      <StepBriefing
        searchUrl={searchUrl}
        setSearchUrl={setSearchUrl}
        product={product}
        setProduct={setProduct}
        goal={goal}
        setGoal={setGoal}
        market={market}
        setMarket={setMarket}
        language={language}
        setLanguage={setLanguage}
        onUseSample={handleUseSampleData}
      />
      <div className="space-y-2">
        <p className={UI.meta}>Fortschritt</p>
        <ProgressSteps phase={state.phase === 'briefing' ? 'scraping' : state.phase} />
        {state.error && <p className="text-sm text-muted-foreground">Fehler: {state.error}</p>}
      </div>
    </div>
  );

  const Workspace = () => (
    <div className={`${UI.card} ${UI.cardHover} p-5 space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={UI.meta}>Workspace</p>
          <h3 className={UI.h2}>Ergebnisse & Insights</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {['creatives', 'placements', 'ugc', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`rounded-full px-3 py-1 border text-sm ${
                selectedTab === tab ? 'bg-accent text-foreground border-border' : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {state.phase === 'briefing' && (
        <EmptyState
          title="Starte einen Run"
          description="Scrape die Ads Library, analysiere mit KI und erhalte sofort Varianten."
          actionLabel="Ads generieren"
          onAction={handleStart}
        />
      )}

      {state.phase === 'scraping' && (
        <StepMarketScan phase="scraping" scrapedAds={state.scrapedAds} />
      )}

      {state.phase === 'analyzing' && (
        <StepMarketScan phase="analyzing" scrapedAds={state.scrapedAds} />
      )}

      {state.phase === 'error' && (
        <EmptyState
          title="Fehler im Flow"
          description={state.error || 'Bitte Eingaben prüfen und erneut versuchen.'}
          actionLabel="Erneut versuchen"
          onAction={handleRetry}
        />
      )}

      {state.phase === 'results' && (
        <>
          <StepCreativeDNA tone={creativeTone} onChangeTone={setCreativeTone} />
          <StepResults
            ads={filteredAds.length ? filteredAds : sampleAds}
            userId={user?.id}
            briefing={{ product, goal, market, language }}
            creativeDNA={{ tone: creativeTone }}
          />
        </>
      )}

      {(state.phase === 'scraping' || state.phase === 'analyzing') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-card" />
          ))}
        </div>
      )}
    </div>
  );

const StatsBar = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className={`${UI.card} p-4`}>
      <p className={UI.meta}>Durchschnittliche Erstellung</p>
      <p className="text-2xl font-semibold text-foreground">15s</p>
      </div>
      <div className={`${UI.card} p-4`}>
        <p className={UI.meta}>CTR Lift</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold text-foreground">+340%</p>
          <TrendingUp size={16} className="text-muted-foreground" />
        </div>
      </div>
      <div className={`${UI.card} p-4`}>
        <p className={UI.meta}>ROAS</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold text-foreground">4.2x</p>
          <Clock size={16} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <PageShell title="Ad Builder" subtitle="Scrape. Analyse. Generiere.">
        <div className="space-y-6">
          <BuilderHeader />
          <StatsBar />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BuilderForm />
            <Workspace />
          </div>
        </div>
      </PageShell>
    </DashboardLayout>
  );
};

export default AdRubyAdBuilder;
