import { useState } from 'react';
import { Sparkles, Copy, RefreshCw, TrendingUp, Zap, Heart, Brain, Target, Clock, Check, Download, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { creativeAnalyze, creativeGenerate } from '../lib/api/creative';

interface CopyVariant {
  id: number;
  headline: string;
  description: string;
  cta: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'emotional';
  predictedCTR: number;
  predictedCVR: number;
}

interface AIAdCopyGeneratorProps {
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  uniqueSellingPoint?: string;
  strategyId?: string | null;
  onSelectCopy?: (copy: CopyVariant) => void;
}

const toneConfig = {
  professional: { 
    icon: Brain, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10',
    label: 'Professional' 
  },
  friendly: { 
    icon: Heart, 
    color: 'text-green-500', 
    bg: 'bg-green-500/10',
    label: 'Friendly' 
  },
  urgent: { 
    icon: Zap, 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10',
    label: 'Urgent' 
  },
  emotional: { 
    icon: Heart, 
    color: 'text-purple-500', 
    bg: 'bg-purple-500/10',
    label: 'Emotional' 
  },
};

export function AIAdCopyGenerator({ 
  productName = '',
  productDescription = '',
  targetAudience = '',
  uniqueSellingPoint = '',
  strategyId = null,
  onSelectCopy
}: AIAdCopyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<CopyVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState<'all' | 'professional' | 'friendly' | 'urgent' | 'emotional'>('all');

  const toneCycle: CopyVariant['tone'][] = ['professional', 'friendly', 'urgent', 'emotional'];

  const mapToneToBrief = (tone: typeof selectedTone) => {
    switch (tone) {
      case 'professional':
        return 'trustworthy';
      case 'friendly':
        return 'playful';
      case 'urgent':
        return 'bold';
      case 'emotional':
        return 'direct';
      default:
        return 'trustworthy';
    }
  };

  const generateVariants = async () => {
    if (!productName || !targetAudience || !uniqueSellingPoint) {
      toast.error('Bitte Produktname, Zielgruppe und USP ausfüllen.');
      return;
    }

    setIsGenerating(true);
    try {
      const fd = new FormData();
      fd.append('brandName', productName);
      fd.append('productName', productName);
      fd.append('audience', targetAudience);
      fd.append('offer', uniqueSellingPoint);
      fd.append('tone', mapToneToBrief(selectedTone));
      fd.append('goal', 'sales');
      fd.append('language', 'de');
      if (productDescription) fd.append('inspiration', productDescription);
      if (strategyId) fd.append('strategyId', strategyId);

      const analyzed = await creativeAnalyze(fd);
      const generated = await creativeGenerate({
        brief: analyzed.brief,
        hasImage: false,
        strategyId,
      });

      const creatives = generated.output?.creatives || [];
      const newVariants: CopyVariant[] = creatives.map((creative, idx) => {
        const score = creative.score?.value ?? 70;
        const tone = toneCycle[idx % toneCycle.length];
        return {
          id: idx + 1,
          headline: creative.copy.hook,
          description: creative.copy.primary_text,
          cta: creative.copy.cta,
          tone,
          predictedCTR: Number(Math.max(1.5, Math.min(8, score / 12)).toFixed(1)),
          predictedCVR: Number(Math.max(1.2, Math.min(7, score / 14)).toFixed(1))
        };
      });

      setVariants(newVariants);
      setSelectedVariant(null);
      toast.success(`🎉 ${newVariants.length} AI-Varianten generiert`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Copy generation failed';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (variant: CopyVariant) => {
    setSelectedVariant(variant.id);
    if (onSelectCopy) {
      onSelectCopy(variant);
    }
    toast.success(`✅ Copy variant ${variant.id} selected`);
  };

  const handleCopyToClipboard = (variant: CopyVariant) => {
    const text = `Headline: ${variant.headline}\nDescription: ${variant.description}\nCTA: ${variant.cta}`;
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard!');
  };

  const filteredVariants = selectedTone === 'all' 
    ? variants 
    : variants.filter(v => v.tone === selectedTone);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-foreground font-bold">AI Copy Assistant</h3>
            <p className="text-xs text-muted-foreground">AI-powered ad copy generator</p>
          </div>
        </div>

        <Button
          onClick={generateVariants}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity mt-4"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Copy Variants
            </>
          )}
        </Button>
      </div>

      {/* Tone Filter */}
      {variants.length > 0 && (
        <div className="p-4 border-b border-border bg-card">
          <Label className="text-xs text-muted-foreground mb-2 block">Filter by Tone</Label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTone('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTone === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All ({variants.length})
            </button>
            {Object.entries(toneConfig).map(([key, config]) => {
              const count = variants.filter(v => v.tone === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTone(key as typeof selectedTone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedTone === key
                      ? `${config.bg} ${config.color}`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <config.icon className="w-3 h-3" />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Copy Variants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {variants.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm mb-2">No copy variants yet</p>
              <p className="text-xs text-muted-foreground">
                Click "Generate Copy Variants" to get AI-powered suggestions
              </p>
            </div>
          </div>
        ) : (
          filteredVariants.map((variant) => {
            const config = toneConfig[variant.tone];
            const ToneIcon = config.icon;
            
            return (
              <div
                key={variant.id}
                className={`border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-lg ${
                  selectedVariant === variant.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => handleSelectVariant(variant)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
                      <ToneIcon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Variant #{variant.id}</div>
                      <div className={`text-xs ${config.color} font-medium`}>{config.label} Tone</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyToClipboard(variant);
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    {selectedVariant === variant.id && (
                      <div className="p-1.5 bg-primary rounded-lg">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Headline</div>
                    <p className="text-sm font-semibold text-foreground">{variant.headline}</p>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <p className="text-xs text-foreground leading-relaxed">{variant.description}</p>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Call-to-Action</div>
                    <div className="inline-block px-3 py-1 bg-primary rounded-lg">
                      <p className="text-xs font-medium text-primary-foreground">{variant.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Predictions */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                      <div className="text-sm font-bold text-foreground">{variant.predictedCTR}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">CVR</div>
                      <div className="text-sm font-bold text-foreground">{variant.predictedCVR}%</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer - Quick Stats */}
      {variants.length > 0 && (
        <div className="border-t border-border p-4 bg-muted">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Generated {variants.length} variants in 2s</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-card rounded-lg hover:bg-card/80 transition-colors text-foreground">
                <Download className="w-3.5 h-3.5 inline mr-1" />
                Export All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
