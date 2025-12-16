# Overview Dashboard (React + TypeScript + Vite)

Interaktives Analytics-Dashboard mit animierten Recharts, react-table, Date/Timezone-Auswahl, Mock-API und Live-Update-Simulation. Alle Fetch/WS-Stellen sind markiert und können schnell gegen echte Endpunkte getauscht werden.

## Setup
- `npm install`
- `npm run dev` (lokal)
- `npm test` (Jest + RTL, jsdom)

## Wichtige Dateien
- `src/pages/Overview.tsx` – Hauptseite (Grid, KPIs, Charts, Tabelle, Exporte)
- `src/components/*` – Header, DateRangePicker, Charts, MetricCard, DataTable
- `src/hooks/useMockApi.ts` – Mock-Fetch + Mock-WebSocket **// TODO: INTEGRATE REAL API**
- `src/api/types.ts` – TypeScript Contracts
- `src/api/schema.json` – JSON-Schema für REST/WS
- `src/utils/dateUtils.ts` – Presets, Zeitzonen, Formatierung
- `src/utils/export.ts` – CSV/PNG Export
- `tests/overview.test.tsx` – Beispieltest (KPI-Render)

## Daten-Contract (Kurzfassung)
Siehe `src/api/schema.json`.
- REST: `GET /api/overview/metrics?start=ISO&end=ISO&tz=Europe/Berlin`
  - `kpis`: `{ ctr|conversion_rate|roas: { value:number, delta:number } }`
  - `timeSeries[]`: `{ timestamp, ctr, conversions, roas, impressions, cost }`
  - `topCampaigns[]`: `{ id, name, spend, revenue, ctr, conversions }`
  - `sessionsByDevice[]`: `{ device, sessions }`
- WebSocket Events:
  - `updateTimeseries` (payload wie einzelner `timeSeries`-Datensatz)
  - `metricsUpdate` (Partial `kpis`)
  - `tableUpdate` (Partial `topCampaigns`-Row)

## Echte Endpunkte anbinden
1) REST:
   - In `src/hooks/useMockApi.ts` den Block `// TODO: INTEGRATE REAL API` durch echten `fetch` ersetzen (auth header etc.).
   - Verwende `OverviewFilters` (start/end/tz) für Query-Params.
2) WebSocket:
   - Im selben File MockWebSocket durch echten WS-Client ersetzen.
   - Events `updateTimeseries | metricsUpdate | tableUpdate` dispatchen.
3) Daten in Komponenten:
   - `Overview.tsx` bezieht alles aus `useMockApi(range)`. Keine weiteren Änderungen nötig, solange die Response dem Schema folgt.

## Live-Updates & Animation
- Recharts mit Legend-Toggle, Tooltip, Brush/Zoom, Auto-Scale.
- Mock-WebSocket pusht regelmäßige Updates (siehe `useMockApi`).

## Export
- Charts: `exportNodeToPng` (html-to-image), Buttons in `Overview.tsx`.
- Tabellen: `exportTableToCsv` (papaparse), Button in `DataTable`.

## Tests
- `npm test` nutzt Jest + ts-jest + RTL (`tests/overview.test.tsx`).

## Theming & Accessibility
- Tailwind-Klassen, Darkmode-kompatibel, Fokus-Styles auf interaktiven Controls.
