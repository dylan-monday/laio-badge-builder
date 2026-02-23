# LA.IO Badge Builder v2

> Create customizable badges to show you're part of the Louisiana Innovation community.

## Overview

The LA.IO Badge Builder lets partners create embeddable badges for their websites. Built with React + Supabase, featuring an admin analytics dashboard.

**Live:** [badgebuilder.la.io](https://badgebuilder.la.io)

## Features

- **3 Badge Layouts:** Standard, Compact, Wordmark
- **15 Preset Colors** + custom hex input
- **4 Sizes:** Small, Medium, Large, Auto
- **Export Options:** Embed code, SVG, PNG, Markdown
- **Admin Dashboard:** Analytics across all partners
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

## Project Structure

```
src/
├── components/
│   ├── builder/      # Badge creation UI
│   ├── dashboard/    # Admin analytics components
│   └── badges/       # SVG badge components
├── pages/
│   ├── BuilderPage.jsx
│   └── DashboardPage.jsx
└── lib/
    ├── supabase.js   # Database client
    └── export.js     # Export utilities

public/
├── badge.js          # Standalone embed script
└── fonts/            # Aktiv Grotesk TTF

supabase/
└── migrations/       # SQL schema + functions

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

## Badge Embed Code

```html
<script async src="https://badgebuilder.la.io/badge.js"
        data-slug="your-company"
        data-color="#00BAFF"
        data-size="m"
        data-layout="standard"></script>
```

### Parameters

| Attribute | Default | Options |
|-----------|---------|---------|
| `data-slug` | required | Your organization name |
| `data-color` | `#111948` | Any hex color |
| `data-size` | `m` | `s`, `m`, `l`, `auto` |
| `data-layout` | `standard` | `standard`, `compact`, `wordmark` |
| `data-target` | — | Element ID for custom placement |
| `data-track` | enabled | Set to `0` to disable |

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Badge builder |
| `/dashboard` | Admin analytics dashboard |

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Recharts
- html-to-image + file-saver

## License

MIT License — see LICENSE file.

---

**The Future Flows Through Louisiana**

© 2026 Louisiana Economic Development. All Rights Reserved.
