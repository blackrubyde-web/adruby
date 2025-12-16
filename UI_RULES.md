# UI Guardrails

- Seiten nutzen `PageShell` für Titel/Subtitle/Actions; keine eigenen Offsets oder Wrapper.
- Keine Hardcoded Colors in Pages/Components: verboten sind `text-white/`, `bg-white/`, `border-white/`, `bg-emerald`, `bg-green`, `bg-rose`, `bg-red`, Hex/`rgb()` in `className`.
- Nur Tokens & Primitives: `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-accent`, `bg-primary`, `bg-secondary`, `bg-popover`, Klassen aus `uiPrimitives`.
- Status & Deltas: Verwende `Badge`/`Delta` (`statusStyles`) statt eigenen Farbchips.
- Charts: packe Charts in `ChartCard`; nutze Formatter aus `chartFormatters`; Empty/Skeleton via `ChartCard`/`EmptyState`.
- Layout: Keine Sidebar-Offsets oder feste `ml-*`/`w-[calc(..)]` in Pages – das Layout regelt `DashboardLayout`.
