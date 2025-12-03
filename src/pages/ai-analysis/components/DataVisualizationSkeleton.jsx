import React from 'react';
import Icon from '../../../components/AppIcon';

const DataVisualizationSkeleton = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Datenvisualisierung Vorschau
      </h2>
      {/* Chart Skeleton */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded animate-pulse" />
            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-20 h-6 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Interaktive Diagramme werden hier angezeigt
            </p>
          </div>
        </div>
      </div>
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3]?.map((item) => (
          <div key={item} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="w-20 h-3 bg-muted rounded animate-pulse mb-2" />
                <div className="w-16 h-5 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Insights Table Skeleton */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Lightbulb" size={20} className="text-muted-foreground" />
          <div className="w-32 h-4 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3, 4]?.map((row) => (
            <div key={row} className="flex items-center space-x-4 py-2">
              <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
              <div className="w-16 h-4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationSkeleton;