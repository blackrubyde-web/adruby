import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Profil wird geladen...</h2>
        <p className="text-gray-600">Bitte warten Sie einen Moment</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;