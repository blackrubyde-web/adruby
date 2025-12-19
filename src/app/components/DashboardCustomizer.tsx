import { Settings, X, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export interface DashboardSection {
  id: string;
  name: string;
  description: string;
  category: 'essential' | 'analytics' | 'advanced';
  isVisible: boolean;
}

interface DashboardCustomizerProps {
  sections: DashboardSection[];
  onToggleSection: (id: string) => void;
  onResetToDefaults: () => void;
}

export function DashboardCustomizer({ sections, onToggleSection, onResetToDefaults }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = {
    essential: { label: 'Essential Metrics', color: 'text-green-500' },
    analytics: { label: 'Analytics & Insights', color: 'text-blue-500' },
    advanced: { label: 'Advanced Features', color: 'text-purple-500' }
  };

  const visibleCount = sections.filter(s => s.isVisible).length;

  const modalContent = isOpen ? (
    <>
      {/* Backdrop - Dark Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal - Centered in Viewport */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl z-[101] animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/95 backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Customize Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Show or hide sections based on your needs
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {Object.entries(categories).map(([key, { label, color }]) => {
            const categorySections = sections.filter(s => s.category === key);
            if (categorySections.length === 0) return null;

            return (
              <div key={key} className="mb-6 last:mb-0">
                <h3 className={`text-sm font-medium ${color} mb-3 flex items-center gap-2`}>
                  <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                  {label}
                </h3>
                <div className="space-y-2">
                  {categorySections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ${section.isVisible ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Toggle Switch */}
                        <button
                          onClick={() => onToggleSection(section.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${section.isVisible ? 'bg-primary' : 'bg-border'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${section.isVisible ? 'translate-x-7' : 'translate-x-1'}`}
                          />
                        </button>

                        {/* Section Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {section.isVisible ? (
                              <Eye className="w-4 h-4 text-primary" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                            <h4 className="font-medium text-foreground">{section.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-card/95 backdrop-blur-xl">
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {visibleCount} sections visible
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Customize Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-all hover:scale-105"
      >
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">Customize Dashboard</span>
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
          {visibleCount}/{sections.length}
        </span>
      </button>

      {/* Portal: Render Modal at document.body */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}