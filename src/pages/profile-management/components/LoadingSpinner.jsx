import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Profil wird geladen...</h2>
        <p className="text-muted-foreground">Bitte warten Sie einen Moment</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
