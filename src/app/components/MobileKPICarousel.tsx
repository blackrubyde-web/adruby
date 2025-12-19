import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface KPI {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const kpis: KPI[] = [
  {
    id: 'spend',
    label: 'Total Spend',
    value: '€24.8K',
    sublabel: 'Last 30 days'
  },
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '€186.4K',
    sublabel: 'Last 30 days',
    trend: {
      value: '+12.5%',
      isPositive: true
    }
  },
  {
    id: 'roas',
    label: 'ROAS',
    value: '7.52x',
    sublabel: 'Return on spend',
    trend: {
      value: '+0.8x',
      isPositive: true
    }
  },
  {
    id: 'campaigns',
    label: 'Active',
    value: '24',
    sublabel: 'Campaigns running'
  }
];

export function MobileKPICarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });

    setTimeout(checkScroll, 300);
  };

  return (
    <div className="relative w-full overflow-hidden max-w-full">
      {/* Scroll Indicators - Desktop Only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-card/90 backdrop-blur-sm border border-border/50 rounded-full shadow-lg hover:bg-card transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-card/90 backdrop-blur-sm border border-border/50 rounded-full shadow-lg hover:bg-card transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable Container - MOBILE CONSTRAINED (SAFE WIDTHS) */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 w-full max-w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="flex-shrink-0 w-[88%] max-w-[22rem] md:w-[280px] snap-start"
          >
            <div className="group bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 w-full overflow-hidden">
              {/* Label */}
              <div className="text-sm text-muted-foreground mb-3">
                {kpi.label}
              </div>

              {/* Value - Large & Dominant */}
              <div className="flex items-baseline gap-2 mb-2 flex-wrap min-w-0">
                <div className="text-4xl md:text-5xl font-bold text-foreground group-hover:text-primary transition-colors truncate min-w-0 tabular-nums">
                  {kpi.value}
                </div>
                {kpi.trend && (
                  <div
                    className={`text-sm font-medium flex-shrink-0 ${
                      kpi.trend.isPositive ? 'text-primary' : 'text-destructive'
                    }`}
                  >
                    {kpi.trend.value}
                  </div>
                )}
              </div>

              {/* Sublabel */}
              <div className="text-xs text-muted-foreground truncate">
                {kpi.sublabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicators - Dots */}
      <div className="flex justify-center gap-1.5 mt-4 md:hidden">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.id}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === 0 ? 'bg-primary w-6' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}