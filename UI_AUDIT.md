# AdRuby UI/UX Audit (Premium Cleanup Plan)

## Pages & Layouts
- Dashboard layout usage: `src/layouts/DashboardLayout.jsx` (applied on dashboard routes incl. `overview-dashboard/Overview.tsx`, `ad-ruby-ad-builder`, `ad-ruby-ad-strategies`, `ai-analysis`, `campaigns-management`, `settings-configuration`, etc.).
- Standalone/public pages: `public-landing-home`, `public-pricing-plans`, `public-service-overview`, `login*`, `registration`, `payment-*`, `affiliate`, `seo/*`, `NotFound.jsx`.
- Auth/utility: `secure-logout-process`, `profile-management`, `credits`, `help-support-center`, `payment-verification`.

## UI Components (ui/)
- Core reused: `Header.jsx`, `Sidebar.jsx`, `Button.jsx`, `CreditDisplay.jsx`, `Input.jsx`, `Select.jsx`, `Checkbox.jsx`, `Tooltip.jsx`, `Aurora.jsx`, new `uiPrimitives.js`.
- Cards are page-local (no shared Card component yet). Navigation chrome lives in Header/Sidebar; CreditDisplay is only credit chip.

## Global Styles
- `src/styles/index.css`: Body gradient backdrop, app-shell-surface glass layer. No `bg-app-backdrop` utility yet (needs for layout hook-in).
- `src/styles/tailwind.css`: Dark premium tokens in `:root`; `.dark` currently mirrors same dark theme (no light variant). Cards/foreground/muted defined as rgba for depth.
- Tailwind config present; relies on CSS variables for tokens. Watch for future light-theme split.

## Hardcoded Colors in Pages (sample hotspots)
- `src/pages/ad-ruby-ad-strategies/index.jsx`: heavy `text-white/*`, `bg-white/*`, `bg-green-400`, `hover:bg-[#c32252]` etc.
- `src/pages/ad-ruby-creative-insights/index.jsx`: multiple `#C80000`, `#FAFAFA`, `bg-[#fafafa]`, `text-[#666]`, `text-[#000000]`.
- `src/pages/ad-ruby-ai-analysis/index.jsx`: `#C80000` gradients, `bg-[#FAFAFA]`, `text-[#666]`, `bg-[#f9f9f9]`.
- `src/pages/public-service-overview/index.jsx`: `text-[#E50914]`, `bg-[#E50914]`, `border-[#e0e0e0]` etc.
- `src/pages/seo/*`: broad use of `#C80000`, `#0b0b0b`, `#4a4a4a`, `bg-[#fafafa]`, status dots `bg-[#C80000]`.
- `src/pages/ai-analysis-panel/components/*`: `bg-green-500`, `bg-red-500`, `bg-emerald-500`, `#3B82F6` chart colors.
- `src/pages/ai-analysis/index.jsx`: status badges with `bg-green/red/yellow-500` classes.
- `src/pages/overview-dashboard/Overview.tsx`: (now partly cleaned) but still check for legacy emerald/rose if present in future edits.

## Top 10 Design Problems
1) Inconsistent theme tokens: many pages hardcode `#C80000/#E50914` and whites (`ad-ruby-creative-insights`, `public-service-overview`, `seo/*`), bypassing tokens.
2) Bright-light vs deep-dark clash: public pages use flat white backgrounds; dashboard uses glass-dark -> no unified light/dark strategy.
3) Navigation chrome duplication: Credits sometimes duplicated (header vs sidebar historically); needs single placement (header).
4) Card inconsistency: No shared Card component; pages build ad-hoc borders/shadows (e.g., `ad-ruby-ad-strategies`, `ai-analysis-panel`).
5) Button styles fragmented: page-local buttons with `bg-[#c32252]`, `bg-white/10`, etc.; not using shared Button/Primitives.
6) Status/badge colors hardcoded (greens/reds/yellows) across AI/analysis components and SEO pages.
7) Typography + spacing drift: Pages mix text-white/60, text-[#666], text-[#0b0b0b] without hierarchy standards.
8) Chart color hardcodes: `ai-analysis-panel` metric charts set explicit hex palettes and strokes.
9) Backdrop depth not uniformly applied: Some pages set `min-h-screen bg-[#FAFAFA]`, overriding global backdrop.
10) Missing empty/loading states consistency: Skeletons/empties vary widely; not tied to tokenized surfaces.

## Quick Wins (30–60 min)
- Add `bg-app-backdrop` utility and hook it in DashboardLayout to keep depth visible.
- Replace remaining emerald/rose classes in `Overview.tsx` with primitives/tokens; ensure null-safe KPI formatting.
- Normalize CreditDisplay tooltip to popover tokens (done); ensure reuse in Header only.
- Create/standardize UI primitives (cards/buttons/pills) and start using in Header/Sidebar/Overview.

## System Fixes (1–2 days)
- Sweep hardcoded colors in pages listed above; map to tokens or themed palette.
- Introduce shared Card/Badge components and apply across dashboard/ai-analysis-panel.
- Define light theme tokens (or enforce dark-only) in `tailwind.css` and adjust public pages accordingly.
- Standardize chart color palette via config instead of inline hexes.
- Centralize status badge styles for success/warning/error/neutral.

## Proposed Refactor Order
1) Foundation: Backdrop depth + theme tokens (`index.css`, `tailwind.css`, layout shell).  
2) Primitives: Cards/Buttons/Pills/Text (`uiPrimitives.js`, Button, shared Badge).  
3) Navigation: Header/Sidebar only use primitives; single Credit chip.  
4) Page templates: Apply primitives to Overview, then other dashboard pages.  
5) Hardcode cleanup: Sweep marketing/SEO/public pages to token palette and shared components.
