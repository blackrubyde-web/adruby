import { Clock, AlertCircle, TrendingDown, Zap, TrendingUp, Sparkles, CheckCircle, X } from 'lucide-react';
import { PageContainer, SectionHeader, Card, tokens } from '../design-system';

export function BeforeAfterSection() {
  return (
    <section className={tokens.sectionSpacing + ' bg-muted/30'}>
      <PageContainer>
        <SectionHeader
          title="Before vs After AdRuby"
          subtitle="The difference between manual and AI-powered ad creation"
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg">Without AdRuby</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">2-3 hours per ad</p>
                    <p className="text-xs text-muted-foreground">Manual copywriting and guesswork</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">No performance predictions</p>
                    <p className="text-xs text-muted-foreground">Launch blindly and hope for the best</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Limited variations</p>
                    <p className="text-xs text-muted-foreground">Test 1-2 creatives maximum</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm font-semibold text-red-600">Slow, expensive, unpredictable</p>
              </div>
            </div>
          </Card>

          {/* After */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-lg">With AdRuby</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">5 minutes per campaign</p>
                    <p className="text-xs text-muted-foreground">AI generates 10+ variations instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">94% confidence predictions</p>
                    <p className="text-xs text-muted-foreground">Know which ads will perform before launch</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Unlimited variations</p>
                    <p className="text-xs text-muted-foreground">Test dozens of creatives effortlessly</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-sm font-semibold text-green-600">Fast, affordable, data-driven</p>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}
