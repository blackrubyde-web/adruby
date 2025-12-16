import React from 'react';
import Routes from './Routes';
import { ToastProvider } from './contexts/ToastContext';
import Toaster from './components/Toaster';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Routes />
      <Toaster />
    </ToastProvider>
  );
};

export default App;
