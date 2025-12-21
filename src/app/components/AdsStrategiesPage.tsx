import { Target, Search, Filter, Sparkles, Brain, DollarSign, Users, Zap, CheckCircle2, ArrowRight, Play, Pause, Copy, Trash2, Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StrategyViewModal } from './StrategyViewModal';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';

type GeneratedStrategy = {
  name: string;
  goal?: string;
  confidence: number;
  recommendations: string[];
  performance: {
    expectedCTR: number;
    expectedROAS: number;
    expectedCPA?: number;
  };
};

interface SavedAd {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  productName: string;
  targetAudience: string;
  objective: string;
  budget: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  strategy?: GeneratedStrategy;
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    roas: number;
    spent: number;
  };
  rawInputs?: Record<string, unknown> | null;
  rawOutputs?: Record<string, unknown> | null;
  blueprintTitle?: string | null;
}

interface StrategyQuestion {
  id: string;
  category: string;
  step: number;
  question: string;
  description: string;
  type: 'select';
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

export function AdsStrategiesPage() {
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  type StatusFilter = 'all' | 'active' | 'paused' | 'draft';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showStrategyViewModal, setShowStrategyViewModal] = useState(false);
  const [selectedAdForStrategy, setSelectedAdForStrategy] = useState<SavedAd | null>(null);
  const [currentQuestionStep, setCurrentQuestionStep] = useState(1);
  const [strategyAnswers, setStrategyAnswers] = useState<Record<string, string>>({});
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);

  // Strategy Questions (from your service)
  const strategyQuestions: StrategyQuestion[] = [
    {
      id: 'goal',
      category: 'Ziele & Ausrichtung',
      step: 1,
      question: 'Welches Hauptziel verfolgst du mit dieser Anzeige?',
      description: 'Definiere das primäre Geschäftsziel für diese Kampagne',
      type: 'select',
      options: [
        { value: 'leads', label: 'Lead-Generierung', description: 'Kontaktdaten und Interessenten sammeln für zukünftige Verkäufe' },
        { value: 'sales', label: 'Direktverkäufe', description: 'Sofortige Käufe und Transaktionen über die Anzeige generieren' },
        { value: 'awareness', label: 'Markenbekanntheit', description: 'Reichweite und Sichtbarkeit der Marke erhöhen' },
        { value: 'traffic', label: 'Website-Traffic', description: 'Qualifizierten Traffic auf die Website lenken' },
        { value: 'app', label: 'App-Downloads', description: 'Mobile App Installation und Nutzung fördern' },
        { value: 'engagement', label: 'Community-Engagement', description: 'Interaktion, Likes, Comments und Follower aufbauen' }
      ]
    },
    {
      id: 'budget_scaling',
      category: 'Budget & Skalierung',
      step: 2,
      question: 'Wie planst du dein Werbebudget und die Skalierung?',
      description: 'Budget-Strategie und Wachstumspläne definieren für optimale Performance',
      type: 'select',
      options: [
        { value: '50-150-conservative', label: '50-150 EUR/Tag - Konservativ', description: 'Langsame, sichere Skalierung mit geringem Risiko' },
        { value: '150-300-moderate', label: '150-300 EUR/Tag - Moderat', description: 'Ausgewogenes Wachstum mit mittlerem Risiko' },
        { value: '300-500-aggressive', label: '300-500 EUR/Tag - Aggressiv', description: 'Schnelle Skalierung bei guter Performance' },
        { value: '500plus-enterprise', label: 'Über 500 EUR/Tag - Enterprise', description: 'Maximale Reichweite und Dominanz' }
      ]
    },
    {
      id: 'performance_goals',
      category: 'Performance & KPIs',
      step: 3,
      question: 'Welche Kennzahlen sind für dich am wichtigsten?',
      description: 'Priorisiere die Metriken für deinen Erfolg',
      type: 'select',
      options: [
        { value: 'roas-focused', label: 'ROAS (Return on Ad Spend)', description: 'Umsatz pro investiertem Euro maximieren' },
        { value: 'cpa-focused', label: 'CPA (Cost per Acquisition)', description: 'Kosten pro Conversion minimieren' },
        { value: 'ctr-focused', label: 'CTR (Click-Through Rate)', description: 'Engagement und Relevanz steigern' },
        { value: 'reach-focused', label: 'Reichweite & Impressions', description: 'Maximale Sichtbarkeit erreichen' },
        { value: 'quality-focused', label: 'Lead-Qualität', description: 'Hochwertige, kaufbereite Leads generieren' }
      ]
    },
    {
      id: 'target_audience',
      category: 'Zielgruppen & Targeting',
      step: 4,
      question: 'Wie möchtest du deine Zielgruppe ansprechen?',
      description: 'Targeting-Strategie und Zielgruppenfokus',
      type: 'select',
      options: [
        { value: 'broad-expansion', label: 'Breite Zielgruppe', description: 'Neue Märkte erschließen' },
        { value: 'lookalike-similar', label: 'Lookalike Audiences', description: 'Ähnliche Kunden finden' },
        { value: 'retargeting-warm', label: 'Retargeting', description: 'Warme Zielgruppen ansprechen' },
        { value: 'interest-specific', label: 'Interesse-basiert', description: 'Spezifische Interessen nutzen' },
        { value: 'demographic-precise', label: 'Demografisch präzise', description: 'Exakte Zielgruppen-Ansprache' }
      ]
    },
    {
      id: 'creative_strategy',
      category: 'Kreativ & Content',
      step: 5,
      question: 'Welche Content-Strategie passt zu deiner Marke?',
      description: 'Art der Werbemittel wählen',
      type: 'select',
      options: [
        { value: 'video-storytelling', label: 'Video & Storytelling', description: 'Emotionale Videos und Geschichten' },
        { value: 'ugc-authentic', label: 'User Generated Content', description: 'Authentische Kundenerfahrungen' },
        { value: 'product-showcase', label: 'Produkt-Showcase', description: 'Direkte Produktpräsentation' },
        { value: 'educational-howto', label: 'Educational Content', description: 'Tutorials und How-Tos' },
        { value: 'testimonial-social', label: 'Testimonials & Social Proof', description: 'Kundenbewertungen nutzen' }
      ]
    },
    {
      id: 'timeline_commitment',
      category: 'Zeitplanung & Engagement',
      step: 6,
      question: 'Wie ist deine zeitliche Planung?',
      description: 'Kampagnendauer und Management-Intensität',
      type: 'select',
      options: [
        { value: 'sprint-1week', label: '1-2 Wochen Sprint', description: 'Kurze, intensive Kampagne' },
        { value: 'campaign-1month', label: '1 Monat Kampagne', description: 'Mittelfristige Zielerreichung' },
        { value: 'growth-3months', label: '3 Monate Wachstum', description: 'Nachhaltiges Wachstum' },
        { value: 'ongoing-always', label: 'Dauerhaft aktiv', description: 'Kontinuierliche Optimierung' },
        { value: 'seasonal-specific', label: 'Saisonal/Event-basiert', description: 'Bestimmte Zeiträume nutzen' }
      ]
    },
    {
      id: 'risk_innovation',
      category: 'Risiko & Innovation',
      step: 7,
      question: 'Wie ist deine Risikobereitschaft?',
      description: 'Experimentierfreude und Risikotoleranz',
      type: 'select',
      options: [
        { value: 'conservative-safe', label: 'Konservativ & Sicher', description: 'Bewährte Strategien mit geringem Risiko' },
        { value: 'balanced-steady', label: 'Ausgewogen & Stetig', description: 'Kontrolliertes Wachstum' },
        { value: 'aggressive-fast', label: 'Aggressiv & Schnell', description: 'Schnelle Skalierung' },
        { value: 'innovative-experimental', label: 'Innovativ & Experimentell', description: 'Neue Ansätze testen' },
        { value: 'data-driven-analytical', label: 'Datengetrieben & Analytisch', description: 'Datenbasierte Entscheidungen' }
      ]
    }
  ];

  type CreativeOutput = {
    schema_version?: string;
    brief?: {
      product?: { name?: string };
      audience?: { summary?: string };
      goal?: string;
    };
    creatives?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }>;
    variants?: Array<{
      copy?: { hook?: string; primary_text?: string; cta?: string };
    }>;
  };

  type CreativeRow = {
    id: string;
    outputs?: Record<string, unknown> | null;
    inputs?: Record<string, unknown> | null;
    created_at?: string | null;
    saved?: boolean | null;
    strategy_blueprints?: { title?: string | null } | Array<{ title?: string | null }> | null;
  };

  const mapCreativeRow = useCallback((row: CreativeRow): SavedAd | null => {
    if (!row) return null;
    const inputs = row.inputs || null;
    const hasBrief = Boolean((inputs as { brief?: unknown } | null)?.brief);
    const output = row.outputs || hasBrief ? (row.outputs ?? { brief: (inputs as { brief?: unknown } | null)?.brief, creatives: [] }) : null;
    const brief = (output as CreativeOutput | null)?.brief || (inputs as { brief?: CreativeOutput['brief'] } | null)?.brief || null;
    const creative =
      Array.isArray((output as CreativeOutput | null)?.creatives) && (output as CreativeOutput).creatives?.length
        ? (output as CreativeOutput).creatives?.[0]
        : Array.isArray((output as CreativeOutput | null)?.variants)
          ? (output as CreativeOutput).variants?.[0]
          : null;
    const headline =
      creative?.copy?.hook ||
      (inputs as { headline?: string; title?: string } | null)?.headline ||
      (inputs as { title?: string } | null)?.title ||
      'Untitled Ad';
    const description =
      creative?.copy?.primary_text ||
      (inputs as { description?: string } | null)?.description ||
      '';
    const cta =
      creative?.copy?.cta ||
      (inputs as { cta?: string } | null)?.cta ||
      'Learn More';
    const productName = brief?.product?.name || (inputs as { productName?: string; brandName?: string } | null)?.productName || (inputs as { brandName?: string } | null)?.brandName || 'Produkt';
    const targetAudience = brief?.audience?.summary || (inputs as { targetAudience?: string } | null)?.targetAudience || 'Zielgruppe';
    const objective = brief?.goal || (inputs as { objective?: string } | null)?.objective || 'sales';
    const lifecycle = (inputs as { lifecycle?: { status?: SavedAd['status'] } } | null)?.lifecycle;
    const status = lifecycle?.status || (row.saved ? 'active' : 'draft');
    const strategy = (inputs as { ai_strategy?: GeneratedStrategy } | null)?.ai_strategy ?? undefined;
    const blueprintTitle = Array.isArray(row.strategy_blueprints)
      ? row.strategy_blueprints[0]?.title ?? null
      : row.strategy_blueprints?.title ?? null;

    return {
      id: row.id,
      name: headline,
      headline,
      description,
      cta,
      productName,
      targetAudience,
      objective,
      budget: (inputs as { budget?: string | number } | null)?.budget != null
        ? String((inputs as { budget?: string | number }).budget)
        : '—',
      status,
      createdAt: row.created_at || new Date().toISOString(),
      strategy,
      rawInputs: inputs || null,
      rawOutputs: row.outputs || null,
      blueprintTitle,
    };
  }, []);

  const loadAds = useCallback(async () => {
    setIsLoadingAds(true);
    setAdsError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setSavedAds([]);
        return;
      }

      const { data, error } = await supabase
        .from('generated_creatives')
        .select(
          'id,inputs,outputs,created_at,saved,blueprint_id,strategy_blueprints(id,title,category)'
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const mapped = (data || [])
        .map(mapCreativeRow)
        .filter((item): item is SavedAd => Boolean(item));

      setSavedAds(mapped);
    } catch (err: unknown) {
      setAdsError(err instanceof Error ? err.message : 'Failed to load ads');
      setSavedAds([]);
    } finally {
      setIsLoadingAds(false);
    }
  }, [mapCreativeRow]);

  useEffect(() => {
    loadAds().catch(() => undefined);
  }, [loadAds]);

  // Filter ads
  const filteredAds = savedAds.filter(ad => {
    const matchesSearch = 
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    totalAds: savedAds.length,
    activeAds: savedAds.filter(a => a.status === 'active').length,
    withStrategy: savedAds.filter(a => a.strategy).length,
    avgRoas: savedAds.filter(a => a.strategy).reduce((sum, a) => sum + (a.strategy?.performance.expectedROAS || 0), 0) / (savedAds.filter(a => a.strategy).length || 1)
  };

  // Open strategy modal
  const handleCreateStrategy = (ad: SavedAd) => {
    setSelectedAdForStrategy(ad);
    setShowStrategyModal(true);
    setCurrentQuestionStep(1);
    setStrategyAnswers({});
    setGeneratedStrategy(null);
  };

  // Answer question
  const handleAnswerQuestion = (questionId: string, value: string) => {
    setStrategyAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentQuestionStep < 7) {
      setCurrentQuestionStep(prev => prev + 1);
    } else {
      generateStrategy();
    }
  };

  // Generate AI Strategy
  const generateStrategy = () => {
    setIsGeneratingStrategy(true);

    // Simulate AI generation
    setTimeout(() => {
      const strategy = {
        name: 'Performance Boost Pro',
        goal: strategyAnswers.goal || 'Conversions',
        confidence: 94,
        recommendations: [
          'Nutze Video-Creatives für 68% höhere CTR',
          'Implementiere Retargeting für 3.2x ROAS',
          'Schalte zwischen 18-21 Uhr für optimale Performance',
          'Teste 3 Ad-Varianten mit Auto-Optimization'
        ],
        performance: {
          expectedCTR: 3.8,
          expectedROAS: 6.2,
          expectedCPA: 12.5
        },
        targeting: {
          age: '25-45',
          interests: ['E-Commerce', 'Online Shopping', 'Tech'],
          placements: ['Facebook Feed', 'Instagram Stories', 'Reels']
        },
        budget: {
          daily: '€150',
          monthly: '€4,500',
          allocation: { testing: '30%', scaling: '70%' }
        }
      };

      setGeneratedStrategy(strategy);
      setIsGeneratingStrategy(false);

      // Save strategy to ad
      if (selectedAdForStrategy) {
        const updatedAds = savedAds.map(ad =>
          ad.id === selectedAdForStrategy.id
            ? { ...ad, strategy }
            : ad
        );
        setSavedAds(updatedAds);

        if (selectedAdForStrategy.rawInputs) {
          supabase
            .from('generated_creatives')
            .update({
              inputs: {
                ...selectedAdForStrategy.rawInputs,
                ai_strategy: strategy,
              },
            })
            .eq('id', selectedAdForStrategy.id)
            .then(({ error }) => {
              if (error) {
                console.warn('Failed to persist strategy:', error.message);
              }
            });
        }
      }
    }, 4000);
  };

  // Actions
  const handleDuplicate = (ad: SavedAd) => {
    const newAd: SavedAd = {
      ...ad,
      id: Date.now().toString(),
      name: `${ad.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) {
          throw new Error('Bitte zuerst anmelden.');
        }

        const { data, error } = await supabase
          .from('generated_creatives')
          .insert({
            user_id: userId,
            inputs: newAd.rawInputs || null,
            outputs: newAd.rawOutputs || null,
            saved: false,
          })
          .select('id,inputs,outputs,created_at,saved,strategy_blueprints(id,title,category)')
          .single();

        if (error) throw error;
        const mapped = mapCreativeRow(data);
        if (mapped) {
          setSavedAds((prev) => [mapped, ...prev]);
        }
        toast.success('Ad duplicated successfully');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Duplicate failed');
      }
    })();
  };

  const handleDelete = (adId: string) => {
    (async () => {
      try {
        const { error } = await supabase.from('generated_creatives').delete().eq('id', adId);
        if (error) throw error;
        const updatedAds = savedAds.filter(a => a.id !== adId);
        setSavedAds(updatedAds);
        toast.success('Ad deleted');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Delete failed');
      }
    })();
  };

  const handleStatusChange = (adId: string, newStatus: 'active' | 'paused') => {
    const updatedAds = savedAds.map(ad => 
      ad.id === adId ? { ...ad, status: newStatus } : ad
    );
    setSavedAds(updatedAds);
    const selected = updatedAds.find(ad => ad.id === adId);
    if (selected) {
      supabase
        .from('generated_creatives')
        .update({
          inputs: {
            ...(selected.rawInputs || {}),
            lifecycle: {
              ...(selected.rawInputs?.lifecycle || {}),
              status: newStatus,
            },
          },
        })
        .eq('id', adId)
        .then(({ error }) => {
          if (error) console.warn('Failed to persist status', error.message);
        });
    }
    toast.success(`Ad ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const currentQuestion = strategyQuestions.find(q => q.step === currentQuestionStep);

  return (
    <PageShell>
      <HeroHeader
        title="Saved Ads & Strategien"
        subtitle="Verwalte deine Ads und erstelle AI-powered Performance-Strategien"
      />

      {adsError && (
        <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-600">
          {adsError}
        </Card>
      )}

      {isLoadingAds && (
        <Card className="p-4 text-sm text-muted-foreground">Lade gespeicherte Ads…</Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.totalAds}</div>
          <div className="text-sm text-muted-foreground">Total Ads</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.activeAds}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.withStrategy}</div>
          <div className="text-sm text-muted-foreground">With Strategy</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.avgRoas.toFixed(1)}x</div>
          <div className="text-sm text-muted-foreground">Avg. ROAS</div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ads Grid */}
      {filteredAds.length === 0 ? (
        <Card className="p-16 text-center">
          <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">Keine Ads gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Erstelle deine erste Ad im Ad Builder!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAds.map((ad) => (
            <Card
              key={ad.id}
              className="hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
                {/* Left: Ad Content */}
                <div className="p-6 lg:border-r border-border/30">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{ad.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.status === 'active' ? 'bg-green-500/20 text-green-500' :
                          ad.status === 'paused' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {ad.status}
                        </span>
                        {ad.strategy && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-500 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            AI Strategie
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ad.productName}
                        {ad.blueprintTitle ? ` · ${ad.blueprintTitle}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Ad Preview */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-muted/10 to-transparent border border-border/20 mb-4">
                    <div className="text-lg font-bold text-foreground mb-3">{ad.headline}</div>
                    <div className="text-foreground/80 mb-4 line-clamp-2">{ad.description}</div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl font-semibold">
                      {ad.cta}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Objective</span>
                      </div>
                      <div className="text-foreground font-medium capitalize">{ad.objective}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/5">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Budget</span>
                      </div>
                      <div className="text-foreground font-medium">{ad.budget}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Audience</span>
                      </div>
                      <div className="text-foreground font-medium text-sm">{ad.targetAudience}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!ad.strategy ? (
                      <button
                        onClick={() => handleCreateStrategy(ad)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Strategie erstellen
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCreateStrategy(ad)}
                        className="flex-1 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-500 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                      >
                        <Brain className="w-4 h-4" />
                        Strategie bearbeiten
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      {ad.status === 'active' ? (
                        <button onClick={() => handleStatusChange(ad.id, 'paused')} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                          <Pause className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </button>
                      ) : ad.status === 'paused' ? (
                        <button onClick={() => handleStatusChange(ad.id, 'active')} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                          <Play className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </button>
                      ) : null}
                      <button onClick={() => handleDuplicate(ad)} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Strategy/Performance */}
                <div className="p-6 bg-gradient-to-br from-muted/5 to-transparent">
                  {ad.strategy ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <h4 className="text-foreground font-semibold">{ad.strategy.name}</h4>
                      </div>

                      {/* Confidence */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">AI Confidence</span>
                          <span className="text-lg font-bold text-purple-500">{ad.strategy.confidence}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${ad.strategy.confidence}%` }} />
                        </div>
                      </div>

                      {/* Performance Predictions */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="text-xs text-green-500 mb-1">CTR</div>
                          <div className="text-foreground font-bold">{ad.strategy.performance.expectedCTR}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-xs text-blue-500 mb-1">ROAS</div>
                          <div className="text-foreground font-bold">{ad.strategy.performance.expectedROAS}x</div>
                        </div>
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <div className="text-xs text-orange-500 mb-1">CPA</div>
                          <div className="text-foreground font-bold">€{ad.strategy.performance.expectedCPA}</div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          Empfehlungen
                        </h5>
                        <div className="space-y-1.5">
                          {ad.strategy.recommendations.slice(0, 3).map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* View Strategy Button */}
                      <button
                        onClick={() => {
                          setSelectedAdForStrategy(ad);
                          setGeneratedStrategy(ad.strategy ?? null);
                          setShowStrategyViewModal(true);
                        }}
                        className="w-full px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-500 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Strategie anzeigen
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-foreground font-semibold mb-2">Keine Strategie</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Erstelle eine AI-Strategie für optimale Performance
                      </p>
                      <button
                        onClick={() => handleCreateStrategy(ad)}
                        className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        Jetzt erstellen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Strategy Modal */}
      {showStrategyModal && selectedAdForStrategy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {!isGeneratingStrategy && !generatedStrategy ? (
              <>
                {/* Question Header */}
                <div className="p-6 border-b border-border/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">AI Strategie Wizard</h2>
                      <p className="text-muted-foreground">Schritt {currentQuestionStep} von 7</p>
                    </div>
                    <button
                      onClick={() => setShowStrategyModal(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                      style={{ width: `${(currentQuestionStep / 7) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                  {currentQuestion && (
                    <div>
                      <div className="mb-6">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                          {currentQuestion.category}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{currentQuestion.question}</h3>
                        <p className="text-muted-foreground">{currentQuestion.description}</p>
                      </div>

                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleAnswerQuestion(currentQuestion.id, option.value)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                              strategyAnswers[currentQuestion.id] === option.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border/50 hover:border-primary/50 bg-card/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-foreground mb-1">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                              {strategyAnswers[currentQuestion.id] === option.value && (
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-border/30 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQuestionStep(prev => Math.max(1, prev - 1))}
                    disabled={currentQuestionStep === 1}
                    className="px-6 py-2.5 border border-border/50 rounded-xl text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={!strategyAnswers[currentQuestion?.id || '']}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {currentQuestionStep === 7 ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Strategie generieren
                      </>
                    ) : (
                      <>
                        Weiter
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : isGeneratingStrategy ? (
              // Loading State
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <Brain className="w-10 h-10 text-primary absolute inset-0 m-auto" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">AI analysiert deine Antworten...</h3>
                <p className="text-muted-foreground mb-6">
                  Erstelle perfekte Performance-Strategie basierend auf deinen Angaben
                </p>
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Analysiere Zielgruppe und Objectives...
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200" />
                    Optimiere Budget-Allokation...
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400" />
                    Generiere Targeting-Strategie...
                  </div>
                </div>
              </div>
            ) : generatedStrategy && (
              // Strategy Result
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Strategie erfolgreich erstellt!</h3>
                  <p className="text-muted-foreground">Deine personalisierte Performance-Strategie ist bereit</p>
                </div>

                {/* Strategy Overview */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 mb-6">
                  <h4 className="text-xl font-bold text-foreground mb-4">{generatedStrategy.name}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                      <div className="text-2xl font-bold text-primary">{generatedStrategy.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Expected ROAS</div>
                      <div className="text-2xl font-bold text-foreground">{generatedStrategy.performance.expectedROAS}x</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Expected CTR</div>
                      <div className="text-2xl font-bold text-foreground">{generatedStrategy.performance.expectedCTR}%</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-6">
                  <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Top Empfehlungen
                  </h5>
                  <div className="space-y-2">
                    {generatedStrategy.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/5">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowStrategyModal(false);
                    toast.success('Strategie gespeichert!');
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 font-semibold"
                >
                  Strategie übernehmen
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategy View Modal */}
      {showStrategyViewModal && selectedAdForStrategy && generatedStrategy && (
        <StrategyViewModal
          strategy={generatedStrategy}
          ad={selectedAdForStrategy}
          onClose={() => setShowStrategyViewModal(false)}
        />
      )}
    </PageShell>
  );
}
