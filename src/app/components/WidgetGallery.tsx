import { useState } from 'react';
import { X } from 'lucide-react';

interface WidgetSize {
  id: string;
  name: string;
  dimensions: { w: number; h: number };
  label: string;
}

const WIDGET_SIZES: WidgetSize[] = [
  { id: 'small', name: 'Small', dimensions: { w: 1, h: 1 }, label: '1×1' },
  { id: 'medium-rect', name: 'Medium Rect', dimensions: { w: 2, h: 1 }, label: '2×1' },
  { id: 'medium', name: 'Medium', dimensions: { w: 2, h: 2 }, label: '2×2' },
  { id: 'large', name: 'Large', dimensions: { w: 3, h: 2 }, label: '3×2' },
  { id: 'extra-large', name: 'Extra Large', dimensions: { w: 4, h: 2 }, label: '4×2' },
];

const WIDGET_CATEGORIES = [
  { id: 'stats', name: 'Statistics', icon: '📊' },
  { id: 'charts', name: 'Charts', icon: '📈' },
  { id: 'activity', name: 'Activity', icon: '⚡' },
  { id: 'campaigns', name: 'Campaigns', icon: '🎯' },
];

interface WidgetGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: { id: string; type: string; variant: string; size: { w: number; h: number } }) => void;
}

export function WidgetGallery({ isOpen, onClose, onAddWidget }: WidgetGalleryProps) {
  const [step, setStep] = useState<'size' | 'category' | 'variant'>('size');
  const [selectedSize, setSelectedSize] = useState<WidgetSize | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSizeSelect = (size: WidgetSize) => {
    setSelectedSize(size);
    setStep('category');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('variant');
  };

  const handleVariantSelect = (variantId: string) => {
    if (selectedSize && selectedCategory) {
      onAddWidget({
        id: `widget-${Date.now()}`,
        type: selectedCategory,
        variant: variantId,
        size: selectedSize.dimensions,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('size');
    setSelectedSize(null);
    setSelectedCategory(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'variant') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'category') {
      setStep('size');
      setSelectedSize(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'size' && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">Add Widget</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 'size' && 'Choose widget size'}
                {step === 'category' && 'Choose widget category'}
                {step === 'variant' && 'Choose widget style'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-5rem)]">
          {step === 'size' && (
            <div className="grid grid-cols-3 gap-4">
              {WIDGET_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeSelect(size)}
                  className="group relative aspect-square bg-muted/30 hover:bg-muted/50 border-2 border-border/30 hover:border-primary/50 rounded-3xl transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div
                      className="bg-primary/20 border-2 border-primary/40 rounded-2xl transition-all group-hover:scale-105"
                      style={{
                        width: `${size.dimensions.w * 40}%`,
                        height: `${size.dimensions.h * 40}%`,
                      }}
                    />
                    <div className="mt-4">
                      <div className="text-lg font-bold text-foreground">{size.name}</div>
                      <div className="text-sm text-muted-foreground">{size.label}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'category' && (
            <div className="grid grid-cols-2 gap-4">
              {WIDGET_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group p-8 bg-muted/30 hover:bg-muted/50 border-2 border-border/30 hover:border-primary/50 rounded-3xl transition-all"
                >
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <div className="text-xl font-bold text-foreground">{category.name}</div>
                </button>
              ))}
            </div>
          )}

          {step === 'variant' && (
            <VariantSelector
              size={selectedSize!}
              category={selectedCategory!}
              onSelect={handleVariantSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Variant Selector Component
function VariantSelector({
  size,
  category,
  onSelect,
}: {
  size: WidgetSize;
  category: string;
  onSelect: (variantId: string) => void;
}) {
  const getVariants = () => {
    // Return different variants based on category and size
    const variants: { id: string; name: string; preview: React.ReactNode }[] = [];

    if (category === 'stats' && size.id === 'small') {
      variants.push(
        {
          id: 'stats-minimal',
          name: 'Minimal',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl flex flex-col justify-between">
              <div className="text-sm text-muted-foreground">Impressions</div>
              <div className="text-2xl font-bold">2.4M</div>
            </div>
          ),
        },
        {
          id: 'stats-gradient',
          name: 'Gradient',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent rounded-2xl border border-purple-500/20 flex flex-col justify-between">
              <div className="text-xs text-muted-foreground">CTR</div>
              <div className="text-3xl font-bold">3.72%</div>
            </div>
          ),
        },
        {
          id: 'stats-icon',
          name: 'With Icon',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl flex flex-col justify-between">
              <div className="w-8 h-8 bg-green-500/30 rounded-xl flex items-center justify-center text-green-400">$</div>
              <div>
                <div className="text-2xl font-bold">4.8x</div>
                <div className="text-xs text-muted-foreground">ROAS</div>
              </div>
            </div>
          ),
        }
      );
    }

    if (category === 'charts' && size.id === 'medium') {
      variants.push(
        {
          id: 'chart-line',
          name: 'Line Chart',
          preview: (
            <div className="w-full h-full p-4 bg-card/60 rounded-2xl border border-border/30">
              <div className="text-sm font-semibold mb-2">Performance</div>
              <div className="h-20 flex items-end gap-1">
                {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'chart-area',
          name: 'Area Chart',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-2xl border border-indigo-500/20">
              <div className="text-sm font-semibold mb-2">Trends</div>
              <div className="h-20 bg-gradient-to-t from-indigo-500/40 to-transparent rounded-lg" />
            </div>
          ),
        }
      );
    }

    if (category === 'activity' && size.id === 'medium') {
      variants.push(
        {
          id: 'activity-bars',
          name: 'Activity Bars',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl border border-orange-500/20">
              <div className="text-sm font-semibold mb-3">Weekly Activity</div>
              <div className="space-y-2">
                {[85, 92, 78].map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted/20 rounded-full">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${v}%` }} />
                    </div>
                    <span className="text-xs">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'activity-gauge',
          name: 'Performance Gauge',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-teal-500/20 to-transparent rounded-2xl border border-teal-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">94</div>
                <div className="text-xs text-muted-foreground mt-1">Score</div>
              </div>
            </div>
          ),
        }
      );
    }

    if (category === 'campaigns' && size.id === 'large') {
      variants.push(
        {
          id: 'campaigns-list',
          name: 'Campaign List',
          preview: (
            <div className="w-full h-full p-4 bg-card/60 rounded-2xl border border-border/30">
              <div className="text-sm font-semibold mb-3">Active Campaigns</div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="p-2 bg-muted/30 rounded-lg">
                    <div className="text-xs font-medium">Campaign {i}</div>
                    <div className="h-1 bg-muted/30 rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'campaigns-cards',
          name: 'Campaign Cards',
          preview: (
            <div className="w-full h-full p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
              <div className="text-sm font-semibold mb-3">Campaigns</div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-xl text-center">
                    <div className="text-lg font-bold">{i * 5}K</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                ))}
              </div>
            </div>
          ),
        }
      );
    }

    return variants;
  };

  const variants = getVariants();

  return (
    <div className="grid grid-cols-2 gap-6">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => onSelect(variant.id)}
          className="group relative aspect-square bg-muted/20 hover:bg-muted/40 border-2 border-border/30 hover:border-primary/50 rounded-3xl transition-all overflow-hidden p-8"
        >
          <div className="w-full h-full mb-4">{variant.preview}</div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <div className="text-sm font-semibold text-foreground bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              {variant.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
