import { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface GettingStartedChecklistProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  onNavigate?: (page: string) => void;
}

export function GettingStartedChecklist({ onComplete, onDismiss, onNavigate }: GettingStartedChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('checklistProgress');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 'connect-account',
        title: 'Connect your Meta Ads account',
        description: 'Link your Facebook Business account to start tracking campaigns',
        completed: false,
        actionLabel: 'Connect Account'
      },
      {
        id: 'create-campaign',
        title: 'Create your first campaign',
        description: 'Use our AI-powered Ad Builder to launch your first ad',
        completed: false,
        actionLabel: 'Create Campaign'
      },
      {
        id: 'explore-analytics',
        title: 'Explore Analytics workspace',
        description: 'Customize your data views and add performance widgets',
        completed: false,
        actionLabel: 'View Analytics'
      },
      {
        id: 'set-strategy',
        title: 'Set up an AI strategy',
        description: 'Let AI optimize your campaigns with automated rules',
        completed: false,
        actionLabel: 'Browse Strategies'
      }
    ];
  });

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  const handleToggleItem = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    localStorage.setItem('checklistProgress', JSON.stringify(updated));

    // Check if all completed
    if (updated.every(item => item.completed)) {
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }
  };

  const handleAction = (item: ChecklistItem) => {
    // Mark as completed
    handleToggleItem(item.id);

    // Navigate based on action
    if (item.id === 'create-campaign') {
      onNavigate?.('studio');
    } else if (item.id === 'explore-analytics') {
      onNavigate?.('analytics');
    } else if (item.id === 'set-strategy') {
      onNavigate?.('aianalysis');
    } else if (item.id === 'connect-account') {
      onNavigate?.('settings');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('checklistDismissed', 'true');
    onDismiss?.();
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl border-2 border-primary/20 rounded-xl p-6 relative shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 backdrop-blur-sm transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-primary/20 backdrop-blur-sm rounded-lg shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Complete these steps to unlock the full power of AdRuby
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount} of {items.length} completed
          </span>
          <span className="text-xs font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-muted/50 backdrop-blur-sm rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-lg shadow-primary/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 min-w-0 ${item.completed
              ? 'bg-muted/50 border-border/50'
              : 'bg-card/50 border-border/80 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5'
              }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggleItem(item.id)}
              className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-primary rounded transition-transform hover:scale-110"
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in duration-300" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4
                className={`font-medium mb-1 truncate ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
              >
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground break-words">
                {item.description}
              </p>
            </div>

            {/* Action Button */}
            {!item.completed && item.actionLabel && (
              <button
                onClick={() => handleAction(item)}
                className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
              >
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completedCount === items.length && (
        <div className="mt-4 p-3 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg shadow-primary/10 animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-medium text-primary">
            🎉 Great job! You're all set up and ready to scale your ads.
          </p>
        </div>
      )}
    </div>
  );
}