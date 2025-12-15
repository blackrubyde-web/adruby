const listeners = new Set();

export const emitToast = (toast) => {
  listeners.forEach((listener) => {
    try {
      listener(toast);
    } catch (err) {
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[toastBus] listener error', err);
      }
    }
  });
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
