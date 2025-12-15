import * as Sentry from '@sentry/node';

let initialized = false;

export const initTelemetry = () => {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV || 'production',
    beforeSend(event) {
      if (event.user) {
        event.user = undefined;
      }
      return event;
    }
  });
  initialized = true;
};

export const captureException = (err, context = {}) => {
  initTelemetry();
  if (!initialized) return;
  Sentry.captureException(err, { extra: context });
};

export default { initTelemetry, captureException };
