import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  ArrowRight,
  CheckCircle,
  Brain,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Sparkles,
  Loader2,
  ShieldCheck,
  BookmarkPlus
} from 'lucide-react';
import Header from '../public-landing-home/components/Header';
import { useAuth } from '../../contexts/AuthContext';

const playbooks = [
  {
    title: 'E-Commerce Scale',
    subtitle: 'Performance Marketing',
    budget: '€2.500/Monat',
    audience: 'Shopping-affine Millennials',
    kpi: '+340% ROAS',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Lead Gen High Intent',
    subtitle: 'Coaches & B2B Services',
    budget: '€900/Monat',
    audience: 'Entscheider 30-50',
    kpi: '€42 CPL',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'UGC/Retention Push',
    subtitle: 'Subscription / SaaS',
    budget: '€1.800/Monat',
    audience: 'Bestandskunden / Lookalikes',
    kpi: '+2.3% CTR',
    color: 'from-purple-500 to-fuchsia-500'
  }
];

const AdRubyAdStrategies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth?.() || {};

  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const adVariantId = searchParams.get('adVariantId') || null;
  const userId = user?.id || user?.user?.id || null;

  const handleStartFreeTrial = () => {
    navigate('/ad-ruby-registration');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  const loadStrategies = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({ userId });
      if (adVariantId) query.set('adVariantId', adVariantId);

      const res = await fetch(`/api/ad-strategies-get?${query.toString()}`);
      if (!res.ok) {
        setError('Strategien konnten nicht geladen werden.');
        return;
      }

      const data = await res.json();
      const list = data?.strategies || [];
      setStrategies(list);
      if (list.length > 0) setSelectedStrategy(list[0]);
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, adVariantId]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const highlights = useMemo(
    () => [
      { icon: Target, label: 'Budgetvorschläge', value: 'Smart Allocation' },
      { icon: Users, label: 'Audience Presets', value: 'High Intent' },
      { icon: TrendingUp, label: 'Skalierung', value: 'Roadmap' }
    ],
    []
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <motion.section
          className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-10 hero-grid overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(244,45,99,0.12),transparent_35%)]" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-card/60 border border-border/20 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Strategie Copilot
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" />
                Live
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-6">
                <motion.h1
                  variants={itemVariants}
                  className="text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.05] text-foreground"
                >
                  Erhalte eine <span className="text-primary">fertige Meta-Strategie</span> in Minuten – inkl.
                  Budget, Audience & Skalierungsplan.
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-muted-foreground leading-relaxed max-w-2xl"
                >
                  Beantworte wenige Fragen, wähle ein Playbook und lass die KI deine Budgetverteilung,
                  Zielgruppen-Empfehlungen und Skalierungs-Roadmap erzeugen. Mit Policy-Hinweisen und mobile-ready.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="w-full sm:w-auto bg-primary text-foreground px-6 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-accent transition-smooth flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain className="w-5 h-5" />
                    Kostenlose Strategieanalyse starten
                  </motion.button>
                  <motion.button
                    className="w-full sm:w-auto border border-border/20 text-foreground px-6 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-card/10 transition-smooth flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Demo ansehen
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-4 p-4 sm:p-5 glass-panel rounded-2xl"
                >
                  {highlights.map((h) => (
                    <div key={h.label} className="text-center">
                      <h.icon className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground uppercase tracking-[0.1em]">{h.label}</div>
                      <div className="text-sm font-semibold text-foreground">{h.value}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                className="glass-panel rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                      <Target className="text-foreground" size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preview</p>
                      <p className="text-base font-semibold text-foreground">Strategy Generator</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-card/60 text-xs text-muted-foreground">
                    Policy Safe
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-card/60 border border-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">Marktanalyse</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-muted-foreground text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Wettbewerb</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-card/20 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }} />
                          </div>
                          <span className="text-xs">Hoch</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Empf. Budget</p>
                        <span className="text-sm font-semibold text-foreground">€2.500/Monat</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">Audience Match</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Alter 25-45</span>
                        <span className="text-foreground">87% Match</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interessen: Fitness, Health</span>
                        <span className="text-foreground">92% Match</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kaufverhalten: Online-Shopper</span>
                        <span className="text-foreground">84% Match</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/60 border border-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">Performance-Prognose</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-foreground">
                      <div>
                        <div className="text-lg font-bold text-primary">+240%</div>
                        <div className="text-xs text-muted-foreground">ROAS</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">3.2%</div>
                        <div className="text-xs text-muted-foreground">CTR</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">€18</div>
                        <div className="text-xs text-muted-foreground">CPM</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-primary" />
                    Policy-Hinweise aktiv
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={14} className="text-primary" />
                    Auto-Generate
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Playbooks */}
        <section className="py-10 px-4 sm:px-6 lg:px-10">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.12em]">Playbooks</p>
                <h2 className="text-2xl font-semibold text-foreground">Starte mit einem Blueprint</h2>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg border border-border/20 text-foreground text-xs bg-card/60 hover:bg-card/20 transition-smooth">
                  Alle ansehen
                </button>
                <button className="px-3 py-2 rounded-lg border border-primary/40 text-primary text-xs bg-primary/10 hover:bg-primary/20 transition-smooth">
                  Fragen starten
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {playbooks.map((pb) => (
                <div
                  key={pb.title}
                  className="glass-panel rounded-xl p-4 hover:-translate-y-1 transition-spatial"
                >
                  <div className={`rounded-lg p-4 mb-3 text-foreground bg-gradient-to-r ${pb.color}`}>
                    <p className="text-xs opacity-80">{pb.subtitle}</p>
                    <h3 className="text-lg font-semibold">{pb.title}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 mb-3">
                    <p>Budget: {pb.budget}</p>
                    <p>Audience: {pb.audience}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">{pb.kpi}</span>
                    <button className="text-xs px-3 py-2 rounded-lg bg-card/20 text-foreground border border-border/20 hover:bg-card/30 transition-smooth">
                      Übernehmen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stored Strategies */}
        <motion.section
          className="py-12 px-4 sm:px-6 lg:px-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto glass-panel rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.12em]">Deine Strategien</p>
                <h3 className="text-xl font-semibold text-foreground">Gespeicherte Strategien & Details</h3>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg bg-primary text-foreground text-xs flex items-center gap-2">
                  <Sparkles size={14} />
                  Neue Strategie
                </button>
                <button className="px-3 py-2 rounded-lg bg-card/20 text-foreground text-xs flex items-center gap-2 border border-border/20">
                  <BookmarkPlus size={14} />
                  Als Briefing übernehmen
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl glass-panel p-4 lg:col-span-1">
                <h4 className="text-sm font-semibold mb-3 text-foreground">Gespeicherte Strategien</h4>

                {isLoading && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-card/20 animate-pulse" />
                    ))}
                  </div>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}

                <ul className="space-y-2 max-h-[360px] overflow-auto">
                  {strategies.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStrategy(s)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg border ${
                          selectedStrategy?.id === s.id
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/20 bg-card/60 text-muted-foreground hover:border-border/40'
                        }`}
                      >
                        <div className="font-semibold truncate">
                          {s.selected_strategy || 'Unbenannte Strategie'}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                        </div>
                      </button>
                    </li>
                  ))}

                  {!isLoading && strategies.length === 0 && !error && (
                    <p className="text-xs text-muted-foreground">
                      Noch keine Strategien gespeichert. Starte zuerst den Fragebogen.
                    </p>
                  )}
                </ul>
              </div>

              <div className="rounded-xl glass-panel p-6 lg:col-span-2">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-5 w-2/5 bg-card/20 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-card/20 rounded animate-pulse" />
                    <div className="h-24 bg-card/20 rounded animate-pulse" />
                  </div>
                ) : selectedStrategy ? (
                  <>
                    <h4 className="text-lg font-bold mb-2 text-foreground">
                      {selectedStrategy.selected_strategy || 'Strategie'}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Erstellt am{' '}
                      {selectedStrategy.created_at
                        ? new Date(selectedStrategy.created_at).toLocaleString()
                        : '—'}
                    </p>

                    <div className="space-y-4 text-sm text-muted-foreground">
                      <div>
                        <h5 className="text-sm font-semibold mb-1 text-foreground">Diagnose & Analyse</h5>
                        <pre className="text-xs bg-card/60 border border-border/20 rounded-lg p-3 overflow-auto text-muted-foreground">
                          {JSON.stringify(selectedStrategy.ai_analysis?.diagnosis || {}, null, 2)}
                        </pre>
                      </div>

                      {Array.isArray(selectedStrategy.ai_analysis?.implementation_recommendations) && (
                        <div>
                          <h5 className="text-sm font-semibold mb-1 text-foreground">Umsetzungsempfehlungen</h5>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {selectedStrategy.ai_analysis.implementation_recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(selectedStrategy.ai_analysis?.deep_dive_sections) && (
                        <div>
                          <h5 className="text-sm font-semibold mb-1 text-foreground">Deep-Dive Kapitel</h5>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {selectedStrategy.ai_analysis.deep_dive_sections.map((sec) => (
                              <li key={sec.section_id || sec.title}>{sec.title || sec.anchor || 'Abschnitt'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Wähle links eine gespeicherte Strategie aus.</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Examples */}
        <motion.section
          className="py-10 px-4 sm:px-6 lg:px-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Bewährte Strategiemodelle für jede Branche
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Unsere KI analysiert erfolgreiche Kampagnen und liefert maẞgeschneiderte Strategien – bereit zum
                Kopieren.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {playbooks.map((example) => (
                <motion.div
                  key={example.title}
                  variants={itemVariants}
                  className="glass-panel rounded-2xl p-0 overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${example.color} p-6 text-foreground`}>
                    <h3 className="text-xl font-bold mb-1">{example.title}</h3>
                    <div className="text-sm opacity-90">{example.subtitle}</div>
                  </div>
                  <div className="p-6 space-y-3 text-muted-foreground text-sm">
                    <div className="flex justify-between items-center">
                      <span>Budget</span>
                      <span className="font-semibold text-foreground">{example.budget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Zielgruppe</span>
                      <span className="font-semibold text-foreground text-right text-sm">{example.audience}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border/20">
                      <span>Erwartetes Ergebnis</span>
                      <span className="font-bold text-primary">{example.kpi}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="py-16 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-primary to-accent text-foreground"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/20 border border-border/20 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles size={14} />
              Strategy Copilot
            </div>
            <h3 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Teste die KI-Strategieanalyse kostenlos
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vollständige Kampagnenstrategie inkl. Budgetempfehlungen, Zielgruppen-Insights, Performance-Prognosen
              und Compliance-Hinweisen – in Minuten.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleStartFreeTrial}
                className="bg-card text-foreground px-8 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-secondary/60 transition-smooth"
              >
                Kostenlos starten
              </button>
              <button className="border border-border/30 text-foreground px-8 py-3 min-h-[44px] rounded-xl font-semibold hover:bg-card/20 transition-smooth flex items-center gap-2 justify-center">
                <PlayCircle size={18} />
                Demo ansehen
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AdRubyAdStrategies;
