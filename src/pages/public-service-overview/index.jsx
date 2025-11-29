import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database,
  Brain,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Award
} from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const PublicServiceOverview = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState(null);

  const handleStartTrial = () => {
    navigate('/ad-ruby-registration');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const toggleFeature = (index) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  const detailedFeatures = [
  {
    icon: Database,
    title: "Datengetriebene Ad-Analyse",
    subtitle: "Echte Marktdaten in Echtzeit",
    description: "Unsere KI durchsucht kontinuierlich die Facebook Ads Library und analysiert tausende erfolgreiche Werbeanzeigen.",
    expandedContent: [
    "KI durchsucht Facebook Ads Library in Echtzeit",
    "Zeigt Hook-, CTA- und Visual-Trends pro Branche",
    "Liefert Benchmarks zu Klickrate und Conversion",
    "Erkennt saisonale Muster und Markttrends",
    "Analysiert Konkurrenz-Strategien automatisch"],

    stats: { value: "50.000+", label: "Ads täglich analysiert" }
  },
  {
    icon: Brain,
    title: "KI-Ad-Builder",
    subtitle: "Intelligente Content-Generierung",
    description: "Nutzt OpenAI-Modelle, um auf Basis der Analyse conversion-optimierte Anzeigenvorschläge zu erstellen.",
    expandedContent: [
    "Nutzt OpenAI-Modelle für hochwertige Texte",
    "Generiert 3 conversion-optimierte Anzeigenvorschläge",
    "Jeder Text wird nach emotionalem Trigger bewertet",
    "Klarheit und Handlungsaufforderung werden optimiert",
    "Automatische A/B-Test-Varianten erstellen"],

    stats: { value: "127%", label: "Durchschn. CTR-Steigerung" }
  },
  {
    icon: BarChart3,
    title: "Performance Dashboard",
    subtitle: "Echtzeit-Monitoring & Insights",
    description: "Behalte den vollständigen Überblick über alle wichtigen Metriken und erhalte automatische Verbesserungsvorschläge.",
    expandedContent: [
    "Nutzer sehen CTR, Conversion-Score und ROAS in Echtzeit",
    "Automatische Empfehlungen zur Verbesserung",
    "Vergleich mit Industrie-Benchmarks",
    "Kostenverfolgung und Budget-Optimierung",
    "Detaillierte Audience-Insights und Segmentierung"],

    stats: { value: "15h", label: "Zeitersparnis pro Woche" }
  }];


  const benefits = [
  {
    icon: Target,
    title: "Höhere Conversion-Raten",
    description: "Durchschnittlich 89% mehr Conversions durch KI-optimierte Ad-Texte"
  },
  {
    icon: TrendingUp,
    title: "Besserer ROAS",
    description: "Return on Ad Spend steigt um durchschnittlich 156% innerhalb von 30 Tagen"
  },
  {
    icon: Clock,
    title: "Massive Zeitersparnis",
    description: "Reduziere deine Ad-Erstellung von Stunden auf Minuten"
  },
  {
    icon: Users,
    title: "Team-Collaboration",
    description: "Arbeite seamless mit deinem Marketing-Team zusammen"
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Über 500 Unternehmen vertrauen bereits auf BlackRuby"
  },
  {
    icon: Sparkles,
    title: "Kontinuierliche Innovation",
    description: "Monatliche Updates mit neuen KI-Features und Verbesserungen"
  }];


  const caseStudies = [
  {
    company: "E-Commerce Fashion Brand",
    industry: "Mode & Lifestyle",
    challenge: "Niedrige CTR bei Facebook Ads (1.2%)",
    solution: "KI-Analyse der Fashion-Branche + optimierte Ad-Texte",
    result: "CTR stieg auf 4.8% (+300%)",
    timeframe: "3 Wochen",
    image: "https://images.unsplash.com/photo-1543857182-cd420065f549",
    alt: "Modern fashion store interior with clothing displays and shoppers"
  },
  {
    company: "SaaS Startup",
    industry: "Technology",
    challenge: "Hohe Acquisition-Kosten (€89 pro Lead)",
    solution: "Datengetriebene Audience-Insights + A/B-Testing",
    result: "Kosten sanken auf €31 pro Lead (-65%)",
    timeframe: "6 Wochen",
    image: "https://images.unsplash.com/photo-1554848073-2a2acaf6fa81",
    alt: "Modern office environment with people working on computers and collaboration spaces"
  },
  {
    company: "Fitness Studio Kette",
    industry: "Health & Fitness",
    challenge: "Saisonale Schwankungen bei Membership-Anmeldungen",
    solution: "Predictive Analytics + saisonale Ad-Strategien",
    result: "30% weniger Schwankung, konstante Anmeldungen",
    timeframe: "12 Wochen",
    image: "https://images.unsplash.com/photo-1714181871329-1392197011c2",
    alt: "Modern fitness gym with exercise equipment and people working out"
  }];


  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-12 sm:pt-16 px-4 sm:px-6 lg:px-10">
        {/* Intro Section */}
        <motion.section
          className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <motion.p variants={itemVariants} className="text-sm uppercase tracking-[0.25em] text-[#C80000] font-semibold">
              KI Advertising Plattform
            </motion.p>
            <motion.h1 variants={itemVariants} className="text-[clamp(2.2rem,5vw,3.4rem)] font-bold text-black">
              Was BlackRuby <span className="text-[#E50914]">einzigartig</span> macht.
            </motion.h1>
            <motion.p variants={itemVariants} className="text-[clamp(1.05rem,3vw,1.3rem)] text-gray-700 leading-relaxed max-w-4xl mx-auto">
              Verstehe, warum hunderte Marketer BlackRuby nutzen, um Zeit zu sparen und bessere Ads zu erstellen.
              Unsere KI-Plattform kombiniert Marktanalyse, Content-Generation und Performance-Tracking in einem Tool.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTrial}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#C80000] text-white font-semibold hover:bg-[#A50000] transition-all duration-200"
              >
                Kostenlos testen
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Demo ansehen
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Detailed Features Section */}
        <motion.section
          className="py-14 sm:py-16 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-0 sm:px-4">
            <div className="space-y-12">
              {detailedFeatures?.map((feature, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden">

                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-[#E50914] bg-opacity-10 rounded-xl flex items-center justify-center">
                          <feature.icon className="text-[#E50914]" size={40} />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-3xl font-bold text-black mb-2">{feature?.title}</h3>
                            <p className="text-lg text-[#E50914] font-medium">{feature?.subtitle}</p>
                          </div>
                          <div className="text-right mt-4 lg:mt-0">
                            <div className="text-3xl font-bold text-[#E50914]">{feature?.stats?.value}</div>
                            <div className="text-sm text-gray-600">{feature?.stats?.label}</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-6">{feature?.description}</p>
                        
                        <button
                        onClick={() => toggleFeature(index)}
                        className="flex items-center gap-2 text-[#E50914] font-medium hover:text-[#B0060F] transition-colors">

                          {expandedFeature === index ? 'Weniger anzeigen' : 'Mehr Details'}
                          {expandedFeature === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    <motion.div
                    initial={false}
                    animate={{
                      height: expandedFeature === index ? 'auto' : 0,
                      opacity: expandedFeature === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden">

                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="grid lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-black mb-4">Hauptfunktionen:</h4>
                            <ul className="space-y-3">
                              {feature?.expandedContent?.map((item, itemIndex) =>
                            <li key={itemIndex} className="flex items-start gap-3">
                                  <Check className="text-[#E50914] flex-shrink-0 mt-0.5" size={20} />
                                  <span className="text-gray-700">{item}</span>
                                </li>
                            )}
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-semibold text-black mb-3">Technische Details</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>• Echtzeit-Datenverarbeitung</p>
                              <p>• Machine Learning Algorithmen</p>
                              <p>• API-Integration mit Facebook</p>
                              <p>• Automatische Datenaktualisierung</p>
                              <p>• DSGVO-konforme Datenspeicherung</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Benefits Grid */}
        <motion.section
          className="py-16 sm:py-20 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-7xl mx-auto px-4">
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center text-black mb-16">
              Warum BlackRuby die richtige Wahl ist
            </motion.h2>
            
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
              {benefits?.map((benefit, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">

                  <div className="w-16 h-16 bg-[#E50914] bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="text-[#E50914]" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{benefit?.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit?.description}</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Case Studies Section */}
        <motion.section
          className="py-20 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-7xl mx-auto px-4">
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center text-black mb-16">
              Erfolgsgeschichten unserer Kunden
            </motion.h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {caseStudies?.map((study, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">

                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                    <img
                    src={study?.image}
                    alt={study?.alt}
                    className="w-full h-full object-cover" />

                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-black mb-1">{study?.company}</h3>
                      <p className="text-sm text-[#E50914] font-medium">{study?.industry}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">Challenge:</h4>
                        <p className="text-gray-600 text-sm">{study?.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">Lösung:</h4>
                        <p className="text-gray-600 text-sm">{study?.solution}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-[#E50914]">{study?.result}</span>
                        <span className="text-sm text-gray-500">{study?.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-20 bg-[#E50914] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold mb-6">
              Starte heute – deine ersten 10 Ads sind kostenlos.
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl mb-8 opacity-90">
              Erlebe selbst, wie BlackRuby deine Ad-Performance revolutioniert. 
              Keine Kreditkarte erforderlich. Jederzeit kündbar.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTrial}
                className="bg-white text-[#E50914] px-10 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg">

                Account erstellen
              </button>
              
              <button
                onClick={() => navigate('/public-landing-home')}
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-xl hover:bg-white hover:text-[#E50914] transition-colors duration-300">

                Mehr erfahren
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-white border-opacity-20">
              <p className="text-lg opacity-80">
                Schließe dich über <span className="font-bold">500+ Unternehmen</span> an, die bereits auf BlackRuby vertrauen
              </p>
            </motion.div>
          </div>
        </motion.section>
      </main>
      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-6 lg:mb-0">
              <span className="text-lg">© 2025 BlackRuby</span>
            </div>
            
            <div className="flex items-center gap-8 mb-6 lg:mb-0">
              <button className="text-gray-300 hover:text-white transition-colors">
                Datenschutz
              </button>
              <span className="text-gray-500">|</span>
              <button className="text-gray-300 hover:text-white transition-colors">
                Impressum
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.74.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>);

};

export default PublicServiceOverview;
