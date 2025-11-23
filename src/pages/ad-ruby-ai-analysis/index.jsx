import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BarChart3, TrendingUp, Target, CheckCircle, Zap, Users, Clock, Play, Star, Database, Shield } from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const AdRubyAiAnalysis = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState(0);

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

  // Predictive Analysis Scenarios
  const analysisScenarios = [
    {
      title: "ROI Vorhersage",
      description: "Automatische Berechnung des erwarteten Return on Investment",
      prediction: "4.2x ROAS",
      confidence: "94%",
      timeframe: "30 Tage",
      icon: TrendingUp
    },
    {
      title: "Audience Response",
      description: "KI-Modellierung der Zielgruppenreaktion",
      prediction: "2.8% CTR",
      confidence: "89%",
      timeframe: "7 Tage", 
      icon: Users
    },
    {
      title: "Market Conditions",
      description: "Analyse der aktuellen Marktbedingungen und Trends",
      prediction: "Optimal",
      confidence: "96%",
      timeframe: "Echtzeit",
      icon: Database
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Predictive Performance",
      description: "Vorhersage der Ad-Performance bevor du Geld ausgibst"
    },
    {
      icon: Shield,
      title: "Risiko Reduktion", 
      description: "Erkenne schwache Ads bevor sie dein Budget verschwenden"
    },
    {
      icon: Target,
      title: "Performance Optimization",
      description: "Automatische Optimierungsvorschläge basierend auf KI-Analyse"
    },
    {
      icon: Clock,
      title: "Ad Fatigue Detection",
      description: "Erkennt frühzeitig, wenn Ads an Wirkung verlieren"
    },
    {
      icon: BarChart3,
      title: "Competitor Analysis",
      description: "Analysiere erfolgreiche Ads deiner Konkurrenten"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Live-Monitoring mit sofortigen Handlungsempfehlungen"
    }
  ];

  // Success metrics and testimonials
  const successMetrics = [
    { value: "94%", label: "Vorhersage-Genauigkeit" },
    { value: "67%", label: "Weniger Ad-Failures" },
    { value: "2.3x", label: "Bessere Performance" },
    { value: "89%", label: "Kundenzufriedenheit" }
  ];

  const testimonials = [
    {
      quote: "Die KI-Analyse hat uns geholfen, 67% unserer schlecht performenden Ads im Voraus zu identifizieren. Das spart uns tausende Euro jeden Monat.",
      author: "Sarah Weber",
      role: "Performance Marketing Manager",
      company: "TechStart GmbH",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-weber&backgroundColor=red&clothing=blazer",
      rating: 5
    },
    {
      quote: "Mit AdRuby AI Analysis können wir die Performance unserer Kampagnen vorhersagen, bevor wir sie schalten. Ein Game-Changer für unser Marketing.",
      author: "Marcus Klein",
      role: "Marketing Director", 
      company: "E-Commerce Solutions",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus-klein&backgroundColor=blue&clothing=hoodie",
      rating: 5
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000]">
        
        {/* Hero Section */}
        <motion.section
          className="pt-24 pb-20 px-4 bg-gradient-to-br from-[#FAFAFA] via-white to-[#f5f5f5]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div>
                <motion.div variants={itemVariants} className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-[#C80000]/10 text-[#C80000] rounded-full text-sm font-medium">
                    <Brain className="w-4 h-4 mr-2" />
                    KI-Powered Analytics
                  </span>
                </motion.div>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
                >
                  Analysiere deine Ads –{' '}
                  <span className="text-[#C80000]">bevor du sie schaltest</span>
                </motion.h1>
                
                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl text-[#666] leading-relaxed mb-8 max-w-2xl"
                >
                  AdRuby's KI-Analyse bewertet automatisch deine Ad-Texte, Creatives und Performance-Daten. 
                  Erhalte predictive Performance-Bewertungen und erkenne Schwächen, bevor sie dein Budget kosten.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="bg-[#C80000] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#a50000] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-5 h-5" />
                    Jetzt KI-Analyse starten
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setActiveDemo(activeDemo === 0 ? 1 : 0)}
                    className="border border-[#e0e0e0] text-[#000000] px-8 py-4 rounded-lg font-medium hover:bg-[#f9f9f9] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-5 h-5" />
                    Demo ansehen
                  </motion.button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-[#666]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#C80000]" />
                    <span>In Sekunden Ergebnisse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#C80000]" />
                    <span>94% Vorhersage-Genauigkeit</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Content - Interactive Dashboard Preview */}
              <motion.div variants={itemVariants} className="relative">
                
                {/* Main Analysis Dashboard */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#e0e0e0] p-8 relative">
                  
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C80000] rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-[#000000]">KI Performance Analyse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Live</span>
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="space-y-6">
                    
                    {/* Performance Score */}
                    <div className="text-center p-6 bg-gradient-to-br from-[#C80000]/5 to-[#C80000]/10 rounded-xl">
                      <div className="text-4xl font-bold text-[#C80000] mb-2">8.7/10</div>
                      <div className="text-sm text-[#666] mb-3">Predicted Performance Score</div>
                      <div className="flex items-center justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-[#C80000] fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Analysis Categories */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#fafafa] rounded-lg">
                        <div className="text-lg font-bold text-[#C80000] mb-1">92%</div>
                        <div className="text-xs text-[#666]">Hook Stärke</div>
                      </div>
                      <div className="p-4 bg-[#fafafa] rounded-lg">
                        <div className="text-lg font-bold text-[#C80000] mb-1">87%</div>
                        <div className="text-xs text-[#666]">CTA Effektivität</div>
                      </div>
                      <div className="p-4 bg-[#fafafa] rounded-lg">
                        <div className="text-lg font-bold text-[#C80000] mb-1">95%</div>
                        <div className="text-xs text-[#666]">Emotionale Tiefe</div>
                      </div>
                      <div className="p-4 bg-[#fafafa] rounded-lg">
                        <div className="text-lg font-bold text-[#C80000] mb-1">89%</div>
                        <div className="text-xs text-[#666]">Zielgruppen-Fit</div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800 text-sm mb-1">KI-Empfehlung</div>
                          <div className="text-blue-700 text-xs">Verstärke den emotionalen Hook um +12% CTR zu erreichen</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Analysis Cards */}
                <motion.div
                  className="absolute -top-4 -left-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0] p-4 z-10"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="font-semibold text-green-700 text-sm">Performance Trend</div>
                      <div className="text-xs text-gray-600">+23% vs. letzte Woche</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -right-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0] p-4 z-10"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-[#C80000]" />
                    <div>
                      <div className="font-semibold text-[#C80000] text-sm">Risiko Status</div>
                      <div className="text-xs text-gray-600">Niedrig (2%)</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Analysis Scenarios Section */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Predictive Performance{' '}
                <span className="text-[#C80000]">in Echtzeit</span>
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                Unsere KI analysiert Millionen von Datenpunkten, um die Performance deiner Ads vorherzusagen, 
                bevor du auch nur einen Euro ausgibst.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {analysisScenarios.map((scenario, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-[#fafafa] rounded-xl p-8 hover:shadow-lg transition-all duration-300 border border-[#e0e0e0]"
                >
                  <div className="w-12 h-12 bg-[#C80000] rounded-lg flex items-center justify-center mb-6">
                    <scenario.icon className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-[#000000]">{scenario.title}</h3>
                  <p className="text-[#666] leading-relaxed mb-6 text-sm">{scenario.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Vorhersage:</span>
                      <span className="font-bold text-[#C80000]">{scenario.prediction}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Konfidenz:</span>
                      <span className="font-bold text-green-600">{scenario.confidence}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Zeitrahmen:</span>
                      <span className="font-medium text-[#333]">{scenario.timeframe}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
          <div className="max-w-7xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Warum AdRuby KI-Analyse{' '}
                <span className="text-[#C80000]">unschlagbar</span> ist
              </h2>
              <p className="text-lg text-[#666] max-w-2xl mx-auto">
                Nutze die Kraft künstlicher Intelligenz, um deine Ad-Performance zu maximieren und Risiken zu minimieren.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-[#C80000]/10 rounded-lg flex items-center justify-center mb-6">
                    <benefit.icon className="text-[#C80000]" size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-[#000000]">{benefit.title}</h3>
                  <p className="text-[#666] leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Success Metrics */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Bewiesene <span className="text-[#C80000]">Resultate</span>
              </h2>
              <p className="text-lg text-[#666]">
                Zahlen sprechen für sich – tausende Marketer vertrauen auf AdRuby AI Analysis
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {successMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6 bg-[#fafafa] rounded-xl"
                >
                  <div className="text-4xl font-bold text-[#C80000] mb-2">{metric.value}</div>
                  <div className="text-sm text-[#666] font-medium">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-[#fafafa] rounded-xl p-8 border border-[#e0e0e0]"
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-[#C80000] fill-current" size={16} />
                    ))}
                  </div>
                  
                  <p className="text-[#333] mb-8 leading-relaxed">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.author} avatar`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-[#000000]">{testimonial.author}</p>
                      <p className="text-sm text-[#666]">{testimonial.role}</p>
                      <p className="text-xs text-[#999]">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-24 px-4 bg-gradient-to-br from-[#C80000] to-[#a50000] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1]"
            >
              Jetzt KI-Analyse starten –{' '}
              <span className="text-white/80">in Sekunden Ergebnisse</span>
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
            >
              Erhalte sofort eine detaillierte Analyse deiner Ads und erkenne Verbesserungspotentiale, 
              bevor sie dein Budget kosten.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleStartFreeTrial}
                className="bg-white text-[#C80000] px-10 py-4 rounded-lg font-bold text-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Brain className="w-6 h-6" />
                Kostenlose Analyse starten
              </motion.button>
              
              <motion.button
                className="border-2 border-white/30 text-white px-10 py-4 rounded-lg font-bold text-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5" />
                Demo anschauen
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/20">
              <p className="text-lg text-white/80">
                ✓ Keine Kreditkarte erforderlich ✓ Sofortige Ergebnisse ✓ 94% Genauigkeit
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AdRubyAiAnalysis;
