# CLAUDE.md — Badge Builder v2

## Project Overview
LA.IO Badge Builder v2 — a React app with Supabase backend for creating embeddable partner badges with an admin analytics dashboard.

**Live domain:** https://badgebuilder.la.io
**Hosting:** Vercel (auto-deploys from GitHub)
**Repo:** https://github.com/dylan-monday/laio-badge-builder
**Data start date:** September 22, 2025
**v1 data migrated:** Yes (3,904 events, badge_version = 'v1')

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres DB + Edge Functions)
- **Hosting:** Vercel
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
│   ├── badges/         # SVG badge components: Standard, Pill, Horizontal
│   ├── preview/        # Context previews: Footer, Sidebar, Signature
│   └── AdminLogin.jsx  # Password-protected admin login
│   └── ProtectedRoute.jsx # Auth wrapper for dashboard
├── pages/
│   ├── BuilderPage.jsx # Single-page continuous flow builder
│   └── DashboardPage.jsx # Admin dashboard (password protected)
├── lib/
│   ├── supabase.js     # Supabase client + RPC functions + admin auth
│   ├── validation.js   # Color schemes, validation rules, presets
│   ├── export.js       # PNG/SVG/embed code export utilities
│   └── utils.js        # cn() helper for Tailwind classes
├── App.jsx             # Router: / = builder, /dashboard = admin (protected)
└── main.jsx            # Entry point

public/
├── badge.js            # Standalone embed script (copied to dist/)
├── laio-logo.svg       # LA.IO wordmark logo (teal #67DDDF)
└── fonts/              # Aktiv Grotesk TTF files

supabase/
├── functions/track/    # Edge function for impression/click tracking
└── migrations/         # SQL migrations (001-007)

scripts/
└── migrate-sheets.js   # v1 Google Sheets data migration
```

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | BuilderPage | Badge creation wizard (single-page flow) |
| `/dashboard` | DashboardPage | Admin analytics dashboard (password protected) |

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

### 1. Standard
Full LA.IO angular arrow logo with wordmark. ~4:1 horizontal ratio.
- Single color (any hex)
- Used for: general partner badges

### 2. Pill
Compact pill shape with LA.IO branding and "LOUISIANA INNOVATION" text. ~5.5:1 ratio.
- **Two-color scheme:** Background + foreground from same color family
- Schemes: Easy + Dark or Electric + Dark
- Reversible (light on dark or dark on light)
- Color families: Magenta, Green, Blue, Orange, Gray

### 3. Horizontal
Full wordmark logo layout (no background). ~6.8:1 wide ratio.
- Single color (any hex)
- Used for: minimal/transparent backgrounds

## Pill Badge Two-Color Schemes
```javascript
COLOR_FAMILIES = [
  { name: 'Magenta', dark: '#101948', easy: '#E385FE', electric: '#F629CB' },
  { name: 'Green',   dark: '#172708', easy: '#C8ED5D', electric: '#96F90B' },
  { name: 'Blue',    dark: '#01233C', easy: '#63DCDE', electric: '#00B9FE' },
  { name: 'Orange',  dark: '#302511', easy: '#F1DC43', electric: '#F5C124' },
  { name: 'Gray',    dark: '#231F20', easy: '#E3E6E7', electric: '#929497' },
]
```

Embed code for Pill with two colors:
```html
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="partner-name"
        data-size="m"
        data-bg-color="#01233C"
        data-fg-color="#63DCDE"
        data-layout="pill"></script>
```

## Admin Dashboard Features
- **Password protected** — uses `admin_users` table with bcrypt hashed passwords
- **Overview cards:** Impressions, Clicks, Active Partners, Unique Domains (with trends)
- **Time chart:** Recharts area chart with adaptive granularity (daily/weekly/monthly)
- **Partner leaderboard:** Sorted by impressions, expandable rows with Recharts mini charts
- **Highlights feed:** New partners, milestone achievements, new domains, top performers
- **Sign out button** in header

## Admin Authentication
Simple password auth stored in Supabase:
```sql
-- Add an admin user:
INSERT INTO admin_users (email, password_hash, name)
VALUES ('admin@example.com', crypt('password', gen_salt('bf')), 'Admin Name');

-- Verify password (used by app):
SELECT verify_admin_password('email', 'password');
```

Session stored in localStorage, expires after 24 hours.

## Supabase RPC Functions
| Function | Purpose |
|----------|---------|
| `get_admin_stats(days)` | Overview card stats across all partners |
| `get_admin_chart_stats(days)` | Time series with adaptive granularity |
| `get_partner_leaderboard(days, limit)` | Partners sorted by impressions |
| `get_admin_highlights(limit)` | Meaningful activity highlights |
| `get_partner_detail(slug, days)` | Expanded row data for leaderboard |
| `verify_admin_password(email, password)` | Admin login verification |

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
- Admin dashboard requires password authentication

## Environment Variables
For React app (in `.env`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_BADGE_JS_URL=https://badgebuilder.la.io/badge.js
```

For migration script (in `.env`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

For Vercel (set in dashboard):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Deployment
1. Push to `main` branch on GitHub
2. Vercel auto-deploys to badgebuilder.la.io
3. badge.js is automatically copied to dist/ during build

## Code Style
- Functional components with hooks
- Named exports for components, default export for pages
- Tailwind for all styling (no CSS modules)
- Use `cn()` utility for conditional classes
- Keep components focused — one responsibility per file
