# TestRuby (AdRuby SaaS Starter)

Production-ready Vite + React + Supabase + Netlify Functions starter for the AdRuby SaaS.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure env vars

```bash
cp .env.example .env.local
```

3. Run development server

```bash
npm run dev
```

4. (Optional) Run Netlify functions locally

```bash
npm run dev:netlify
```

## Scripts
- `npm run dev` – start Vite dev server
- `npm run dev:netlify` – Netlify dev with functions
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – lint source
- `npm run format` – format code with Prettier
- `npm run test` – run unit tests (Vitest)
- `npm run typecheck` – run TypeScript checks

## Environment
See `.env.example` for required variables. Do not commit secrets.

## Performance notes
- Use compressed images (WebP/AVIF) and prefer a CDN for production assets.
