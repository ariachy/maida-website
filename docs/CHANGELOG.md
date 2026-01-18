# Maída Website - Changelog

All notable changes to this project will be documented in this file.

---

## [0.9.0] - 2026-01-18

### Added - SEO Improvements
- **hreflang tags** on all pages via `generatePageMetadata()`
- **SEO utility** (`/lib/seo.ts`) for consistent metadata generation
- **Proper alternates** for EN/PT language versions
- **x-default** hreflang pointing to English version

### Added - Menu Updates
- **Descriptions** added for all Mains items (Shawarma, Salmon, Chicken Breast, Lasagna, Lebanese Burger)
- **Descriptions** added for all Desserts (Tiramisu, Rice Pudding, Znoud el Set)
- **Descriptions** added for all SAJ Wraps (14 items)
- **Pain Perdu** removed from desserts menu

### Changed - Page Metadata
- All pages now use `generatePageMetadata()` for consistent SEO
- Bilingual titles and descriptions (EN/PT)
- OpenGraph and Twitter card support
- Canonical URLs properly set

### Fixed
- Homepage overflow issue (added `overflow-x-hidden` wrapper)
- Character encoding in metadata (proper UTF-8)

---

## [0.8.0] - 2026-01-17

### Added - Translation System
- **Full i18n implementation** with next-intl pattern
- **MaidaLiveClient** fully translated
- **All components** using translation keys
- **Fallback handling** for missing translations

### Changed
- Components now receive `translations` and `locale` props
- Consistent translation key pattern across all files

---

## [0.7.1] - 2026-01-09

### Added - 404 Page
- **404 page** with 2 random variations (light/dark themes)
- Light theme: "Oops! This page wandered off"
- Dark theme: "This page doesn't exist. But ours does."
- UMAI widget integration for Reserve button

### Changed - Homepage Hero (Mobile)
- Adjusted mobile spacing for better balance
- Location badge positioning improved
- Better gap between title and buttons

### Changed - Maída Live Page
- Combined Private Events + DJ Application into single section
- Side-by-side layout on desktop, stacked on mobile
- Cleaner, lighter design

### Changed - Text Content
- Story page: "long gatherings" → "lively gatherings"
- Updated مائدة definition to include drinking culture

---

## [0.5.0] - 2026-01-02

### Added - Blog System
- **Blog index page** (`/blog`) - Featured post + grid layout
- **Blog post template** (`/blog/[slug]`) - Rich content rendering
- **Content blocks** support: paragraphs, headings, lists, callouts
- **Tabbouleh article** - First blog post

### Added - SEO Pages
- **Maída SAJ page** (`/maida-saj`) - SEO landing page
- **Coffee & Tea page** (`/coffee-tea`) - SEO landing page

### Changed - Footer
- Added "Discover" column with SAJ, Coffee & Tea, Blog links
- Updated opening hours

---

## [0.3.0] - 2026-01-02

### Added - Maída Live
- **Interactive night cards** (Thursday/Friday/Saturday)
- **Thursday cultural rotation** calendar
- **DJ Application form** with modal
- **dj-apply.php** backend

### Changed - Navbar
- Always solid background (not transparent)
- "Events" renamed to "Maída Live"

---

## [0.2.5] - 2026-01-02

### Added - Story Page
- Full page with all sections
- Arabic watermark (مائدة)
- "From Beirut to Lisboa" section
- "What We Believe" section with 3 pillars

---

## [0.2.4] - 2026-01-02

### Added - Contact Page
- Contact form with reCAPTCHA Enterprise
- PHP backend for form processing
- Google Map embed
- Opening hours display

---

## [0.2.3] - 2026-01-02

### Added - Homepage Completion
- Menu Highlights section (horizontal scroll)
- Visit section (address, hours, map)

---

## [0.2.0] - 2026-01-01

### Added
- PageLoader with مائدة + spinning logo
- Favicon files
- Complete sitemap documentation

### Changed
- Arabic watermark more visible (8% opacity, terracotta)
- PageLoader timing optimized (0.8s)

### Removed
- Scroll indicator from Hero section

---

## [0.1.0] - 2026-01-01

### Added - Foundation
- Next.js 14 project with App Router
- TypeScript + Tailwind CSS
- Framer Motion animations
- Static export configuration

### Added - Components
- Navbar, Footer, CustomCursor, ScrollProgress
- Hero, Story, CTASection
- CategoryCard, MenuItem, Button

### Added - Pages
- Homepage, Menu page

### Added - Data
- Menu JSON structure
- EN/PT translations

### Integrated
- UMAI reservation widget
- Google Tag Manager

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.9.0 | 2026-01-18 | SEO hreflang, menu descriptions |
| 0.8.0 | 2026-01-17 | Full translation system |
| 0.7.1 | 2026-01-09 | 404 page, mobile fixes |
| 0.5.0 | 2026-01-02 | Blog system, SEO pages |
| 0.3.0 | 2026-01-02 | Maída Live page |
| 0.2.5 | 2026-01-02 | Story page |
| 0.2.4 | 2026-01-02 | Contact page |
| 0.2.3 | 2026-01-02 | Homepage complete |
| 0.2.0 | 2026-01-01 | PageLoader, fixes |
| 0.1.0 | 2026-01-01 | Initial release |

---

## Upcoming

### v1.0.0 - Admin Panel
- Secure login system
- Content editing (translations, menu)
- Image upload management
- User management (super admins)
- Audit logging

### v1.1.0 - Performance
- Lighthouse 95+ optimization
- Image optimization audit
- Bundle size analysis
