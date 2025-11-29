import React, { useState } from 'react';
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
    name: 'Starter',
    monthlyPrice: 19.99,
    annualPrice: 15.99,
    popular: false,
    features: [
    '50 KI-Ad-Generierungen / Monat',
    'Zugriff auf Facebook Ads Library Analyse',
    'Basis-Support',
    'Standard-Templates',
    'Performance-Tracking',
    'E-Mail Support'],

    buttonText: 'Jetzt starten',
    description: 'Perfekt für kleine Unternehmen und Einzelunternehmer'
  },
  {
    name: 'Pro',
    monthlyPrice: 39.99,
    annualPrice: 31.99,
    popular: true,
    features: [
    '200 KI-Ad-Generierungen / Monat',
    'Voller Zugriff auf Ad-Analyse + KI-Ad-Builder',
    'Priorisierter Support',
    'Teamfunktion (mehrere User)',
    'Premium Templates',
    'Erweiterte Analytics',
    'API-Zugriff',
    'White-Label Option'],

    buttonText: 'Pro buchen',
    description: 'Ideal für Marketing-Teams und Agenturen'
  }];


  const testimonials = [
  {
    name: "Alexander Müller",
    company: "Digital Marketing Pro",
    image: "https://images.unsplash.com/photo-1692610310099-97dd0b6f0d73",
    alt: "Professional man with brown hair in business suit smiling confidently",
    quote: "Der Pro-Plan hat sich bereits im ersten Monat amortisiert. Unser ROAS ist um 280% gestiegen.",
    rating: 5
  },
  {
    name: "Sophia Wagner",
    company: "E-Commerce Solutions",
    image: "https://images.unsplash.com/photo-1683203438694-b428d712b8da",
    alt: "Professional woman with blonde hair smiling at camera in business attire",
    quote: "Das Preis-Leistungs-Verhältnis ist unschlagbar. Wir sparen 20+ Stunden pro Woche.",
    rating: 5
  },
  {
    name: "Markus Fischer",
    company: "Growth Marketing GmbH",
    image: "https://images.unsplash.com/photo-1686434538659-bb72333a1054",
    alt: "Professional man with dark hair wearing glasses and business suit smiling",
    quote: "Von Anfang an überzeugt. Die KI-Analyse ist präziser als jede manuelle Recherche.",
    rating: 5
  }];


  const faqData = [
  {
    question: "Kann ich meinen Plan jederzeit ändern?",
    answer: "Ja, du kannst jederzeit zwischen den Plänen wechseln. Bei einem Upgrade zahlst du nur die Differenz für den verbleibenden Zeitraum."
  },
  {
    question: "Was passiert, wenn ich mehr als mein monatliches Limit benötige?",
    answer: "Du erhältst eine Benachrichtigung, wenn du 80% deines Limits erreicht hast. Du kannst dann entweder upgraden oder zusätzliche Credits kaufen."
  },
  {
    question: "Gibt es wirklich eine 14-tägige Geld-zurück-Garantie?",
    answer: "Absolut! Wenn du nicht zufrieden bist, erstatten wir dir den vollen Betrag innerhalb von 14 Tagen nach der Anmeldung."
  },
  {
    question: "Welche Zahlungsmethoden akzeptiert ihr?",
    answer: "Wir akzeptieren alle gängigen Kreditkarten, PayPal, SEPA-Lastschrift und Überweisung. Alle Zahlungen sind SSL-verschlüsselt."
  },
  {
    question: "Kann ich den Service vor dem Kauf testen?",
    answer: "Ja! Jeder neue Nutzer erhält 10 kostenlose KI-Ad-Generierungen zum Testen aller Funktionen."
  }];


  const comparisonFeatures = [
  { feature: 'KI-Ad-Generierungen', starter: '50/Monat', pro: '200/Monat' },
  { feature: 'Facebook Ads Library', starter: '✓', pro: '✓' },
  { feature: 'Performance Analytics', starter: 'Basis', pro: 'Erweitert' },
  { feature: 'Support', starter: 'E-Mail', pro: 'Priorisiert' },
  { feature: 'Team-Mitglieder', starter: '1', pro: 'Unbegrenzt' },
  { feature: 'API-Zugriff', starter: '✗', pro: '✓' },
  { feature: 'White-Label', starter: '✗', pro: '✓' }];


  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getCurrentPrice = (plan) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan) => {
    if (billingPeriod === 'annual') {
      const yearlySavings = plan.monthlyPrice * 12 - plan.annualPrice * 12;
      return Math.round(yearlySavings);
    }
    return 0;
  };

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
              Wähle deinen 
              <span className="text-[#E50914]"> BlackRuby</span> Plan
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-[clamp(1.05rem,3vw,1.3rem)] text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Starte mit professionellen KI-generierten Ads und skaliere dein Marketing auf das nächste Level. 
              14 Tage Geld-zurück-Garantie.
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
              Detaillierter Vergleich
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
                <h3 className="text-xl font-semibold mb-2">14-Tage Garantie</h3>
                <p className="text-gray-600">
                  Nicht zufrieden? Geld zurück, ohne Wenn und Aber.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sichere Zahlung</h3>
                <p className="text-gray-600">
                  SSL-verschlüsselt, DSGVO-konform, alle Zahlungsarten.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Headphones className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deutscher Support</h3>
                <p className="text-gray-600">
                  Kompetente Hilfe auf Deutsch, wenn du sie brauchst.
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
              Das sagen unsere Kunden über den Wert
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
              Häufig gestellte Fragen
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
              Starte heute – deine ersten 10 Ads sind kostenlos
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl mb-8 opacity-90">
              Teste BlackRuby risikofrei und entdecke, wie KI-generierte Ads dein Marketing revolutionieren.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleFreeTrial}
                className="bg-white text-[#E50914] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">

                Jetzt kostenlos ausprobieren
              </button>
              
              <button
                onClick={() => handleStartPlan('Pro')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-[#E50914] transition-colors duration-300">

                Direkt zum Pro-Plan
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
