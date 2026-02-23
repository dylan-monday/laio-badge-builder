# LA.IO Badge Builder v2 — Upgrade Specification

## Status: COMPLETE ✅

All phases implemented. This document preserved for architectural reference.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Badge Builder App (React)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Builder    │  │    Export    │  │  Admin Dashboard   │ │
│  │ (single page)│  │    Modal     │  │   (all partners)   │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     Supabase Backend                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   events     │  │   partners   │  │  Edge Functions    │ │
│  │  (tracking)  │  │  (registry)  │  │  (track endpoint)  │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│                                                              │
│  RPC Functions: get_admin_stats, get_admin_chart_stats,     │
│  get_partner_leaderboard, get_admin_highlights,              │
│  get_partner_detail                                          │
└──────────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────┐      ┌──────────────────────────────────┐
│  Partner Sites   │      │  Embeddable badge.js             │
│  (embed badges)  │      │  (tracks to Supabase endpoint)   │
└──────────────────┘      └──────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Supabase (Postgres + Edge Functions) |
| Charts | Recharts |
| Export | html-to-image + file-saver |
| Badge Script | Vanilla JS (standalone) |

---

## Data Model

### `partners` table
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  badge_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `events` table
```sql
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type TEXT NOT NULL,           -- 'impression' | 'click'
  partner_slug TEXT NOT NULL,
  domain TEXT,
  page_url TEXT,
  badge_layout TEXT DEFAULT 'standard',
  badge_color TEXT,
  badge_size TEXT,
  badge_version TEXT DEFAULT 'v2',    -- 'v1' for migrated data
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Features Implemented

### 1. Badge Builder ✅
- Single-page continuous flow (not multi-step wizard)
- Progressive disclosure — sections unlock as user completes previous
- 3 layouts: Standard, Compact, Wordmark
- 15 preset colors + custom hex input
- 4 sizes: S, M, L, Auto
- Live preview with contrast-aware styling

### 2. Export Modal ✅
- Embed code (script tag)
- SVG download
- PNG download
- Markdown format

### 3. Admin Dashboard ✅
Route: `/dashboard`

**Overview Cards:**
- Total Impressions (with trend)
- Total Clicks (with trend)
- Active Partners (with trend)
- Unique Domains (with trend)

**Time Chart:**
- Adaptive granularity based on range:
  - 7d/30d: daily data points
  - 90d: weekly data points
  - All Time: monthly data points

**Partner Leaderboard:**
- All partners sorted by impressions
- Expandable rows with mini chart + top domains
- Rank badges for top 3

**Highlights Feed:**
- New partner joined
- Milestone achievements (100, 500, 1K, 5K, 10K, 25K, 50K, 100K impressions)
- New domain spotted
- Weekly top performer

### 4. Tracking ✅
- Supabase Edge Function at `/functions/v1/track`
- Handles POST (sendBeacon) and GET (pixel fallback)
- Sub-50ms response time

### 5. v1 Data Migration ✅
- Script: `scripts/migrate-sheets.js`
- Reads CSV from Google Sheets export
- Maps `ts` column to `created_at` timestamps
- Batch inserts 500 rows at a time
- Sets `badge_version = 'v1'` for migrated data
- **Completed:** Historical data from Sept 2025 onward migrated

---

## badge.js Backward Compatibility

All v1 embed codes continue working:

```html
<!-- v1 embed (still works) -->
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="company-name"
        data-color="#00BAFF"
        data-size="m"></script>

<!-- v2 embed (with layout) -->
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="company-name"
        data-color="#00BAFF"
        data-size="m"
        data-layout="compact"></script>
```

**Defaults:**
- `data-layout` → "standard"
- `data-color` → "#111948"
- `data-size` → "m"
- `data-track` → enabled (set to "0" to disable)

---

## SQL Migrations

| File | Purpose |
|------|---------|
| 001_initial.sql | Partners + events tables, indexes, RLS |
| 002_dashboard_functions.sql | Per-partner dashboard RPCs (legacy) |
| 003_admin_dashboard_functions.sql | Admin dashboard RPCs |
| 004_badge_version_column.sql | Adds badge_version column |
| 005_admin_highlights.sql | Highlights feed RPC |
| 006_chart_granularity.sql | Adaptive chart granularity RPC |

---

## Build Phases (All Complete)

### Phase 1: Foundation ✅
- React + Vite + Tailwind setup
- Supabase tables and edge function
- Basic builder with Standard layout
- Tracking wired to Supabase

### Phase 2: Multi-Layout + Export ✅
- Compact and Wordmark layouts
- PNG/SVG export
- Embed code + Markdown

### Phase 3: Analytics Dashboard ✅
- Admin dashboard (all partners view)
- Overview cards with trends
- Time chart with adaptive granularity
- Partner leaderboard with expandable rows
- Highlights feed

### Phase 4: Polish ✅
- Single-page builder flow
- Footer on all routes
- v1 backward compatibility verified
- v1 data migration script
- Documentation updated

---

*Spec version: 2.1*
*Status: Production Ready*
