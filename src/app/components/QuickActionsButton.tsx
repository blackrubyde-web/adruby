import { Plus, Pause, Play, Download, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface QuickActionsButtonProps {
  onCreateCampaign?: () => void;
  onCreateAd?: () => void;
}

export function QuickActionsButton({ onCreateCampaign, onCreateAd }: QuickActionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const createHandler = onCreateAd ?? onCreateCampaign ?? (() => {});

  const actions = [
    { icon: <Plus className="w-4 h-4" />, label: 'Create Campaign', color: 'text-green-500', onClick: createHandler },
    { icon: <Pause className="w-4 h-4" />, label: 'Pause All', color: 'text-yellow-500', onClick: () => {} },
    { icon: <Play className="w-4 h-4" />, label: 'Resume All', color: 'text-blue-500', onClick: () => {} },
    { icon: <Download className="w-4 h-4" />, label: 'Export Report', color: 'text-purple-500', onClick: () => {} },
    { icon: <RefreshCw className="w-4 h-4" />, label: 'Refresh Data', color: 'text-primary', onClick: () => {} },
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            {isOpen ? (
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
        </button>

        {/* Action Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-3 md:mb-4 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-end gap-2 md:gap-3 group/item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Label - Hidden on small mobile */}
                <div className="hidden sm:block px-3 md:px-4 py-1.5 md:py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-xs md:text-sm text-foreground font-medium">{action.label}</span>
                </div>

                {/* Icon Button */}
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center hover:border-primary/50"
                >
                  <div className={action.color}>
                    {action.icon}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
