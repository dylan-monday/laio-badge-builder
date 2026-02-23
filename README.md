# LA.IO Badge Builder v2

> Create customizable badges to show you're part of the Louisiana Innovation community.

## Overview

The LA.IO Badge Builder lets partners create embeddable badges for their websites. Built with React + Supabase, featuring an admin analytics dashboard.

**Live:** [badgebuilder.la.io](https://badgebuilder.la.io)

## Features

- **3 Badge Layouts:** Standard, Pill (two-color), Horizontal
- **15 Preset Colors** from official LA.IO brand palette + custom hex
- **4 Sizes:** Small, Medium, Large, Auto
- **Export Options:** Embed code, SVG, PNG, Markdown
- **Admin Dashboard:** Password-protected analytics across all partners
- **v1 Compatible:** Existing embed codes continue working

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
```

## Badge Embed Code

### Standard / Horizontal (single color)
```html
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="your-company"
        data-color="#00BAFF"
        data-size="m"
        data-layout="standard"></script>
```

### Pill (two-color scheme)
```html
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="your-company"
        data-bg-color="#01233C"
        data-fg-color="#63DCDE"
        data-size="m"
        data-layout="pill"></script>
```

### Parameters

| Attribute | Default | Options |
|-----------|---------|---------|
| `data-slug` | required | Your organization name |
| `data-color` | `#101948` | Any hex color (Standard/Horizontal) |
| `data-bg-color` | — | Background hex color (Pill only) |
| `data-fg-color` | — | Foreground hex color (Pill only) |
| `data-size` | `m` | `s`, `m`, `l`, `auto` |
| `data-layout` | `standard` | `standard`, `pill`, `horizontal` |
| `data-target` | — | Element ID for custom placement |
| `data-track` | enabled | Set to `0` to disable |

## Project Structure

```
src/
├── components/
│   ├── builder/      # Badge creation UI
│   ├── dashboard/    # Admin analytics components
│   ├── badges/       # SVG badge components (Standard, Pill, Horizontal)
│   └── preview/      # Context previews (Footer, Sidebar, Signature)
├── pages/
│   ├── BuilderPage.jsx
│   └── DashboardPage.jsx
└── lib/
    ├── supabase.js   # Database client + admin auth
    ├── validation.js # Color schemes + validation
    └── export.js     # Export utilities

public/
├── badge.js          # Standalone embed script
└── fonts/            # Aktiv Grotesk TTF

supabase/
└── migrations/       # SQL schema + functions (001-007)

scripts/
└── migrate-sheets.js # v1 data migration
```

## Commands

```bash
npm run dev       # Dev server (localhost:3000)
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # ESLint
npm run format    # Prettier
npm run migrate   # Run v1 data migration
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Badge builder |
| `/dashboard` | Admin analytics dashboard (password protected) |

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Recharts
- html-to-image + file-saver
- Vercel (hosting)

## License

MIT License — see LICENSE file.

---

**The Future Flows Through Louisiana**

© 2026 Louisiana Economic Development. All Rights Reserved.
