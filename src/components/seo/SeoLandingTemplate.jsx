import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../pages/public-landing-home/components/Header';

const SeoLandingTemplate = ({
  eyebrow,
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  backLinkLabel = 'Zur Startseite',
  backLinkHref = '/',
  breadcrumb,
  sections = []
}) => {
  return (
    <>
      <Header />
      <main className="bg-[#fafafa] text-[#0b0b0b]">
        <section
          id="hero"
          className="px-4 md:px-8 lg:px-16 py-12 md:py-16 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to={backLinkHref} className="text-sm font-semibold text-[#C80000] hover:underline">
                {backLinkLabel}
              </Link>
              {breadcrumb?.length ? (
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-1 text-sm text-[#4a4a4a]">
                    {breadcrumb.map((item, idx) => (
                      <li key={item.label} className="flex items-center space-x-1">
                        {item.href ? (
                          <Link to={item.href} className="hover:underline text-[#0b0b0b]">
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-[#0b0b0b] font-semibold">{item.label}</span>
                        )}
                        {idx < breadcrumb.length - 1 ? <span className="text-[#7a7a7a]">›</span> : null}
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </div>
            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C80000]">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-base md:text-lg text-[#2c2c2c] leading-relaxed space-y-2">
                    {subtitle.split('\n').map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {primaryCtaHref && primaryCtaLabel ? (
                    <Link
                      to={primaryCtaHref}
                      className="w-full sm:w-auto inline-flex items-center justify-center bg-[#C80000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a50000] transition-colors min-h-[44px]"
                    >
                      {primaryCtaLabel}
                    </Link>
                  ) : null}
                  {secondaryCtaLabel ? (
                    <Link
                      to={secondaryCtaHref || '#'}
                      className="w-full sm:w-auto inline-flex items-center justify-center border border-[#d4d4d4] text-[#0b0b0b] px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors min-h-[44px]"
                    >
                      {secondaryCtaLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="w-full">
                {/* Placeholder visual area for future illustrations */}
                <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm">
                  <div className="h-40 md:h-48 bg-[#f5f5f5] border border-dashed border-[#dedede] rounded-lg flex items-center justify-center text-sm text-[#7a7a7a]">
                    Visual / Mockup Platzhalter
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="px-4 md:px-8 lg:px-16 py-12 md:py-16 scroll-mt-24"
          >
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl md:text-4xl font-bold">{section.heading}</h2>
                {section.description ? (
                  <p className="text-base md:text-lg text-[#4a4a4a] leading-relaxed">
                    {section.description}
                  </p>
                ) : null}
              </div>
              <div>{section.content}</div>
            </div>
          </section>
        ))}

        <footer className="bg-[#000000] text-white py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-4 gap-12 mb-12">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                    alt="AdRuby Markenlogo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold">AdRuby</span>
                </div>
                <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                  KI-basiertes Meta Ads OS für Marketer:innen & Brands. Strategien, Creatives, Copy und Setup in einem Workflow.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Produkt</h4>
                <div className="space-y-3">
                  {['KI-Strategie', 'Ad Generator', 'Meta Setup', 'Analytics', 'API Access'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Unternehmen</h4>
                <div className="space-y-3">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt'].map((item) => (
                    <a key={item} href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800 text-sm text-gray-400 gap-4">
              <span>© 2025 AdRuby. Alle Rechte vorbehalten.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">Impressum</a>
                <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-white transition-colors">AGB</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default SeoLandingTemplate;
