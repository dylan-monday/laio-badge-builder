# CLAUDE.md — Badge Builder v2

## Project Overview
LA.IO Badge Builder v2 — a React app with Supabase backend for creating embeddable partner badges with an admin analytics dashboard.

**Live domain:** badgebuilder.la.io
**Data start date:** September 1, 2025
**v1 data migrated:** Yes (badge_version = 'v1')

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres DB + Edge Functions)
- **Charts:** Recharts
- **Export:** html-to-image + file-saver
- **Routing:** React Router v6
- **Badge Script:** Vanilla JS (standalone, NOT bundled with React)

## Key Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run format       # Prettier format
npm run migrate      # Run v1 data migration script
```

## Project Structure
```
src/
├── components/
│   ├── builder/        # BuilderPage sections: slug, layout, color, size, export
│   ├── dashboard/      # Admin dashboard: Overview, TimeChart, PartnerLeaderboard, HighlightsFeed
│   ├── badges/         # SVG badge components: Standard, Compact, Wordmark
│   └── ui/             # Shared UI components
├── pages/
│   ├── BuilderPage.jsx # Single-page continuous flow builder
│   └── DashboardPage.jsx # Admin dashboard (all partners)
├── lib/
│   ├── supabase.js     # Supabase client + RPC functions
│   ├── export.js       # PNG/SVG/embed code export utilities
│   └── utils.js        # cn() helper for Tailwind classes
├── App.jsx             # Router: / = builder, /dashboard = admin dashboard
└── main.jsx            # Entry point

public/
├── badge.js            # Standalone embed script (copied to dist/)
├── laio-logo.svg       # LA.IO wordmark logo (teal #67DDDF)
└── fonts/              # Aktiv Grotesk TTF files

supabase/
├── functions/track/    # Edge function for impression/click tracking
└── migrations/         # SQL migrations (001-006)

scripts/
└── migrate-sheets.js   # v1 Google Sheets data migration
```

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | BuilderPage | Badge creation wizard (single-page flow) |
| `/dashboard` | DashboardPage | Admin analytics dashboard (all partners) |

## Design System
Dark theme matching LA.IO brand:
```
Background:  #0b0c10
Card:        #11131a
Text:        #e8f0ff
Subtext:     #b7c0d1
Accent:      #00BAFF (cyan)
Success:     #22c55e
Warning:     #eab308
Error:       #ef4444
```

Typography: Aktiv Grotesk (TTF files in `public/fonts/`), system sans-serif fallback.

## Badge Layouts
1. **Standard** — LA.IO angular arrow logo with full wordmark. ~4:1 horizontal ratio.
2. **Pill** — Compact pill with LA.IO branding and "LOUISIANA INNOVATION" text. ~5.5:1 ratio.
3. **Horizontal** — Full wordmark logo layout (no background). ~6.8:1 wide ratio.

All layouts accept: color (hex), size (s/m/l/auto), partner slug.

## Admin Dashboard Features
- **Overview cards:** Impressions, Clicks, Active Partners, Unique Domains (with trends)
- **Time chart:** Adaptive granularity (daily for 7d/30d, weekly for 90d, monthly for all-time)
- **Partner leaderboard:** Sorted by impressions, expandable rows with mini charts
- **Highlights feed:** New partners, milestone achievements, new domains, top performers

## Supabase RPC Functions
| Function | Purpose |
|----------|---------|
| `get_admin_stats(days)` | Overview card stats across all partners |
| `get_admin_chart_stats(days)` | Time series with adaptive granularity |
| `get_partner_leaderboard(days, limit)` | Partners sorted by impressions |
| `get_admin_highlights(limit)` | Meaningful activity highlights |
| `get_partner_detail(slug, days)` | Expanded row data for leaderboard |

## 15 Preset Badge Colors (Official LA.IO Brand)
From LA.IO.COLORS.RGB.ase — Preferred combo: Dark + Easy
```
Dark:     #101948, #172708, #01233C, #302511, #231F20
Easy:     #E385FE, #C8ED5D, #63DCDE, #F1DC43, #E3E6E7
Electric: #F629CB, #96F90B, #00B9FE, #F5C124, #929497
```

## Validation Rules
- **Slug:** max 50 chars, alphanumeric + spaces/hyphens/underscores
- **Color:** strict #RRGGBB hex, defaults to #101948
- **Size:** whitelist s, m, l, auto — defaults to m
- **Layout:** whitelist standard, pill, horizontal — defaults to standard

## Critical Constraints
- `badge.js` must remain standalone vanilla JS — no React, no imports, no build step
- All v1 embed codes must continue working (`data-layout` defaults to "standard")
- Tracking endpoint handles both POST (sendBeacon) and GET (pixel fallback)
- Admin dashboard is public (no auth required)

## Environment Variables
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

For migration script (in `.env`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Code Style
- Functional components with hooks
- Named exports for components, default export for pages
- Tailwind for all styling (no CSS modules)
- Use `cn()` utility for conditional classes
- Keep components focused — one responsibility per file
