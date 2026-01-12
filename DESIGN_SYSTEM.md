# AdRuby Design System

**Version:** 1.0  
**Last Updated:** January 2026

---

## Typography Scale

All typography utilities are responsive and theme-aware. Use these instead of hardcoded text sizes.

### Headings

| Class | Usage | Size (mobile → desktop) | Weight |
|-------|-------|------------------------|--------|
| `.text-h1` | Page titles | 2.5rem → 3rem | 800 |
| `.text-h2` | Section titles | 2rem → 2.5rem | 700 |
| `.text-h3` | Subsections | 1.5rem → 1.875rem | 600 |
| `.text-h4` | Card titles | 1.25rem → 1.5rem | 600 |
| `.text-h5` | Small headings | 1.125rem → 1.25rem | 500 |
| `.text-h6` | Labels/overlines | 0.875rem | 600 (uppercase) |

### Body Text

| Class | Usage | Size |
|-------|-------|------|
| `.text-body-lg` | Large body text | 1.125rem |
| `.text-body` | Default body text | 1rem |
| `.text-body-sm` | Small body text | 0.875rem |
| `.text-caption` | Captions, footnotes | 0.75rem |

**Example:**
```tsx
<h1 className="text-h1">Dashboard</h1>
<h2 className="text-h2">Overview</h2>
<p className="text-body-sm text-muted-foreground">Your performance at a glance</p>
```

---

## Token System

### Border Radius

Use CSS variables for consistent border radius across components.

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-xs` | 6px | Small chips, badges |
| `--radius-sm` | 8px | Buttons, inputs |
| `--radius-md` | 12px | Cards, modals (default) |
| `--radius-lg` | 16px | Large cards |
| `--radius-xl` | 24px | Hero sections |
| `--radius-full` | 9999px | Pills, avatars |

**Example:**
```tsx
<div style={{ borderRadius: 'var(--radius-md)' }}>
```

### Shadows

| Variable | Usage |
|----------|-------|
| `--shadow-xs` | Subtle elevation |
| `--shadow-sm` | Small cards |
| `--shadow-md` | Standard cards |
| `--shadow-lg` | Modals, popovers |
| `--shadow-xl` | Hero elements |
| `--shadow-warm` | Ruby-tinted (brand) |
| `--shadow-glass` | Glassmorphism |

**Example:**
```tsx
<div style={{ boxShadow: 'var(--shadow-lg)' }}>
```

---

## Component Library

### Badge

**Import:** `import { Badge } from './ui/badge'`

**Variants (8 total):**
- `default` - Primary brand color
- `secondary` - Muted gray
- `destructive` - Error/danger
- `outline` - Bordered
- `success` - Green
- `warning` - Yellow
- `info` - Blue
- `purple` - Purple

**Icon Support:**
```tsx
<Badge variant="success" icon={<CheckIcon />}>
  Active
</Badge>
```

### Card

**Import:** `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'`

**Variants:**
- `default` - Standard card
- `glass` - Glassmorphism effect
- `flat` - No shadow
- `feature` - Highlighted feature card

**Example:**
```tsx
<Card variant="glass">
  <CardHeader>
    <CardTitle className="text-h4">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Button

**Import:** `import { Button } from './ui/button'`

**Variants:** `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`  
**Sizes:** `default`, `sm`, `lg`, `icon`

---

## Migration Guide

### From Old to New

**Typography:**
```tsx
// ❌ Old
<h2 className="text-2xl font-bold tracking-tight">Title</h2>
<p className="text-sm text-muted-foreground">Description</p>

// ✅ New
<h2 className="text-h3">Title</h2>
<p className="text-body-sm text-muted-foreground">Description</p>
```

**Deprecated Components:**
```tsx
// ❌ Old (deprecated)
import { Card } from './layout/Card'
import { Badge } from './layout/Badge'
import { Chip } from './layout/Chip'

// ✅ New
import { Card } from './ui/card'
import { Badge } from './ui/badge'
// Chip is now Badge with icon prop
```

---

## Layout System

### Grid Variables

| Variable | Value | Usage |
|----------|-------|-------|
| `--header-height` | 64px | Fixed header |
| `--sidebar-width-collapsed` | 80px | Collapsed sidebar |
| `--sidebar-width-expanded` | 256px | Expanded sidebar |

### Container Widths

| Variable | Value | Usage |
|----------|-------|-------|
| `--container-width-sm` | 1200px | Standard content |
| `--container-width-md` | 1400px | Wide content |
| `--container-width-lg` | 1600px | Full-width |

---

## Best Practices

### ✅ Do
- Use typography utilities for consistent sizing
- Use CSS variables for radius/shadows
- Import components from `ui/*`
- Follow responsive patterns (mobile-first)

### ❌ Don't
- Hardcode text sizes (`text-2xl`, `text-lg`)
- Use `layout/*` components (deprecated)
- Mix design systems (use one set of utilities)
- Override with inline `!important`

---

## Support

Questions? Check:
1. This documentation
2. Existing components (`src/app/components/ui/*`)
3. Phase 3 pilot (OverviewPage.tsx)
