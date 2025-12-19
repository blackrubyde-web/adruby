import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './app/App';
import { env } from './app/lib/env';
import './styles/index.css';

if (env.sentryDsn) {
  Sentry.init({ dsn: env.sentryDsn, tracesSampleRate: 0.1 });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
