import * as Sentry from '@sentry/react';

const dsn = import.meta?.env?.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Keep tracing minimal; adjust per environment if needed
    tracesSampleRate: 0.2,
    beforeSend(event) {
      // Avoid sending user PII
      if (event.user) {
        event.user = undefined;
      }
      return event;
    },
    environment: import.meta?.env?.MODE || 'development'
  });
}
