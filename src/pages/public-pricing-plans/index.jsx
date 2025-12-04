import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Linkedin, Twitter, Instagram, Shield, CreditCard, Headphones, ArrowRight } from 'lucide-react';
import Header from '../public-landing-home/components/Header';

const PublicPricingPlans = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const handleStartPlan = (planName) => {
    navigate('/ad-ruby-registration', { state: { selectedPlan: planName } });
  };

  const handleFreeTrial = () => {
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

  const pricingPlans = [
    {
      name: 'AdRuby Pro',
      monthlyPrice: 30,
      annualPrice: 25,
      popular: true,
      features: [
        'Von Idee zu laufender Meta Kampagne in Minuten',
        'Unbegrenzte Strategien für deine Produkte und Offers',
        'Hooks, Copy und Creative-Ideen auf Knopfdruck',
        'Meta Setup Empfehlungen & Testing-Frameworks',
        '7 Tage kostenlos testen, danach monatlich kündbar'
      ],
      buttonText: 'Jetzt 7 Tage kostenlos testen',
      description: 'Dein Meta Ads OS: Strategie, Creatives, Setup'
    }
  ];

  const comparisonFeatures = [
    { feature: 'Strategie-Generator', starter: '—', pro: 'Voller Zugriff' },
    { feature: 'Meta Setup Empfehlungen', starter: '—', pro: 'Ja' },
    { feature: 'Hooks & Ad Copy', starter: 'Begrenzt', pro: 'Unlimitiert' },
    { feature: 'Testing-Frameworks', starter: '—', pro: 'Ja, ROAS/CPA-basiert' },
    { feature: 'Credits', starter: 'Add-on', pro: 'Inklusive Basis + Add-on möglich' },
    { feature: 'Support', starter: 'Standard', pro: 'Priorisiert' }
  ];

  const testimonials = [
    {
      name: 'Lena Fischer',
      company: 'D2C Brand',
      image: 'https://images.unsplash.com/photo-1692610310099-97dd0b6f0d73',
      alt: 'Marketing Managerin',
      quote: 'Wir erstellen Strategien und Ads in Minuten statt Tagen. ROAS stabilisiert sich schneller als mit Agentur-Hopping.',
      rating: 5
    },
    {
      name: 'Marc Hoffmann',
      company: 'Performance Agentur',
      image: 'https://images.unsplash.com/photo-1683203438694-b428d712b8da',
      alt: 'Agentur Lead',
      quote: 'AdRuby ist unser Meta-Framework: Copy, Hooks, Setups – weniger Abstimmungen, mehr Tests pro Woche.',
      rating: 5
    },
    {
      name: 'Sarah König',
      company: 'Coaching & Kurse',
      image: 'https://images.unsplash.com/photo-1686434538659-bb72333a1054',
      alt: 'Coach',
      quote: 'Funnel-Plan, Retargeting, Creatives – alles klar strukturiert. Preis ist ein No-Brainer gegen jeden schwachen Kampagnenmonat.',
      rating: 5
    }
  ];

  const faqData = [
    {
      question: 'Wie funktioniert die 7-Tage-Testphase?',
      answer: 'Du startest AdRuby Pro, testest 7 Tage ohne Risiko und kannst jederzeit kündigen. Wenn es passt, läuft der Monat für 30 € weiter.'
    },
    {
      question: 'Kann ich jederzeit kündigen?',
      answer: 'Ja, monatlich kündbar. Du behältst deine Strategien im Account und kannst jederzeit zurückkommen.'
    },
    {
      question: 'Was passiert mit meinen Strategien, wenn ich kündige?',
      answer: 'Sie bleiben gespeichert. Reaktivieren und weiter nutzen ist jederzeit möglich.'
    },
    {
      question: 'Wie funktionieren Credits genau?',
      answer: 'Credits nutzt du für zusätzliche Analysen/Generierungen, wenn du viele Varianten parallel brauchst. Basis-Features bleiben im Abo.'
    },
    {
      question: 'Für wen lohnt sich AdRuby finanziell wirklich?',
      answer: 'Für jede:n, der Meta Ads ernsthaft fährt: 30 € sind weniger als ein schwacher Kampagnenmonat oder ein Agentur-Retainer.'
    },
    {
      question: 'Welche Zahlungsmethoden werden unterstützt?',
      answer: 'Kreditkarte und gängige Zahlungsmethoden über unseren Zahlungsanbieter. Sicher und schnell.'
    }
  ];

  const getCurrentPrice = (plan) => (billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice);

  const getSavings = (plan) => {
    if (billingPeriod === 'annual') {
      const yearlySavings = plan.monthlyPrice * 12 - plan.annualPrice * 12;
      return Math.round(yearlySavings);
    }
    return 0;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const seo = {
      title: 'AdRuby Preise – KI-basiertes Meta Ads OS ab 30 € / Monat',
      description:
        'AdRuby bietet dir ein KI-basiertes Meta Ads OS ab ca. 30 € pro Monat. 7 Tage kostenlos testen, monatlich kündbar, inklusive Strategie-Generator, Ad Copy & Meta Setups.',
      url: 'https://adruby.de/preise',
      image: '/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png'
    };

    const upsertMeta = (key, value, attr = 'name') => {
      if (!value) return;
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    document.title = seo.title;
    upsertMeta('description', seo.description);
    upsertMeta('og:title', seo.title, 'property');
    upsertMeta('og:description', seo.description, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:url', seo.url, 'property');
    upsertMeta('og:image', seo.image, 'property');

    const scriptId = 'adruby-pricing-ldjson';
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = scriptId;
      document.head.appendChild(scriptTag);
    }
    const ldJson = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'AdRuby Pro',
      description: 'KI-basiertes Meta Ads OS für E-Commerce, Agenturen und Coaches.',
      brand: {
        '@type': 'Brand',
        name: 'AdRuby'
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: '30',
        availability: 'https://schema.org/InStock',
        url: seo.url
      }
    };
    scriptTag.textContent = JSON.stringify(ldJson);
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <motion.section
          className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-gray-50 to-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible">

          <div className="max-w-5xl mx-auto text-center space-y-4">
            <motion.h1 variants={itemVariants} className="text-[clamp(2.4rem,6vw,3.6rem)] font-bold text-black">
              Preise für AdRuby – Meta Ads Power ohne Agenturpreise
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-[clamp(1.05rem,3vw,1.3rem)] text-gray-700 max-w-3xl mx-auto leading-relaxed">
              AdRuby kostet weniger als ein schwacher Kampagnenmonat – und gibt dir Strategien, Creatives und Setups, die deinen ROAS und CPA nach vorn bringen. 7 Tage kostenlos testen, danach monatlich kündbar.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={itemVariants} className="flex items-center justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'monthly' ? 'bg-white text-[#E50914] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`
                  }>

                  Monatlich
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'annual' ? 'bg-white text-[#E50914] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`
                  }>

                  Jährlich
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    -20%
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Cards */}
        <motion.section
          className="py-14 sm:py-16 px-4 sm:px-6 lg:px-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) =>
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular ?
                'border-[#E50914] transform lg:scale-105' :
                'border-gray-200 hover:border-gray-300'}`
                }>

                  {plan.popular &&
                <div className="bg-[#E50914] text-white text-center py-3 rounded-t-2xl font-semibold">
                      🔥 Am beliebtesten
                    </div>
                }
                  
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-black">
                          €{getCurrentPrice(plan).toFixed(2)}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{billingPeriod === 'monthly' ? 'Monat' : 'Monat'}
                        </span>
                        {billingPeriod === 'annual' &&
                      <div className="text-sm text-green-600 font-medium mt-1">
                            €{getSavings(plan)} sparen pro Jahr
                          </div>
                      }
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) =>
                    <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                    )}
                    </ul>

                    <button
                    onClick={() => handleStartPlan(plan.name)}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    plan.popular ?
                    'bg-[#E50914] text-white hover:bg-[#B0060F] shadow-lg hover:shadow-xl' :
                    'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'}`
                    }>

                      {plan.buttonText}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Feature Comparison */}
        <motion.section
          className="py-16 sm:py-20 bg-gray-50 px-4 sm:px-6 lg:px-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-5xl mx-auto">
            <motion.h2 variants={itemVariants} className="text-[clamp(2rem,4vw,2.6rem)] font-bold text-center text-black mb-8 sm:mb-12">
              AdRuby Pro im Überblick
            </motion.h2>
            
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Features</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">Starter</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) =>
                    <tr key={index} className="border-b border-gray-100">
                        <td className="px-6 py-4 font-medium text-gray-900">{feature.feature}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{feature.starter}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{feature.pro}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Trust Signals */}
        <motion.section
          className="py-16 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">7-Tage Test</h3>
                <p className="text-gray-600">
                  Starte ohne Risiko. Kündige jederzeit, wenn es nicht passt.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sichere Zahlung</h3>
                <p className="text-gray-600">
                  SSL-verschlüsselt über unseren Zahlungsanbieter.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Headphones className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Support, der versteht</h3>
                <p className="text-gray-600">
                  Hilfe von Leuten, die Meta Ads täglich fahren.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          className="py-20 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-6xl mx-auto px-4">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-black mb-12">
              Was Nutzer:innen an AdRuby schätzen
            </motion.h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) =>
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-xl shadow-lg">

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) =>
                  <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  )}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <img
                    src={testimonial.image}
                    alt={testimonial.alt}
                    className="w-12 h-12 rounded-full object-cover" />

                    <div>
                      <p className="font-semibold text-black">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-20 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-4xl mx-auto px-4">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-black mb-12">
              Häufige Fragen zu Preisen & Testphase
            </motion.h2>
            
            <motion.div variants={itemVariants} className="space-y-4">
              {faqData.map((faq, index) =>
              <motion.div key={index} className="border border-gray-200 rounded-lg">
                  <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors">

                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <motion.div
                    animate={{ rotate: openFaq === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}>

                      <ArrowRight className="text-gray-400" size={20} />
                    </motion.div>
                  </button>
                  
                  <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? 'auto' : 0 }}
                  className="overflow-hidden">

                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          className="py-20 bg-[#E50914] text-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}>

          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold mb-6">
              Bereit, deine Meta Ads profitabel zu skalieren?
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl mb-8 opacity-90">
              AdRuby Pro kostet weniger als ein Agentur-Call – und liefert dir Strategien, Ads und Setups, die ROAS und CPA bewegen.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleFreeTrial}
                className="bg-white text-[#E50914] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">

                Jetzt 7 Tage kostenlos testen
              </button>
              
              <button
                onClick={() => handleStartPlan('Pro')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#E50914] transition-colors duration-300">

                Demo-Video ansehen
              </button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-sm opacity-75 mt-6">
              Keine Kreditkarte erforderlich • 14 Tage Geld-zurück-Garantie • Jederzeit kündbar
            </motion.p>
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
                <Linkedin size={24} />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Twitter size={24} />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Instagram size={24} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>);

};

export default PublicPricingPlans;
