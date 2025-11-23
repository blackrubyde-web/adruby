import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import AdBuilderService from '../../../services/adBuilderService';

const AnalysisPanel = ({ 
  marketInsights, 
  generatedAds, 
  isAnalyzing, 
  isGenerating, 
  onSelectAd, 
  selectedAd 
}) => {
  // Progress states
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(45);

  // Progress bar interval effect
  useEffect(() => {
    let interval;
    
    if (isAnalyzing) {
      // Reset progress when analysis starts
      setProgress(0);
      setRemainingTime(45);
      
      // Start interval to update progress
      interval = setInterval(() => {
        setProgress((p) => {
          const newProgress = Math.min(p + 10, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
          }
          return newProgress;
        });
        setRemainingTime((t) => Math.max(t - 3, 0));
      }, 3000);
    } else {
      // Clear interval and reset when analysis stops
      if (interval) clearInterval(interval);
      setProgress(0);
      setRemainingTime(45);
    }

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handlePlanStrategy = async (ad) => {
    if (ad?.id) {
      // Navigate to strategy page
      const strategyUrl = AdBuilderService?.getStrategyPageUrl(ad?.id);
      window.location.href = strategyUrl;
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Market Insights Section */}
      <motion.div 
        className="bg-card border border-border rounded-lg p-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="TrendingUp" size={20} className="mr-2 text-success" />
          Marktanalyse
        </h3>

        {/* Progress Bar Section */}
        {isAnalyzing && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-sm text-muted-foreground mb-2">
              Analyse läuft… geschätzte Dauer: {remainingTime}s
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)]?.map((_, i) => (
                  <div key={i} className="h-3 bg-muted rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isAnalyzing && marketInsights && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Erfolgreiche Hooks</h4>
              <div className="space-y-1">
                {marketInsights?.common_hooks?.slice(0, 3)?.map((hook, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-start">
                    <Icon name="ArrowRight" size={14} className="mr-2 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{hook}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Emotionale Trigger</h4>
              <div className="flex flex-wrap gap-2">
                {marketInsights?.emotional_triggers?.slice(0, 4)?.map((trigger, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-success/10 text-success text-xs rounded-full"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isAnalyzing && !marketInsights && (
          <p className="text-muted-foreground">Starten Sie die Analyse, um Marktinsights zu erhalten.</p>
        )}
      </motion.div>
      {/* Generated Ads Section */}
      <motion.div 
        className="bg-card border border-border rounded-lg p-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Sparkles" size={20} className="mr-2 text-warning" />
          Generierte Anzeigen
        </h3>

        {isGenerating && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                {[...Array(2)]?.map((_, i) => (
                  <div key={i} className="h-3 bg-muted rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isGenerating && generatedAds?.length > 0 && (
          <div className="space-y-4">
            {generatedAds?.map((ad, index) => (
              <motion.div
                key={ad?.id || index}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAd?.id === ad?.id 
                    ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
                }`}
                onClick={() => onSelectAd?.(ad)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      Variante {index + 1}
                    </span>
                    {ad?.conversion_score && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs">
                        <Icon name="TrendingUp" size={12} />
                        <span>{ad?.conversion_score}/100</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handlePlanStrategy(ad);
                      }}
                      className="p-1 text-primary hover:bg-primary/10 rounded"
                      title="Strategie planen"
                    >
                      <Icon name="Target" size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{ad?.headline}</h5>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ad?.primary_text}
                    </p>
                  </div>

                  {ad?.emotional_trigger && (
                    <div className="flex items-center space-x-2">
                      <Icon name="Heart" size={12} className="text-destructive" />
                      <span className="text-xs text-muted-foreground">{ad?.emotional_trigger}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      CTA: {ad?.cta || 'Jetzt kaufen'}
                    </span>
                    {ad?.estimated_ctr && (
                      <span className="text-xs text-success">
                        ~{ad?.estimated_ctr}% CTR
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {generatedAds?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <motion.button
                  onClick={() => handlePlanStrategy(selectedAd || generatedAds?.[0])}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name="Target" size={16} />
                  <span>Strategie planen</span>
                </motion.button>
              </div>
            )}
          </div>
        )}

        {!isGenerating && (!generatedAds || generatedAds?.length === 0) && (
          <div className="text-center py-8">
            <Icon name="Sparkles" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Generierte Anzeigen erscheinen hier</p>
          </div>
        )}
      </motion.div>
      {/* Quick Actions */}
      <motion.div 
        className="bg-card border border-border rounded-lg p-4"
        variants={itemVariants}
      >
        <h4 className="font-medium text-foreground mb-3">Schnellaktionen</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
            <Icon name="Copy" size={16} />
            <span>Text kopieren</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
            <Icon name="Download" size={16} />
            <span>Exportieren</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisPanel;