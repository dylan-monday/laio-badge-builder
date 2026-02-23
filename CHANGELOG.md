# Changelog

All notable changes to the LA.IO Badge Builder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-12

### Changed - Mobile & Desktop UI Refresh

#### Mobile Experience
- **Sticky preview panel** — Preview now stays fixed at top while options scroll underneath
- **Combined header + preview** — Single sticky block eliminates gap where content could peek through
- **Preview mode toggles** — Badge, Footer, Sidebar, Signature views accessible on mobile
- **Real-time size updates** — Wordmark and all badge types now reflect size changes in preview
- **Stronger shadow** — Clear visual separation between sticky area and scrolling content

#### Typography & Sizing
- Reduced font sizes across mobile and desktop for a more compact, modern feel
- Smaller header with LA.IO logo
- Tighter spacing throughout form sections
- Smaller color swatches and radio buttons

#### Brand Updates
- **Official LA.IO brand colors** — Updated all 15 preset colors to match official palette
- **New logo** — Added `/public/laio-logo.svg` in teal (#67DDDF)
- **Header redesign** — LA.IO wordmark logo with "Badge Builder" subtitle

#### Color Palette (Official LA.IO Brand)
```
Dark:   #111948, #1A2706, #07233C, #312511, #231F20
Bright: #F927CC, #99FA04, #00BAFF, #F7C223, #929497
Pastel: #E885FF, #CBEE5D, #67DDDF, #F4DD42, #E6E7E8
```

#### Desktop
- Reduced preview panel height and padding
- Smaller toggle buttons and config summary text
- Adjusted sticky positioning

---

## [1.0.0] - 2025-11-21

### Added - Initial Release

#### Security
- Input validation and sanitization for all user inputs
- XSS protection with HTML escaping
- Content Security Policy (CSP) implementation
- Secure slug validation (alphanumeric, hyphens, underscores only)
- Strict hex color validation (#RRGGBB format)
- Size whitelist validation
- Target ID sanitization
- Security documentation (SECURITY.md)

#### Typography & Design
- Aktiv Grotesk font integration (Light, Regular, Semi-Bold, Bold)
- Custom font loading with font-display: swap
- Professional color palette with CSS custom properties
- Smooth transitions and animations throughout
- Responsive design (320px to 4K+)
- Mobile-first approach with breakpoints at 860px and 480px

#### User Experience
- Real-time preview updates
- Live validation feedback with color-coded messages
- Tooltips on color swatches showing hex values
- Keyboard shortcuts:
  - ⌘/Ctrl + K: Focus organization name
  - ⌘/Ctrl + C: Copy embed code
  - 1, 2, 3: Quick size selection
- Arrow key navigation for swatches and sizes
- Staggered fade-in animations on page load
- Enhanced copy button with validation
- Collapsible help section

#### Accessibility
- WCAG 2.1 AA compliant
- Full keyboard navigation support
- ARIA labels and live regions
- Screen reader compatibility
- Semantic HTML structure
- Visible focus indicators (keyboard-only)
- Proper heading hierarchy
- Touch-friendly targets (44x44px minimum)

#### Features
- 15 preset LA.IO brand colors
- Custom hex color input
- Three badge sizes (Small, Medium, Large)
- Organization name customization
- One-click embed code copy
- Badge preview with real-time updates
- Optional tracking via Google Apps Script
- SPA-friendly badge persistence

#### Development
- Modern build system with Vite
- ESLint and Prettier configuration
- Environment variable support (.env)
- npm scripts for development and production
- Hot reload development server
- Production build optimization
- Minification with Terser

#### Documentation
- Comprehensive README.md
- Detailed DEPLOYMENT.md guide
- CONTRIBUTING.md guidelines
- SECURITY.md documentation
- UX_IMPROVEMENTS.md changelog
- Inline code comments
- JSDoc-style function documentation

#### Project Structure
- package.json with all dependencies
- .gitignore for version control
- .eslintrc.json for code quality
- .prettierrc.json for formatting
- vite.config.js for build configuration
- .env.example for configuration template

#### Brand Elements
- "The Future Flows Through Louisiana" tagline
- Louisiana Economic Development copyright
- LA.IO color scheme integration
- Professional footer with contact information

### Technical Details

#### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

#### Performance Optimizations
- Font loading with swap strategy
- GPU-accelerated animations (transform, opacity)
- Throttled preview updates
- Minified production builds
- Efficient re-rendering

#### Security Measures
- All user inputs sanitized
- HTML escaping prevents injection
- CSP blocks unauthorized resources
- No eval() or dynamic code execution
- Regular dependency audits

---

## [Unreleased]

### Planned Features
- TypeScript migration for type safety
- Automated testing suite (Jest/Vitest)
- CI/CD pipeline (GitHub Actions)
- Badge download as PNG/SVG
- Multiple background preview
- Badge size comparison view
- Analytics dashboard
- Dark mode toggle
- WOFF2 font conversion
- More color presets
- Badge customization presets
- Export/import configurations

### Potential Improvements
- Service Worker for offline functionality
- Progressive Web App (PWA) features
- Multi-language support (i18n)
- Badge usage statistics API
- Partner badge gallery
- A/B testing framework
- Advanced tracking options

---

## Version History

- **1.1.0** (2026-02-12) - Mobile & Desktop UI Refresh
  - Sticky mobile preview with mode toggles
  - Official LA.IO brand colors
  - New header with LA.IO logo
  - Reduced typography sizes throughout

- **1.0.0** (2025-11-21) - Initial production-ready release
  - Complete security overhaul
  - Full UX redesign with Aktiv Grotesk
  - Comprehensive documentation
  - Modern build system setup

---

## Upgrade Guide

### Upgrading from Pre-1.0 Versions

If you have an older version:

1. **Backup your work**
   ```bash
   cp -r badge-builder badge-builder-backup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## Support

For questions, bug reports, or feature requests:

- **Email**: info@la.io
- **Issues**: GitHub Issues
- **Documentation**: See README.md

---

**The Future Flows Through Louisiana**

© 2025 Louisiana Economic Development. All Rights Reserved.
