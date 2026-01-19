# Maída Website - Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-01-19

### 🎉 Admin Panel Complete & Deployed

#### Added - Production Deployment
- **Namecheap Node.js hosting** - Full server deployment (not static export)
- **Custom server.js** - Entry point for Node.js app
- **Linux Prisma binaries** - `debian-openssl-1.0.x` target for server compatibility
- **Absolute database path** - Environment variable in cPanel for SQLite

#### Added - Admin Panel Phase 2
- **Content editors** for all pages (Homepage, Menu, Story, Contact, Maída Live)
- **Menu editor** with EN/PT language tabs, category management
- **Media library** for image uploads with Sharp optimization
- **Image upload API** with WebP conversion and thumbnail generation

#### Added - UX Improvements
- **UMAI widget** - Deferred loading (loads after user interaction for better PageSpeed)
- **Admin exclusion** - UMAI widget doesn't load on /admin/* pages

#### Fixed
- **Prisma deployment** - Linux binary compatibility for Namecheap
- **Database path** - Absolute path required in cPanel environment variables
- **Build configuration** - Removed `output: 'export'` for server mode

#### Technical Notes
- Deployment requires uploading Prisma binaries to `/home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/`
- DATABASE_URL must be set in cPanel environment variables (not just .env file)
- Binary transfer mode required for FTP uploads

---

## [1.0.0-alpha] - 2026-01-18

### Added - Admin Panel Phase 1 ✅
- **Login system** with Maída branding and terracotta color scheme
- **Session authentication** using HTTP-only cookies (30-min sliding expiration)
- **Dashboard** with quick actions and content section overview
- **Sidebar navigation** with expandable content menu
- **Logout functionality** with session cleanup

### Added - Database
- **Prisma ORM** with SQLite for local development
- **User model** with bcrypt password hashing (12 rounds)
- **Session model** with token-based auth and IP/user-agent logging
- **Primary admin protection** (cannot be deleted)

### Added - API Routes
- `POST /api/admin/auth/login` - Authenticate and create session
- `POST /api/admin/auth/logout` - Destroy session and clear cookie
- `GET /api/admin/auth/session` - Validate current session

### Added - Scripts
- `setup-admin.ts` - Interactive CLI to create primary admin user

### Dependencies Added
- `@prisma/client@6` - Database ORM
- `prisma@6` - CLI and schema management
- `bcryptjs` - Password hashing
- `tsx` - TypeScript execution for scripts

---

## [0.9.0] - 2026-01-18

### Added - SEO Improvements
- **hreflang tags** on all pages via `generatePageMetadata()`
- **SEO utility** (`/lib/seo.ts`) for consistent metadata generation
- **Proper alternates** for EN/PT language versions
- **x-default** hreflang pointing to English version

### Added - Menu Updates
- **Descriptions** added for all Mains items
- **Descriptions** added for all Desserts
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
| **1.0.0** | **2026-01-19** | **Admin panel deployed on Namecheap Node.js** |
| 1.0.0-alpha | 2026-01-18 | Admin panel Phase 1 (auth) |
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

### v1.1.0 - User Management (Phase 3)
- List admin users
- Create new admin
- Delete admin (protect primary)
- Change password
- Account settings

### v1.2.0 - Dynamic Languages (Phase 4)
- Add/enable/disable languages from admin
- Translation status dashboard
- Frontend language switcher from database
- Support for German, Italian, Spanish

### v1.3.0 - Enhanced Features
- Audit logging for all changes
- Content revision history
- Scheduled publishing
- Draft/preview mode
