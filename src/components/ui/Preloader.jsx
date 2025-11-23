import React from 'react';
import { Loader2 } from 'lucide-react';

const Preloader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {message}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we load your dashboard
        </p>
      </div>
    </div>
  );
};

export default Preloader;