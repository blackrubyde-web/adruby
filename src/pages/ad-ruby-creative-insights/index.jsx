import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Eye, CheckCircle, ArrowRight, Play, Star, BarChart3, Users, Heart, Filter, Calendar, Zap } from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const AdRubyCreativeInsights = () => {
  const navigate = useNavigate();
  const [activeTrend, setActiveTrend] = useState(0);
  const [activeInsightCategory, setActiveInsightCategory] = useState('all');

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

  // Creative Trends Data
  const creativeCategories = [
  { id: 'all', label: 'Alle Trends', count: '2.4M' },
  { id: 'colors', label: 'Farbtrends', count: '340K' },
  { id: 'messaging', label: 'Messaging', count: '890K' },
  { id: 'formats', label: 'Ad-Formate', count: '760K' },
  { id: 'seasonal', label: 'Saisonal', count: '510K' }];


  const trendAnalysis = [
  {
    category: "Farbpsychologie",
    trend: "Warme Erdtöne dominieren",
    performance: "+47% CTR",
    description: "Braun, Terracotta und warme Gelbtöne zeigen die beste Performance in Fashion & Lifestyle",
    industries: ["Fashion", "Lifestyle", "Home & Garden"],
    icon: Eye,
    color: "#D2691E"
  },
  {
    category: "Messaging Patterns",
    trend: "Direkte Fragen als Hook",
    performance: "+52% Engagement",
    description: "Headlines, die mit 'Kennst du...' oder 'Weißt du...' beginnen, generieren höchste Aufmerksamkeit",
    industries: ["E-Commerce", "SaaS", "Education"],
    icon: Heart,
    color: "#C80000"
  },
  {
    category: "Video Formate",
    trend: "Vertikale 9:16 Stories",
    performance: "+63% Completion Rate",
    description: "Mobile-first Video Content mit schnellen Cuts in den ersten 3 Sekunden",
    industries: ["E-Commerce", "Apps", "Gaming"],
    icon: Play,
    color: "#4F46E5"
  }];


  const insightBenefits = [
  {
    icon: TrendingUp,
    title: "Trend Awareness",
    description: "Erkenne aufkommende Creative-Trends bevor deine Konkurrenz sie nutzt"
  },
  {
    icon: Target,
    title: "Competitive Edge",
    description: "Differenziere dich von Mitbewerbern mit datenbasierten Creative-Entscheidungen"
  },
  {
    icon: Users,
    title: "Audience Resonance",
    description: "Verstehe, was deine Zielgruppe wirklich zum Handeln bewegt"
  },
  {
    icon: BarChart3,
    title: "Performance Benchmarks",
    description: "Vergleiche deine Creatives mit Industry-Standards und Best Practices"
  },
  {
    icon: Calendar,
    title: "Seasonal Insights",
    description: "Nutze saisonale Creative-Empfehlungen für maximalen Impact"
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Erhalte sofortige Updates zu neuen Trends in deiner Branche"
  }];


  // Success Stories
  const industryInsights = [
  {
    industry: "E-Commerce Fashion",
    insight: "User-Generated Content Trend",
    impact: "+189% Authenticity Score",
    description: "Echte Kunden in natürlichen Settings performen 3x besser als Studio-Aufnahmen",
    imageUrl: "https://images.unsplash.com/photo-1666445135689-636377e50d05",
    alt: "Fashion e-commerce store with customers shopping and trying on clothes"
  },
  {
    industry: "Tech & SaaS",
    insight: "Behind-the-Scenes Content",
    impact: "+156% Trust Factor",
    description: "Einblicke in Entwicklungsprozesse und Team-Stories schaffen Vertrauen",
    imageUrl: "https://images.unsplash.com/photo-1677506048377-1099738d294d",
    alt: "Tech startup office with developers working collaboratively on projects"
  },
  {
    industry: "Health & Fitness",
    insight: "Transformation Stories",
    impact: "+234% Emotional Connection",
    description: "Authentische Vorher-Nachher Geschichten motivieren stärker als Fitness-Models",
    imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_127fc6cb1-1762273968883.png",
    alt: "Fitness transformation before and after success story with real people"
  }];


  const testimonials = [
  {
    quote: "AdRuby Creative Insights hat uns geholfen, die aktuellen Trends 3 Monate früher zu erkennen. Unser Creative-Team ist jetzt immer einen Schritt voraus.",
    author: "Lisa Hoffmann",
    role: "Creative Director",
    company: "Innovation Agency",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa-hoffmann&backgroundColor=green&clothing=sweater",
    rating: 5
  },
  {
    quote: "Die Insights zu saisonalen Creative-Trends haben unsere Kampagnen-Performance um 67% verbessert. Wir wissen jetzt genau, wann welcher Content funktioniert.",
    author: "Thomas Weber",
    role: "Marketing Manager",
    company: "Lifestyle Brand",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas-weber&backgroundColor=blue&clothing=blazer",
    rating: 5
  }];


  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] text-[#000000]">
        
        {/* Hero Section */}
        <motion.section
          className="pt-24 pb-20 px-4 bg-gradient-to-br from-[#FAFAFA] via-white to-[#f5f5f5]"
          variants={containerVariants}
          initial="hidden"
          animate="visible">

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div>
                <motion.div variants={itemVariants} className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-[#C80000]/10 text-[#C80000] rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Creative Intelligence
                  </span>
                </motion.div>
                
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">

                  Lerne, was erfolgreiche{' '}
                  <span className="text-[#C80000]">Creatives</span> gemeinsam haben
                </motion.h1>
                
                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl text-[#666] leading-relaxed mb-8 max-w-2xl">

                  AdRuby wertet erfolgreiche Werbeanzeigen aus der Meta Ads Library aus. 
                  Erkenne Trends, analysiere Best Practices und erhalte Inspiration für deine nächsten hochperformanten Ads.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 mb-12">

                  <motion.button
                    onClick={handleStartFreeTrial}
                    className="bg-[#C80000] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#a50000] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}>

                    <Sparkles className="w-5 h-5" />
                    Entdecke kreative Trends
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setActiveTrend(activeTrend === 0 ? 1 : 0)}
                    className="border border-[#e0e0e0] text-[#000000] px-8 py-4 rounded-lg font-medium hover:bg-[#f9f9f9] transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}>

                    <Eye className="w-5 h-5" />
                    Insights Preview
                  </motion.button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-[#666]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#C80000]" />
                    <span>2.4M+ Creative Analysen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#C80000]" />
                    <span>Täglich aktualisiert</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Content - Trend Visualization */}
              <motion.div variants={itemVariants} className="relative">
                
                {/* Main Creative Trends Dashboard */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#e0e0e0] p-8 relative">
                  
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C80000] rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-[#000000]">Creative Trends Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Live Data</span>
                    </div>
                  </div>

                  {/* Trend Categories */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {creativeCategories?.slice(0, 4)?.map((category, index) =>
                    <button
                      key={category?.id}
                      onClick={() => setActiveInsightCategory(category?.id)}
                      className={`p-3 rounded-lg text-left transition-all duration-200 ${
                      activeInsightCategory === category?.id ?
                      'bg-[#C80000] text-white' :
                      'bg-[#fafafa] text-[#666] hover:bg-[#f0f0f0]'}`
                      }>

                        <div className={`text-lg font-bold ${activeInsightCategory === category?.id ? 'text-white' : 'text-[#C80000]'}`}>
                          {category?.count}
                        </div>
                        <div className="text-xs">{category?.label}</div>
                      </button>
                    )}
                  </div>

                  {/* Current Trend Highlight */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTrend}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-[#C80000]/5 to-[#C80000]/10 rounded-lg p-6">

                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-[#C80000]" />
                        <div>
                          <div className="font-bold text-[#000000]">Aktueller Trend</div>
                          <div className="text-sm text-[#666]">Fashion & Lifestyle</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-xl font-bold text-[#C80000] mb-1">Warme Erdtöne</div>
                        <div className="text-sm text-[#666]">+47% höhere CTR vs. kalte Farben</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#666]">Performance Trend</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#C80000] rounded-full"></div>
                          <div className="w-2 h-2 bg-[#C80000]/70 rounded-full"></div>
                          <div className="w-2 h-2 bg-[#C80000]/40 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Floating Insight Cards */}
                <motion.div
                  className="absolute -top-4 -left-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0] p-4 z-10"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}>

                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-pink-500" />
                    <div>
                      <div className="font-semibold text-pink-700 text-sm">Emotional Impact</div>
                      <div className="text-xs text-gray-600">+89% vs. Standard</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -right-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0] p-4 z-10"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}>

                  <div className="flex items-center gap-3">
                    <Filter className="w-6 h-6 text-purple-500" />
                    <div>
                      <div className="font-semibold text-purple-700 text-sm">Trend Filter</div>
                      <div className="text-xs text-gray-600">127 aktive</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Creative Trend Analysis Section */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Aktuelle{' '}
                <span className="text-[#C80000]">Creative Trends</span>
              </h2>
              <p className="text-lg text-[#666] max-w-3xl mx-auto">
                Entdecke die neuesten Trends in Farben, Messaging und Formaten, 
                die aktuell die beste Performance in deiner Branche erzielen.
              </p>
            </motion.div>

            <div className="space-y-12">
              {trendAnalysis?.map((trend, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-[#fafafa] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">

                  <div className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                      
                      {/* Trend Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-6">
                          <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${trend?.color}20` }}>

                            <trend.icon style={{ color: trend?.color }} size={24} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#666] mb-1">{trend?.category}</div>
                            <div className="text-xl font-bold text-[#000000]">{trend?.trend}</div>
                          </div>
                        </div>
                        
                        <p className="text-[#666] leading-relaxed mb-6">{trend?.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm text-[#666]">Branchen:</span>
                          {trend?.industries?.map((industry, industryIndex) =>
                        <span
                          key={industryIndex}
                          className="px-3 py-1 bg-white rounded-full text-sm font-medium text-[#333] border border-[#e0e0e0]">

                              {industry}
                            </span>
                        )}
                        </div>
                      </div>

                      {/* Performance Metric */}
                      <div className="text-center lg:text-right">
                        <div className="inline-flex flex-col items-center lg:items-end p-6 bg-white rounded-xl shadow-sm">
                          <div
                          className="text-3xl font-bold mb-2"
                          style={{ color: trend?.color }}>

                            {trend?.performance}
                          </div>
                          <div className="text-sm text-[#666] font-medium">Performance Boost</div>
                          <div className="mt-3 flex items-center gap-1">
                            <TrendingUp style={{ color: trend?.color }} size={16} />
                            <span className="text-xs text-[#666]">vs. Baseline</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="py-20 px-4 bg-[#fafafa]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-7xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Warum Creative Insights{' '}
                <span className="text-[#C80000]">essentiell</span> sind
              </h2>
              <p className="text-lg text-[#666] max-w-2xl mx-auto">
                Nutze datenbasierte Creative Intelligence, um Trends frühzeitig zu erkennen und 
                Creatives zu entwickeln, die wirklich performen.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {insightBenefits?.map((benefit, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">

                  <div className="w-12 h-12 bg-[#C80000]/10 rounded-lg flex items-center justify-center mb-6">
                    <benefit.icon className="text-[#C80000]" size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-[#000000]">{benefit?.title}</h3>
                  <p className="text-[#666] leading-relaxed">{benefit?.description}</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Industry Insights */}
        <motion.section
          className="py-20 px-4 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-7xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Branchenspezifische <span className="text-[#C80000]">Insights</span>
              </h2>
              <p className="text-lg text-[#666]">
                Erfahre, welche Creative-Strategien in verschiedenen Branchen aktuell am besten funktionieren
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {industryInsights?.map((insight, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-[#fafafa] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">

                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    <img
                    src={insight?.imageUrl}
                    alt={insight?.alt}
                    className="w-full h-full object-cover" />

                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#C80000] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {insight?.industry}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-[#000000]">{insight?.insight}</h3>
                    <div className="text-2xl font-bold text-[#C80000] mb-3">{insight?.impact}</div>
                    <p className="text-[#666] text-sm leading-relaxed">{insight?.description}</p>
                    
                    <button className="mt-4 flex items-center gap-2 text-[#C80000] font-medium hover:text-[#a50000] transition-colors">
                      <span>Mehr erfahren</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          className="py-20 px-4 bg-[#fafafa]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-6xl mx-auto">
            
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Was Creative Professionals <span className="text-[#C80000]">sagen</span>
              </h2>
              <p className="text-lg text-[#666]">
                Erfahre, wie AdRuby Creative Insights Marketing-Teams dabei hilft, bessere Creatives zu entwickeln
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {testimonials?.map((testimonial, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-8 shadow-sm border border-[#e0e0e0]">

                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial?.rating)]?.map((_, i) =>
                  <Star key={i} className="text-[#C80000] fill-current" size={16} />
                  )}
                  </div>
                  
                  <p className="text-[#333] mb-8 leading-relaxed text-lg">"{testimonial?.quote}"</p>
                  
                  <div className="flex items-center gap-4">
                    <img
                    src={testimonial?.avatar}
                    alt={`${testimonial?.author} avatar`}
                    className="w-12 h-12 rounded-full" />

                    <div>
                      <p className="font-bold text-[#000000]">{testimonial?.author}</p>
                      <p className="text-sm text-[#666]">{testimonial?.role}</p>
                      <p className="text-xs text-[#999]">{testimonial?.company}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-24 px-4 bg-gradient-to-br from-[#C80000] to-[#a50000] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-4xl mx-auto text-center">
            
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1]">

              Entdecke kreative Trends{' '}
              <span className="text-white/80">mit AdRuby Insights</span>
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">

              Nutze die Kraft der Creative Intelligence, um Trends frühzeitig zu erkennen und 
              Ads zu entwickeln, die deine Zielgruppe wirklich begeistern.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleStartFreeTrial}
                className="bg-white text-[#C80000] px-10 py-4 rounded-lg font-bold text-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}>

                <Sparkles className="w-6 h-6" />
                Creative Trends erkunden
              </motion.button>
              
              <motion.button
                className="border-2 border-white/30 text-white px-10 py-4 rounded-lg font-bold text-xl hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}>

                <Eye className="w-5 h-5" />
                Insights Demo
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/20">
              <p className="text-lg text-white/80">
                ✓ 2.4M+ analysierte Creatives ✓ Täglich neue Insights ✓ Alle Branchen abgedeckt
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>);

};

export default AdRubyCreativeInsights;
