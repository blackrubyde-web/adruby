const cx = (...classes) => classes.filter(Boolean).join(' ');

export const UI = {
  page: 'min-h-screen text-foreground',
  section: 'space-y-6',
  card: 'rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm',
  cardHover: 'hover:bg-card/90 hover:border-border transition',
  cardHeader: 'flex items-start justify-between gap-3',
  h1: 'text-2xl md:text-3xl font-semibold tracking-tight',
  h2: 'text-lg font-semibold tracking-tight',
  meta: 'text-sm text-muted-foreground',
  label: 'text-xs uppercase tracking-wider text-muted-foreground',
  btnPrimary: 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
  btnSecondary: 'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-foreground hover:bg-accent/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
  btnQuiet: 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-accent/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
  pill: 'inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
  pillActive: 'inline-flex items-center rounded-full border border-primary bg-primary/20 text-foreground shadow-sm'
};

// Backward-compatible exports
export const cxCard = `${UI.card} ${UI.cardHover}`;
export const cxCardHeader = `${UI.cardHeader} border-b border-border/70 px-4 py-3`;
export const cxCardTitle = UI.h2;
export const cxCardMeta = UI.meta;
export const cxButtonPrimary = UI.btnPrimary;
export const cxButtonSecondary = UI.btnSecondary;
export const cxButtonQuiet = UI.btnQuiet;
export const cxPill = UI.pill;
export const cxPillActive = UI.pillActive;

export { cx };
