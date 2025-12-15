import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import Icon from './AppIcon';

const AUTO_DISMISS_MS = 5000;

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className="bg-slate-900 text-white shadow-lg rounded-lg p-4 flex items-start gap-3 w-80 border border-slate-800">
      <div className="mt-1">
        <Icon name={toast.type === 'error' ? 'AlertTriangle' : 'Info'} size={18} className="text-amber-300" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title || 'Hinweis'}</p>
        {toast.description && <p className="text-xs text-slate-200 mt-1">{toast.description}</p>}
        {toast.onRetry && (
          <button
            className="text-xs mt-2 underline text-amber-200"
            onClick={() => toast.onRetry && toast.onRetry()}
          >
            Erneut versuchen
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-white transition text-sm"
        aria-label="Toast schließen"
      >
        ×
      </button>
    </div>
  );
};

const Toaster = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toaster;
