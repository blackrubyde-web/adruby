import React, { useMemo, useReducer, useState } from 'react';
import { Sparkles, Zap, Brain, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
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
  const [searchUrl, setSearchUrl] = useState('');
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('');
  const [market, setMarket] = useState('');
  const [language, setLanguage] = useState('de');
  const [selectedTab, setSelectedTab] = useState('creatives');
  const [creativeTone, setCreativeTone] = useState('balanced');

  const filteredAds = useMemo(() => state.generatedAds || [], [state.generatedAds]);

  const handleUseSampleData = () => {
    dispatch({ type: 'AI_SUCCESS', payload: sampleAds });
  };

  const handleStart = async () => {
    dispatch({ type: 'START' });
    try {
      const scrapeRes = await fetch('/api/ad-research-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchUrl,
          maxAds: 30
        })
      });
      if (!scrapeRes.ok) throw new Error(`Scraping failed with status ${scrapeRes.status}`);
      const scrapeData = await scrapeRes.json();
      const items = Array.isArray(scrapeData.items) ? scrapeData.items : [];
      if (!items.length) throw new Error('Es konnten keine Ads aus der Facebook Ads Library geladen werden. Bitte URL oder Filter anpassen.');
      dispatch({ type: 'SCRAPE_SUCCESS', payload: items });

      const aiRes = await fetch('/api/ai-ad-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userBriefing: { product, goal, market, language },
          scrapedAds: items
        })
      });
      if (!aiRes.ok) throw new Error(`AI analysis failed with status ${aiRes.status}`);
      const aiData = await aiRes.json();
      const finalAds = Array.isArray(aiData.ads) ? aiData.ads : Array.isArray(aiData.results) ? aiData.results : [];
      if (!finalAds.length) throw new Error('Die KI konnte aus den Daten keine Ads generieren. Bitte Eingaben prüfen.');
      dispatch({ type: 'AI_SUCCESS', payload: finalAds });
    } catch (err) {
      dispatch({ type: 'SCRAPE_ERROR', payload: err.message || 'Unbekannter Fehler' });
    }
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
        <Button variant="default" onClick={handleStart} iconName="Zap" disabled={state.phase === 'scraping' || state.phase === 'analyzing'}>
          {state.phase === 'scraping' || state.phase === 'analyzing' ? 'Läuft...' : 'Ads generieren'}
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
          onAction={handleStart}
        />
      )}

      {state.phase === 'results' && (
        <>
          <StepCreativeDNA tone={creativeTone} onChangeTone={setCreativeTone} />
          <StepResults ads={filteredAds.length ? filteredAds : sampleAds} />
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
