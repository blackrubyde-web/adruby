import { PageContainer, tokens } from '../design-system';

export function SEOContentSection() {
  return (
    <section className={tokens.sectionSpacing + ' bg-muted/30'}>
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What is AdRuby?</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            AdRuby is an AI-powered ad creative platform that helps marketers, founders, and agencies generate
            high-performing Facebook and Instagram ads in minutes. Our advanced AI analyzes your product or service and
            creates multiple ad variations optimized for clicks, conversions, and ROAS.
          </p>

          <h3 className="text-xl font-bold mb-3 mt-8">How does AI ad generation work?</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Simply describe your offer, select your platform and goal, and our AI generates headlines, primary text,
            and CTAs tailored to your audience. Each variation includes performance predictions based on millions of
            historical ad data points.
          </p>

          <h3 className="text-xl font-bold mb-3 mt-8">Who uses AdRuby?</h3>
          <p className="text-muted-foreground leading-relaxed">
            AdRuby is used by solo founders, performance marketers, and digital agencies who want to scale their ad
            creation process without sacrificing quality. Whether you're launching a product, generating leads, or
            driving traffic, AdRuby helps you create better ads faster.
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
