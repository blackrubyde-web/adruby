import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Star, ArrowRight, CheckCircle, Brain, BarChart3, TrendingUp, Target, Zap, Award } from 'lucide-react';
import Header from './components/Header';

const PublicLandingHome = () => {
  const navigate = useNavigate();

  const handleStartFreeTrial = () => {
    navigate('/ad-ruby-registration');
  };

  const handleGoogleLogin = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  // Mock user avatars for social proof
  const userAvatars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}&backgroundColor=red,blue,green&clothing=blazer,hoodie,sweater`
  }));

  // Partner/Brand logos (placeholder)
  const partnerBrands = [
    "Mercedes-Benz", "Adidas", "BMW", "Zalando", "Otto", "MediaMarkt"
  ];

  const features = [
    {
      icon: Brain,
      title: "KI Ad Builder",
      description: "Erstelle performante Anzeigen in Sekunden mit fortschrittlicher KI-Technologie."
    },
    {
      icon: BarChart3,
      title: "Campaign Insights",
      description: "Detaillierte Analysen und Optimierungsvorschläge für maximale Performance."
    },
    {
      icon: Target,
      title: "Strategy Generator",
      description: "Automatische Strategieerstellung basierend auf erfolgreichen Mustern."
    },
    {
      icon: Zap,
      title: "Creative Examples",
      description: "Zugriff auf Millionen erfolgreicher Ad-Creatives zur Inspiration."
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000] overflow-hidden">
        
        {/* Early Access Banner */}
        <motion.div
          className="bg-[#C80000] text-white py-3 px-4 text-center text-sm font-medium relative"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            <span>Early Access Deal — 50% OFF + Free Mobile App & Pro Features!</span>
          </div>
        </motion.div>

        <main className="relative">
          {/* Hero Section */}
          <motion.section
            className="pt-16 pb-20 px-4 bg-[#FAFAFA]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Content */}
                <div className="text-left">
                  
                  {/* Main Headline */}
                  <motion.h1 
                    variants={itemVariants}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-8 text-[#000000]"
                  >
                    #1 meistgenutzte KI für{' '}
                    <span className="text-[#C80000]">Werbeanzeigen</span>
                  </motion.h1>
                  
                  {/* Subheadline */}
                  <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-xl text-[#333333] leading-relaxed mb-8 font-normal max-w-lg"
                  >
                    Generiere Ad-Banner, Texte, Fotoshootings und Videos, die deine Konkurrenz übertreffen.
                  </motion.p>
                  
                  {/* CTA Buttons */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 mb-10"
                  >
                    <motion.button
                      onClick={handleGoogleLogin}
                      className="bg-white border border-[#e0e0e0] text-[#000000] px-8 py-4 rounded-lg font-medium hover:bg-[#f9f9f9] transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Kostenlos mit Google starten
                    </motion.button>
                    
                    <motion.button
                      onClick={handleStartFreeTrial}
                      className="bg-[#C80000] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#a50000] transition-all duration-200"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Jetzt kostenlos testen
                    </motion.button>
                  </motion.div>

                  {/* Social Proof */}
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-4 mb-12"
                  >
                    <div className="flex -space-x-2">
                      {userAvatars?.slice(0, 6)?.map((user) => (
                        <div
                          key={user?.id}
                          className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                        >
                          <img 
                            src={user?.avatar} 
                            alt={`${user?.name} avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#C80000] flex items-center justify-center text-xs text-white font-medium">
                        +
                      </div>
                    </div>
                    <div className="text-sm text-[#666]">
                      <span className="font-semibold text-[#000000]">Über +3.000.000 Nutzer</span> weltweit vertrauen uns
                    </div>
                  </motion.div>

                  {/* Partner Logos Section */}
                  <motion.div
                    variants={itemVariants}
                    className="text-left"
                  >
                    <p className="text-sm text-[#666] mb-4 font-medium">
                      Über 1 Milliarde Ad Creatives erstellt für Top-Marken:
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                      {partnerBrands?.map((brand, index) => (
                        <div 
                          key={index}
                          className="px-4 py-2 bg-white rounded-lg border border-[#e0e0e0] text-sm text-[#666] font-medium shadow-sm"
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Right Content - Dashboard Preview */}
                <div className="relative">
                  <motion.div
                    variants={itemVariants}
                    className="relative"
                  >
                    
                    {/* Ad Creative Examples - Left Side */}
                    <motion.div
                      className="absolute -left-8 top-8 w-48 space-y-4 z-10"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      {/* Facebook Ad Example */}
                      <div className="bg-[#1877F2] rounded-lg p-4 text-white text-sm shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <span className="text-[#1877F2] font-bold text-xs">f</span>
                          </div>
                          <span className="font-medium">AdRuby</span>
                        </div>
                        <div className="bg-white/20 rounded h-20 mb-2 flex items-center justify-center">
                          <span className="text-xs opacity-80">Ad Creative</span>
                        </div>
                        <p className="text-xs opacity-90">🚀 KI-generierte Ads mit 340% höherer CTR</p>
                        <button className="mt-2 bg-white text-[#1877F2] px-3 py-1 rounded-md text-xs font-medium">
                          Mehr erfahren
                        </button>
                      </div>

                      {/* Instagram Ad Example */}
                      <div className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] rounded-lg p-4 text-white text-sm shadow-lg">
                        <div className="bg-white/20 rounded h-16 mb-2 flex items-center justify-center">
                          <span className="text-xs opacity-80">Instagram Story</span>
                        </div>
                        <p className="text-xs opacity-90">✨ Performance-optimiert</p>
                      </div>
                    </motion.div>

                    {/* Main Dashboard Preview */}
                    <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-xl p-8 relative ml-8">
                      
                      {/* Dashboard Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png" 
                            alt="AdRuby Dashboard Logo"
                            className="w-6 h-6 object-contain"
                          />
                          <span className="font-semibold text-[#000000]">AdRuby Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#ff5f56] rounded-full"></div>
                          <div className="w-2 h-2 bg-[#ffbd2e] rounded-full"></div>
                          <div className="w-2 h-2 bg-[#27ca3f] rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="space-y-6">
                        {/* KPIs Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-[#fafafa] rounded-lg">
                            <div className="text-2xl font-bold text-[#C80000] mb-1">+340%</div>
                            <div className="text-xs text-[#666]">CTR Steigerung</div>
                          </div>
                          <div className="text-center p-4 bg-[#fafafa] rounded-lg">
                            <div className="text-2xl font-bold text-[#C80000] mb-1">4.2x</div>
                            <div className="text-xs text-[#666]">ROAS</div>
                          </div>
                          <div className="text-center p-4 bg-[#fafafa] rounded-lg">
                            <div className="text-2xl font-bold text-[#C80000] mb-1">-60%</div>
                            <div className="text-xs text-[#666]">CPC Reduktion</div>
                          </div>
                        </div>
                        
                        {/* Chart Visualization */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[#000000]">Campaign Performance</span>
                            <span className="text-xs text-[#666]">Letzte 30 Tage</span>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1 h-16 items-end">
                            {[35, 60, 45, 85, 70, 95, 80]?.map((height, index) => (
                              <motion.div
                                key={index}
                                className="bg-[#C80000] rounded-sm"
                                style={{ height: `${height}%` }}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Live Statistics */}
                        <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-700 font-medium">Live: +12 Conversions</span>
                          </div>
                          <span className="text-xs text-green-600">vor 2min</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            className="py-24 px-4 bg-white"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="max-w-6xl mx-auto">
              
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                  KI-gestützte Ad-Erstellung für{' '}
                  <span className="text-[#C80000]">maximale Performance</span>
                </h2>
                <p className="text-lg text-[#666] max-w-3xl mx-auto">
                  Nutze fortschrittliche KI-Technologie, um Werbeanzeigen zu erstellen, 
                  die deine Konkurrenz übertreffen und messbare Ergebnisse liefern.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features?.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="text-center p-6 rounded-xl bg-[#fafafa] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-[#C80000] rounded-lg flex items-center justify-center mb-6 mx-auto">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-[#000000]">
                      {feature?.title}
                    </h3>
                    
                    <p className="text-[#666] leading-relaxed text-sm">
                      {feature?.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Animated Demo Preview */}
          <motion.section
            className="py-24 px-4 bg-[#fafafa]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="max-w-5xl mx-auto text-center">
              
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                  Sieh AdRuby in Aktion
                </h2>
                <p className="text-lg text-[#666] mb-8">
                  Von der Idee zur performanten Anzeige in unter 60 Sekunden
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 border border-[#e0e0e0] shadow-lg relative overflow-hidden"
              >
                {/* Animated Process Steps */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                  
                  {/* Step 1 */}
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-[#C80000] rounded-full flex items-center justify-center mb-4 mx-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Brain className="text-white" size={24} />
                    </motion.div>
                    <h3 className="font-bold text-[#000000] mb-2">1. KI Analyse</h3>
                    <p className="text-sm text-[#666]">Marktdaten werden analysiert</p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="text-[#C80000]" size={24} />
                  </div>

                  {/* Step 2 */}
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-[#C80000] rounded-full flex items-center justify-center mb-4 mx-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Zap className="text-white" size={24} />
                    </motion.div>
                    <h3 className="font-bold text-[#000000] mb-2">2. Ad Generation</h3>
                    <p className="text-sm text-[#666]">Optimierte Anzeigen erstellt</p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="text-[#C80000]" size={24} />
                  </div>

                  {/* Step 3 */}
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-[#C80000] rounded-full flex items-center justify-center mb-4 mx-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <TrendingUp className="text-white" size={24} />
                    </motion.div>
                    <h3 className="font-bold text-[#000000] mb-2">3. Performance</h3>
                    <p className="text-sm text-[#666]">Maximale ROI erreicht</p>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => console.log('Demo video')}
                >
                  <div className="w-20 h-20 bg-[#C80000] rounded-full flex items-center justify-center shadow-lg">
                    <PlayCircle className="text-white ml-1" size={32} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* Testimonials Carousel */}
          <motion.section
            className="py-24 px-4 bg-white"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="max-w-6xl mx-auto">
              
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                  Was unsere Kunden sagen
                </h2>
                <p className="text-lg text-[#666]">
                  Über 3 Millionen Marketer vertrauen auf AdRuby
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {[
                  {
                    quote: "AdRuby hat unsere CTR um 340% gesteigert und spart uns täglich Stunden an manueller Arbeit. Die KI versteht unsere Zielgruppe besser als wir selbst.",
                    author: "Sarah Weber",
                    role: "Marketing Director",
                    company: "E-Commerce Boutique",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=red&clothing=blazer",
                    rating: 5,
                    metric: "+340% CTR"
                  },
                  {
                    quote: "Die automatische Strategieerstellung hat unser Marketing revolutioniert. Wir erreichen jetzt Zielgruppen, die wir vorher nie erreicht hätten.",
                    author: "Marcus Klein", 
                    role: "Geschäftsführer",
                    company: "Digital Marketing Agentur",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=blue&clothing=hoodie",
                    rating: 5,
                    metric: "15h/Woche gespart"
                  },
                  {
                    quote: "Von 2% auf 8% Conversion-Rate in nur 4 Wochen. AdRuby hat unsere Erwartungen bei weitem übertroffen und zahlt sich täglich aus.",
                    author: "Lisa Hoffmann",
                    role: "Marketing Managerin",
                    company: "Fitness Studio Kette", 
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa&backgroundColor=green&clothing=sweater",
                    rating: 5,
                    metric: "+300% Conversions"
                  }
                ]?.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-[#fafafa] rounded-xl p-8 border border-[#e0e0e0] hover:shadow-lg transition-all duration-300"
                  >
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial?.rating)]?.map((_, i) => (
                        <Star key={i} className="text-[#C80000] fill-current" size={14} />
                      ))}
                    </div>
                    
                    <p className="text-[#333] mb-8 leading-relaxed">
                      "{testimonial?.quote}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial?.avatar} 
                          alt={`${testimonial?.author} avatar`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-bold text-[#000000]">{testimonial?.author}</p>
                          <p className="text-sm text-[#666]">{testimonial?.role}</p>
                          <p className="text-xs text-[#999]">{testimonial?.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#C80000]">{testimonial?.metric}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Pricing Section */}
          <motion.section
            className="py-24 px-4 bg-[#fafafa]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              
              <motion.div variants={itemVariants} className="mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#000000]">
                  Einfache, transparente Preise
                </h2>
                <p className="text-lg text-[#666] mb-8">
                  Starte kostenlos und upgrade jederzeit. Kein Risiko, maximaler Erfolg.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 border border-[#e0e0e0] shadow-lg relative"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#C80000] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Beliebtester Plan
                  </span>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#000000] mb-4">Professional</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[#000000]">29€</span>
                    <span className="text-lg text-[#666]">/Monat</span>
                  </div>
                  <p className="text-[#666] mb-6">1000 Credits pro Monat inklusive</p>
                  
                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="w-full bg-[#C80000] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#a50000] transition-all duration-200 mb-6"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    14 Tage kostenlos testen
                  </motion.button>

                  <p className="text-sm text-[#666]">
                    Keine Kreditkarte erforderlich • Jederzeit kündbar
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  {[
                    "Unbegrenzte Ad-Generierung",
                    "KI-Strategieberatung", 
                    "Performance Analytics",
                    "Prioritäts-Support",
                    "A/B Testing Tools",
                    "Team Collaboration"
                  ]?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="text-[#C80000] w-5 h-5 flex-shrink-0" />
                      <span className="text-[#333]">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Final CTA Section */}
          <motion.section
            className="py-24 px-4 bg-[#C80000] text-white"
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
                Erstelle deine erste KI-Anzeige{' '}
                <span className="text-white/80">in unter 60 Sekunden</span>
              </motion.h2>
              
              <motion.p
                variants={itemVariants}
                className="text-lg text-white/80 mb-12 max-w-2xl mx-auto"
              >
                Schließe dich über 3 Millionen Marketern an, die bereits auf AdRuby vertrauen. 
                Starte heute kostenlos und erlebe den Unterschied.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={handleStartFreeTrial}
                  className="bg-white text-[#C80000] px-10 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Kostenlos starten
                </motion.button>
                
                <motion.button
                  onClick={() => console.log('Demo requested')}
                  className="border border-white/30 text-white px-10 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlayCircle size={20} />
                  Demo ansehen
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="bg-[#000000] text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            
            <div className="grid lg:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png" 
                    alt="AdRuby Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold">AdRuby</span>
                </div>
                <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                  KI-powered Ad Intelligence für Marketers & Agencies. 
                  Erstelle performante Werbeanzeigen, die deine Konkurrenz übertreffen.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-bold mb-4">Produkt</h4>
                <div className="space-y-3">
                  {['KI Ad Builder', 'Campaign Insights', 'Analytics', 'A/B Testing', 'API Access']?.map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-bold mb-4">Unternehmen</h4>
                <div className="space-y-3">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt']?.map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800">
              <div className="flex items-center gap-8 mb-6 lg:mb-0">
                <span className="text-sm text-gray-400">© 2025 AdRuby. Alle Rechte vorbehalten.</span>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">Impressum</a>
                  <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
                  <a href="#" className="hover:text-white transition-colors">AGB</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.013C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicLandingHome;
