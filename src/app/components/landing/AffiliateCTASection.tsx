import { Briefcase, ArrowRight } from 'lucide-react';
import { PageContainer, Card, SecondaryButton, tokens } from '../design-system';

export function AffiliateCTASection() {
  return (
    <section className={tokens.sectionSpacing}>
      <PageContainer>
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20 text-center max-w-2xl mx-auto">
          <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Earn recurring revenue by sharing AdRuby</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join our affiliate program and earn 30% recurring commission for every customer you refer
          </p>
          <SecondaryButton>
            Learn More About Affiliates
            <ArrowRight className="w-4 h-4 ml-2" />
          </SecondaryButton>
        </Card>
      </PageContainer>
    </section>
  );
}
