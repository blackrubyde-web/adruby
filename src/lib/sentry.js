import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';

const dsn = import.meta?.env?.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
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
