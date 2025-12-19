import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

interface TimeRangeFilterProps {
  onRangeChange: (range: TimeRange) => void;
  onCompareToggle: (compare: boolean) => void;
}

export function TimeRangeFilter({ onRangeChange, onCompareToggle }: TimeRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [isComparing, setIsComparing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const ranges = [
    { value: '7d' as TimeRange, label: 'Last 7 days' },
    { value: '30d' as TimeRange, label: 'Last 30 days' },
    { value: '90d' as TimeRange, label: 'Last 90 days' },
    { value: 'custom' as TimeRange, label: 'Custom range' },
  ];

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleCompareToggle = () => {
    const newValue = !isComparing;
    setIsComparing(newValue);
    onCompareToggle(newValue);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto">
      {/* Range Selector */}
      <div className="relative flex-1 md:flex-initial">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-3 md:px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-all text-left"
        >
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-foreground flex-1 truncate">
            {ranges.find(r => r.value === selectedRange)?.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 w-full md:w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleRangeChange(range.value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                  selectedRange === range.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compare Toggle */}
      <button
        onClick={handleCompareToggle}
        className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all ${
          isComparing
            ? 'bg-primary/10 border-primary/50 text-primary'
            : 'bg-card border-border text-muted-foreground hover:border-primary/50'
        }`}
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          isComparing ? 'bg-primary border-primary' : 'border-border'
        }`}>
          {isComparing && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-xs md:text-sm truncate">Compare to previous</span>
      </button>
    </div>
  );
}