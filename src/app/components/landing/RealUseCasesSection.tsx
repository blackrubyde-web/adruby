import { PageContainer, SectionHeader, Card, Badge, tokens } from '../design-system';

export function RealUseCasesSection() {
  const useCases = [
    {
      title: 'E-commerce Product Launch',
      scenario: 'New sneaker collection launch with limited budget',
      generated: '12 ad variations tested, AI predicts 4.2% CTR',
      result: '€42,000 revenue, 6.8x ROAS in first week',
      ctr: '4.2%',
      roas: '6.8x',
    },
    {
      title: 'Online Coach Lead Generation',
      scenario: 'Fitness coach needs qualified leads for high-ticket program',
      generated: '8 lead magnet ads with different angles',
      result: '247 qualified leads, €12.50 cost per lead',
      ctr: '5.1%',
      roas: '9.2x',
    },
    {
      title: 'SaaS Free Trial Ads',
      scenario: 'B2B SaaS needs to scale user acquisition',
      generated: '15 benefit-focused variations for decision-makers',
      result: '1,200+ trial signups, 18% trial-to-paid conversion',
      ctr: '2.9%',
      roas: '5.4x',
    },
    {
      title: 'Local Service Ads',
      scenario: 'Restaurant wants to fill tables during slow hours',
      generated: '6 limited-time offer variations',
      result: '320 reservations in 2 weeks, fully booked',
      ctr: '7.8%',
      roas: '15.2x',
    },
  ];

  return (
    <section className={tokens.sectionSpacing}>
      <PageContainer>
        <SectionHeader title="Real use cases" subtitle="See how different businesses use AdRuby" />

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
              <h3 className="font-bold text-lg mb-3">{useCase.title}</h3>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scenario</p>
                  <p className="text-sm">{useCase.scenario}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    What AI Generated
                  </p>
                  <p className="text-sm text-primary font-medium">{useCase.generated}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Result</p>
                  <p className="text-sm font-semibold text-green-600">{useCase.result}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/60">
                <Badge variant="success">CTR {useCase.ctr}</Badge>
                <Badge variant="purple">ROAS {useCase.roas}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
