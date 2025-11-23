import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, CheckCircle, Brain, Target, BarChart3, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const AdRubyAdStrategies = () => {
  const navigate = useNavigate();

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

  const strategyFeatures = [
    {
      icon: Target,
      title: "Budgetvorschläge",
      description: "Optimale Budget-Allokation basierend auf Zielgruppe, Wettbewerb und saisonalen Trends."
    },
    {
      icon: Users,
      title: "Zielgruppenempfehlungen", 
      description: "Präzise Audience-Definitionen mit demografischen und psychografischen Insights."
    },
    {
      icon: TrendingUp,
      title: "Skalierungsansätze",
      description: "Datengesteuerte Strategien für nachhaltiges Kampagnen-Wachstum und Performance-Optimierung."
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "KI-Strategie-Planer spart Agenturen Stunden",
      description: "Automatisierte Strategieerstellung reduziert manuelle Planungszeit von Tagen auf Minuten.",
      metric: "85% Zeitersparnis"
    },
    {
      icon: BarChart3,
      title: "Erhöht ROAS & Kampagnenkonsistenz",
      description: "Bewährte Strategiemuster führen zu konsistent höheren Returns und reduzierten Streuverlusten.",
      metric: "+240% ROAS"
    },
    {
      icon: DollarSign,
      title: "Ideal für E-Commerce & Coaches",
      description: "Speziell optimierte Strategien für Performance-Marketing und digitale Produktverkäufe.",
      metric: "90% Erfolgsrate"
    }
  ];

  const strategyExamples = [
    {
      title: "E-Commerce Skalierung",
      type: "Performance Marketing",
      budget: "€2.500/Monat",
      audience: "Shopping-affine Millennials",
      kpi: "+340% ROAS",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Coach/Beratung Akquise", 
      type: "Lead Generation",
      budget: "€800/Monat",
      audience: "Unternehmer 30-50 Jahre",
      kpi: "€45 Cost per Lead",
      color: "from-green-500 to-green-600"
    },
    {
      title: "B2B Software Launch",
      type: "Brand Awareness",
      budget: "€5.000/Monat", 
      audience: "IT-Entscheider",
      kpi: "2.8% CTR",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000]">
        
        {/* Breadcrumb Navigation */}
        <motion.div
          className="pt-20 pb-4 px-4 bg-white border-b border-[#e0e0e0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-6xl mx-auto">
            <nav className="text-sm text-[#666]">
              <span onClick={() => navigate('/')} className="cursor-pointer hover:text-[#C80000] transition-colors">Home</span>
              <span className="mx-2">/</span>
              <span onClick={() => navigate('/services')} className="cursor-pointer hover:text-[#C80000] transition-colors">Features</span>
              <span className="mx-2">/</span>
              <span className="text-[#C80000] font-medium">Ad Strategien</span>
            </nav>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.section
          className="pt-16 pb-20 px-4 bg-gradient-to-br from-[#FAFAFA] via-white to-[#FAFAFA]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Content */}
              <div className="text-left">
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 text-[#000000]"
                >
                  Deine perfekte{' '}
                  <span className="text-[#C80000]">Ad-Strategie</span>{' '}
                  – automatisch analysiert & generiert
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl text-[#333333] leading-relaxed mb-8 max-w-lg"
                >
                  AdRuby erstellt komplette Kampagnenstrategien auf Basis realer Daten. 
                  Von Budgetoptimierung bis Zielgruppenanalyse – alles automatisch.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="bg-[#C80000] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#a50000] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain className="w-5 h-5" />
                    Teste die KI-Strategieanalyse kostenlos
                  </motion.button>
                  
                  <motion.button
                    className="border border-[#C80000] text-[#C80000] px-8 py-4 rounded-lg font-medium hover:bg-[#C80000] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Strategie-Demo ansehen
                  </motion.button>
                </motion.div>

                {/* Strategy Highlights */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-4 p-6 bg-white rounded-xl border border-[#e0e0e0] shadow-sm"
                >
                  {strategyFeatures?.map((feature, index) => (
                    <div key={index} className="text-center">
                      <feature.icon className="w-6 h-6 text-[#C80000] mx-auto mb-2" />
                      <div className="text-xs font-medium text-[#000000] mb-1">{feature?.title}</div>
                      <div className="text-xs text-[#666] leading-tight">{feature?.description?.substring(0, 40)}...</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right Content - Strategy Dashboard Preview */}
              <div className="relative">
                <motion.div
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Main Strategy Dashboard */}
                  <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-2xl p-8 relative overflow-hidden">
                    
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C80000] rounded-lg flex items-center justify-center">
                          <Target className="text-white" size={16} />
                        </div>
                        <span className="font-semibold text-[#000000]">Strategy Generator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#ff5f56] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#ffbd2e] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#27ca3f] rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Strategy Analysis Display */}
                    <div className="space-y-4 mb-6">
                      
                      {/* Market Analysis */}
                      <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#e0e0e0]">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="text-[#C80000]" size={16} />
                          <span className="text-sm font-medium text-[#000000]">Marktanalyse</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-[#666] mb-1">Wettbewerbsintensität</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-[#e0e0e0] rounded-full h-2">
                                <div className="bg-[#C80000] h-2 rounded-full" style={{ width: '75%' }}></div>
                              </div>
                              <span className="text-xs font-medium">Hoch</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[#666] mb-1">Empfohlenes Budget</div>
                            <div className="text-sm font-bold text-[#C80000]">€2.500/Monat</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Audience Insights */}
                      <div className="bg-gradient-to-r from-[#C80000]/5 to-[#C80000]/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="text-[#C80000]" size={16} />
                          <span className="text-sm font-medium text-[#C80000]">Optimale Zielgruppe</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#666]">Alter: 25-45 Jahre</span>
                            <span className="text-xs font-medium text-[#000000]">87% Match</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#666]">Interesse: Fitness, Gesundheit</span>
                            <span className="text-xs font-medium text-[#000000]">92% Match</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#666]">Kaufverhalten: Online-Shopper</span>
                            <span className="text-xs font-medium text-[#000000]">84% Match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Prediction */}
                    <div className="bg-white border border-[#C80000]/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-[#C80000]" size={16} />
                        <span className="text-sm font-medium text-[#000000]">Performance-Prognose</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-[#C80000]">+240%</div>
                          <div className="text-xs text-[#666]">ROAS</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#C80000]">3.2%</div>
                          <div className="text-xs text-[#666]">CTR</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#C80000]">€18</div>
                          <div className="text-xs text-[#666]">CPM</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Strategy Cards */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-[#C80000] text-white p-3 rounded-xl shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain size={16} />
                    <div className="text-xs mt-1">KI-Analyse</div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white border border-[#e0e0e0] p-3 rounded-xl shadow-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-xs text-[#666] mb-1">Neue Strategie</div>
                    <div className="text-sm font-bold text-[#C80000]">E-Commerce Boost</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Strategy Examples Section */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                Bewährte{' '}
                <span className="text-[#C80000]">Strategiemodelle</span>{' '}
                für jede Branche
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                Unsere KI analysiert erfolgreiche Kampagnen und erstellt maßgeschneiderte 
                Strategien für verschiedene Geschäftsmodelle und Zielgruppen.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {strategyExamples?.map((example, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className={`bg-gradient-to-r ${example?.color} p-6 text-white`}>
                    <h3 className="text-xl font-bold mb-2">{example?.title}</h3>
                    <div className="text-sm opacity-90">{example?.type}</div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Budget</span>
                      <span className="font-semibold text-[#000000]">{example?.budget}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Zielgruppe</span>
                      <span className="font-semibold text-[#000000] text-right text-sm">{example?.audience}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-[#e0e0e0]">
                      <span className="text-sm text-[#666]">Erwartetes Ergebnis</span>
                      <span className="font-bold text-[#C80000]">{example?.kpi}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Interactive Strategy Builder Preview */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#C80000]/5 to-[#C80000]/10 rounded-2xl p-8 border border-[#C80000]/20"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#000000] mb-3">
                  Interaktiver Strategie-Generator
                </h3>
                <p className="text-[#666]">
                  Beantworte 3 einfache Fragen und erhalte eine maßgeschneiderte Kampagnenstrategie
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 text-center">
                  <DollarSign className="w-12 h-12 text-[#C80000] mx-auto mb-4" />
                  <h4 className="font-bold text-[#000000] mb-2">Budget-Optimierung</h4>
                  <p className="text-sm text-[#666]">Automatische Verteilung auf die profitabelsten Kanäle</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center">
                  <Users className="w-12 h-12 text-[#C80000] mx-auto mb-4" />
                  <h4 className="font-bold text-[#000000] mb-2">Zielgruppen-Analyse</h4>
                  <p className="text-sm text-[#666]">Präzise Audience-Definition mit Lookalike-Empfehlungen</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-[#C80000] mx-auto mb-4" />
                  <h4 className="font-bold text-[#000000] mb-2">Skalierungs-Roadmap</h4>
                  <p className="text-sm text-[#666]">Schritt-für-Schritt Plan für nachhaltiges Wachstum</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="py-20 px-4 bg-[#fafafa]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                Strategische Vorteile{' '}
                <span className="text-[#C80000]">für dein Business</span>
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                AdRuby transformiert komplexe Datenanalysen in klare, umsetzbare Strategien, 
                die deine Marketing-ROI maximieren.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {benefits?.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-8 border border-[#e0e0e0] hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-[#C80000]/10 rounded-2xl flex items-center justify-center">
                      <benefit.icon className="text-[#C80000]" size={32} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#C80000]">{benefit?.metric}</div>
                      <div className="text-xs text-[#666]">Durchschnitt</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-[#000000]">
                    {benefit?.title}
                  </h3>
                  
                  <p className="text-[#666] leading-relaxed">
                    {benefit?.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Case Study Teaser */}
            <motion.div
              variants={itemVariants}
              className="mt-16 bg-white rounded-2xl p-8 border border-[#e0e0e0] shadow-lg"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-[#000000] mb-4">
                    Case Study: E-Commerce Unternehmen steigert ROAS um 340%
                  </h3>
                  <p className="text-[#666] mb-6 leading-relaxed">
                    Durch AdRubys KI-Strategieanalyse konnte ein Online-Shop für Sportbekleidung 
                    seine Werbeausgaben um 40% reduzieren und gleichzeitig den Umsatz verdreifachen.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-[#fafafa] rounded-lg">
                      <div className="text-xl font-bold text-[#C80000]">+340%</div>
                      <div className="text-xs text-[#666]">ROAS Steigerung</div>
                    </div>
                    <div className="text-center p-3 bg-[#fafafa] rounded-lg">
                      <div className="text-xl font-bold text-[#C80000]">-40%</div>
                      <div className="text-xs text-[#666]">Werbekosten</div>
                    </div>
                    <div className="text-center p-3 bg-[#fafafa] rounded-lg">
                      <div className="text-xl font-bold text-[#C80000]">21 Tage</div>
                      <div className="text-xs text-[#666]">bis Erfolg</div>
                    </div>
                  </div>
                  
                  <button className="text-[#C80000] font-medium hover:underline flex items-center gap-2">
                    Vollständige Case Study lesen
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#C80000]/10 to-[#C80000]/20 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#666]">Kampagnenlaufzeit</span>
                        <span className="font-semibold">6 Monate</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#666]">Gesamtbudget</span>
                        <span className="font-semibold">€45.000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#666]">Generierter Umsatz</span>
                        <span className="font-bold text-[#C80000]">€198.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Call-to-Action Section */}
        <motion.section
          className="py-20 px-4 bg-gradient-to-br from-[#C80000] to-[#a50000] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-[1.1]"
            >
              Teste die{' '}
              <span className="text-white/90">KI-Strategieanalyse</span>{' '}
              kostenlos
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto"
            >
              Erhalte eine vollständige Kampagnenstrategie für dein Business – 
              inklusive Budgetempfehlungen, Zielgruppen-Insights und Performance-Prognosen.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                onClick={handleStartFreeTrial}
                className="bg-white text-[#C80000] px-10 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Brain className="w-5 h-5" />
                Kostenlose Strategieanalyse starten
              </motion.button>
              
              <motion.button
                className="border border-white/30 text-white px-10 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle size={20} />
                Strategie-Demo ansehen
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row items-center justify-center gap-8 text-white/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Vollständige Strategieanalyse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Sofortige Ergebnisse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Keine Verpflichtungen</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AdRubyAdStrategies;
