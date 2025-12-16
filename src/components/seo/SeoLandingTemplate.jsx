import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../pages/public-landing-home/components/Header';
import PublicShell from '../ui/PublicShell';
import { UI } from '../ui/uiPrimitives';

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
  sections = [],
}) => {
  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <PublicShell>
          <section id="hero" className="space-y-8 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to={backLinkHref} className="text-sm font-semibold text-primary hover:underline">
                {backLinkLabel}
              </Link>
              {breadcrumb?.length ? (
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {breadcrumb.map((item, idx) => (
                      <li key={item.label} className="flex items-center space-x-1">
                        {item.href ? (
                          <Link to={item.href} className="hover:underline text-foreground">
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-foreground font-semibold">{item.label}</span>
                        )}
                        {idx < breadcrumb.length - 1 ? <span className="text-muted-foreground">›</span> : null}
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </div>

            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-2">
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
                      className={`${UI.btnPrimary} w-full sm:w-auto min-h-[44px] text-center`}
                    >
                      {primaryCtaLabel}
                    </Link>
                  ) : null}
                  {secondaryCtaLabel ? (
                    <Link
                      to={secondaryCtaHref || '#'}
                      className={`${UI.btnSecondary} w-full sm:w-auto min-h-[44px] text-center`}
                    >
                      {secondaryCtaLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="w-full">
                <div className={`${UI.card} ${UI.cardHover} p-6`}>
                  <div className="h-40 md:h-48 rounded-lg border border-dashed border-border/60 bg-card flex items-center justify-center text-sm text-muted-foreground">
                    Visual / Mockup Platzhalter
                  </div>
                </div>
              </div>
            </div>
          </section>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-6">
              <div className="space-y-3 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold">{section.heading}</h2>
                {section.description ? (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                ) : null}
              </div>
              <div>{section.content}</div>
            </section>
          ))}

          <footer className={`${UI.card} p-6 md:p-8`}>
            <div className="grid lg:grid-cols-4 gap-8 md:gap-10">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                    alt="AdRuby Markenlogo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold">AdRuby</span>
                </div>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  KI-basiertes Meta Ads OS für Marketer:innen & Brands. Strategien, Creatives, Copy und Setup in einem Workflow.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold">Produkt</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {['KI-Strategie', 'Ad Generator', 'Meta Setup', 'Analytics', 'API Access'].map((item) => (
                    <a key={item} href="#" className="block hover:text-foreground transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold">Unternehmen</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {['Über uns', 'Blog', 'Karriere', 'Presse', 'Kontakt'].map((item) => (
                    <a key={item} href="#" className="block hover:text-foreground transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-6 border-t border-border/60 text-sm text-muted-foreground gap-4 mt-6">
              <span>© 2025 AdRuby. Alle Rechte vorbehalten.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
                <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
                <a href="#" className="hover:text-foreground transition-colors">AGB</a>
              </div>
            </div>
          </footer>
        </PublicShell>
      </main>
    </>
  );
};

export default SeoLandingTemplate;
