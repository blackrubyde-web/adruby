const defaultOrigin = process.env.FRONTEND_URL || '*';

const baseCors = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': defaultOrigin,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Stripe-Signature',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
};

export const withCors = (response = {}) => {
  const headers = { ...baseCors, ...(response.headers || {}) };
  return { ...response, headers };
};

export const ok = (data = {}, statusCode = 200) =>
  withCors({
    statusCode,
    body: JSON.stringify(data)
  });

export const badRequest = (message = 'Bad Request', statusCode = 400) =>
  withCors({
    statusCode,
    body: JSON.stringify({ error: message })
  });

export const serverError = (message = 'Server error', statusCode = 500) =>
  withCors({
    statusCode,
    body: JSON.stringify({ error: message })
  });

export const unauthorized = (message = 'Unauthorized') =>
  withCors({
    statusCode: 401,
    body: JSON.stringify({ error: message })
  });

export const methodNotAllowed = (allowed = 'GET,POST,OPTIONS') =>
  withCors({
    statusCode: 405,
    headers: { Allow: allowed },
    body: JSON.stringify({ error: 'Method not allowed' })
  });
