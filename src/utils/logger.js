const isDev = Boolean(import.meta?.env?.DEV);

const makeLogger = (type) => (...args) => {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console[type](...args);
};

export const logger = {
  log: makeLogger('log'),
  info: makeLogger('info'),
  warn: makeLogger('warn'),
  time: makeLogger('time'),
  timeEnd: makeLogger('timeEnd'),
  error: (...args) => {
    // always surface errors
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default logger;
