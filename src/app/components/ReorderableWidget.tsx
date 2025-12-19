import { ChevronUp, ChevronDown } from 'lucide-react';

interface ReorderableWidgetProps {
  id: string;
  index: number;
  totalCount: number;
  children: React.ReactNode;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  className?: string;
}

export function ReorderableWidget({ 
  id: _id, 
  index, 
  totalCount, 
  children, 
  onMoveUp, 
  onMoveDown, 
  className = '' 
}: ReorderableWidgetProps) {
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div className={`${className} relative group`}>
      {/* Reorder Controls - Top Right Corner - Hidden on Mobile */}
      <div className="hidden md:flex absolute top-3 right-3 z-10 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {/* Move Up Button */}
        <button
          onClick={() => onMoveUp(index)}
          disabled={isFirst}
          className={`
            p-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg
            hover:bg-card hover:border-primary/50 hover:scale-110
            active:scale-95
            shadow-lg
            transition-all duration-200
            ${isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isFirst ? 'Already at top' : 'Move up'}
        >
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Move Down Button */}
        <button
          onClick={() => onMoveDown(index)}
          disabled={isLast}
          className={`
            p-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg
            hover:bg-card hover:border-primary/50 hover:scale-110
            active:scale-95
            shadow-lg
            transition-all duration-200
            ${isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isLast ? 'Already at bottom' : 'Move down'}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {children}
    </div>
  );
}
