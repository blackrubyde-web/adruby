import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { emitToast, subscribeToToasts } from '../utils/toastBus';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      const id = toast.id ?? `toast-${Date.now()}-${toastId++}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    });
    return () => unsubscribe();
  }, []);

  const addToast = (toast) => emitToast(toast);
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const clear = () => setToasts([]);

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clear
    }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export default ToastProvider;
