import { Card } from './ui/card';
import { ThumbsUp, MessageCircle, Share2, Eye } from 'lucide-react';

interface AdPreviewProps {
  copy?: {
    headline: string;
    description: string;
    cta: string;
  };
  productName?: string;
}

export function AdPreview({ copy, productName }: AdPreviewProps) {
  const defaultHeadline = 'Deine Ad Headline...';
  const defaultDescription = 'Deine Ad Copy wird hier in Echtzeit angezeigt...';
  const defaultCta = 'Jetzt kaufen';

  const headline = copy?.headline || defaultHeadline;
  const description = copy?.description || defaultDescription;
  const cta = copy?.cta || defaultCta;

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-medium">Live-Vorschau</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>Facebook Feed</span>
        </div>
      </div>

      {/* Facebook Ad Preview */}
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Ad Header */}
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">
              {productName ? productName.charAt(0) : 'B'}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">
              {productName || 'Ihr Unternehmen'}
            </div>
            <div className="text-xs text-gray-500">Gesponsert · 🌐</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Ad Copy */}
        <div className="px-3 pb-3">
          <p className="text-gray-900 text-sm leading-relaxed">{headline}</p>
          <p className="text-gray-900 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Ad Image Placeholder */}
        <div className="bg-gradient-to-br from-black via-gray-800 to-[#C80000] h-64 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C80000] opacity-20"></div>
          <div className="text-center text-white relative z-10">
            <div className="text-6xl mb-2">📱</div>
            <p className="text-sm opacity-90 font-medium">Dein Ad Creative</p>
          </div>
        </div>

        {/* Ad CTA */}
        <div className="p-3 bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">{productName ? productName.toLowerCase().replace(/\s+/g, '') : 'yourwebsite'}.com</div>
          <button className="w-full bg-[#C80000] hover:bg-[#A00000] text-white font-medium py-2 px-4 rounded text-sm transition-colors">
            {cta}
          </button>
        </div>

        {/* Engagement Bar */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between text-gray-500">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-[#C80000] transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">Gefällt mir</span>
            </button>
            <button className="flex items-center gap-1 hover:text-[#C80000] transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Kommentieren</span>
            </button>
            <button className="flex items-center gap-1 hover:text-[#C80000] transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-xs">Teilen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          💡 Dies ist eine Live-Vorschau. Änderungen werden in Echtzeit angezeigt.
        </p>
      </div>
    </Card>
  );
}