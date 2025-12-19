import { Database, TrendingUp, Shield } from 'lucide-react';
import { PageContainer, SectionHeader, Card, tokens } from '../design-system';

export function AITrustSection() {
  return (
    <section className={tokens.sectionSpacing + ' bg-muted/30'}>
      <PageContainer>
        <SectionHeader
          title="Why you can trust AdRuby's AI"
          subtitle="Transparency and continuous improvement"
        />

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
            <Database className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Trained on millions of ads</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our AI learns from 10M+ high-performing ads across industries, platforms, and audiences
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Continuously learns</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every campaign feeds back into the system, improving predictions in real-time
            </p>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">No black box</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See exactly why AI suggests changes and which data points drive each prediction
            </p>
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}
