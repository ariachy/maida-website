# Maída Website - Changelog

All notable changes to this project will be documented in this file.

---

## [0.6.0] - 2026-01-03 (In Progress)

### Planned - Homepage Refinements
- **Hero:** Tighter line-height between "Mediterranean" and "Flavours"
- **Story Card:** Remove decorative sage/rust boxes
- **Story Card:** Add emblem pattern overlay (20% opacity)
- **Menu Section:** Terracotta "View full menu" button (was charcoal)
- **Menu Section:** Reduced bottom margin
- **Visit Section:** Reduced top margin
- **Visit Section:** Removed duplicate "Reserve a Table" button
- **CTA Section:** Reduced vertical padding
- **Footer:** Reduced overall padding
- **Footer:** Tighter link spacing
- **Navbar:** Added "Home" link before "Story"

---

## [0.5.0] - 2026-01-02

### Added - Blog System
- **Blog index page** (`/blog`) - Featured post + grid layout
- **Blog post template** (`/blog/[slug]`) - Rich content rendering
- **BlogClient.tsx** - Blog index component
- **BlogPostClient.tsx** - Individual post component
- **Content blocks** support: paragraphs, headings, lists, callouts, highlights, CTAs
- **Related posts** section at end of each post
- **Tags** display on posts
- **Tabbouleh article** - Full content migrated as first post

### Added - SEO Pages
- **Maída SAJ page** (`/maida-saj`) - SEO landing page for SAJ bread
- **Coffee & Tea page** (`/coffee-tea`) - SEO landing page for beverages

### Changed - Footer
- Added **"Discover" column** with SAJ, Coffee & Tea, Blog links
- Updated **opening hours** to correct schedule

---

## [0.3.0] - 2026-01-02

### Added - Maída Live
- **Maída Live page** (`/maida-live`) - Events and atmosphere page
- **Dark theme hero** with DJ image (object-bottom to show mixer)
- **"More than music"** concept section
- **Interactive night cards** (Thursday/Friday/Saturday):
  - Cards expand in place when clicked
  - Thursday: Cultural Rotation with monthly calendar
  - Friday: DJ Dinner with hours/vibe info
  - Saturday: Full Journey with party + brunch mention
- **Thursday rotation calendar**:
  - 1st week: Decades Night (80s/90s/00s)
  - 2nd week: World Music (Arabic, French, Latin)
  - 3rd week: Jazz Night
  - 4th week: To Be Announced
- **DJ Application modal** with form:
  - Name, Email, Phone (required)
  - Genres multi-select (9 options + Other)
  - Music link (optional)
  - Message/Bio (optional)
- **dj-apply.php** backend with:
  - reCAPTCHA Enterprise verification
  - Rate limiting (3 per hour)
  - Email to djs@maida.pt
- **Private events** inquiry section
- **Final CTA** with Friday/Saturday reserve buttons

### Changed - Navbar
- **Solid background** always (`bg-warm-white/95 backdrop-blur-xl`)
- No longer transparent at top of page
- Renamed "Events" to **"Maída Live"**

### Changed - Design
- **Night card colors** use brand palette:
  - Thursday: `stone/sand` tones
  - Friday: `sage/sage-light` tones
  - Saturday: `terracotta/terracotta-light` tones
- **Reduced section padding** for tighter layout
- **DJ button** changed from black to terracotta (visible on dark bg)

---

## [0.2.5] - 2026-01-02

### Added - Story Page
- **Story page** (`/story`) - Full page with all sections
- **StoryClient.tsx** - Client component with Framer Motion animations
- Hero section with facade-night.webp background
- Arabic watermark (مائدة) in hero
- "The meaning of مائدة" section with decorative Arabic card
- "From Beirut to Lisboa" section with 2x2 image grid
- "What We Believe" section with 3 pillar cards on dark background
- Final CTA section

---

## [0.2.4] - 2026-01-02

### Added - Contact Page
- **Contact page** (`/contact`) - Full page with form and info
- **ContactClient.tsx** - Client component with form handling
- **contact.php** - PHP backend for form processing
- **reCAPTCHA Enterprise** integration (score-based, threshold 0.5)
- Two-column layout (form left, info right)
- Form fields: Name, Email, Subject (dropdown), Message
- Subject options: General, Reservation, Private Event, Feedback, Other
- Honeypot field for spam protection
- Time-based submission check
- Rate limiting (5 submissions per IP per hour)
- Input sanitization
- Google Map embed
- Opening hours display
- UMAI widget integration
- Development mode (logs to console on localhost)

### Changed
- Contact form sends FROM `noreply@maida.pt` TO `info@maida.pt`
- Reply-To set to customer's email

---

## [0.2.3] - 2026-01-02

### Added - Homepage Completion
- **Menu Highlights section** - Horizontal scroll with 4 featured items
- **Visit section** - Address, hours, map placeholder, CTAs
- **MenuHighlights.tsx** - Scroll-based carousel component
- **Visit.tsx** - Location info component

### Fixed
- Various hydration errors resolved
- TypeScript type issues fixed

---

## [0.2.0] - 2026-01-01

### Added
- **PageLoader component** - Loading screen with مائدة Arabic text and spinning logo ring
- **Favicon files** - favicon.ico and favicon.png
- **SITEMAP-FINAL.md** - Complete sitemap with all 8 pages and content

### Changed
- **Arabic watermark** - More visible (8% opacity vs 3%), terracotta color, larger size, properly centered
- **PageLoader timing** - Shows for 0.8s (was waiting for all images to load)
- **Footer** - Added 'use client' directive for onClick handlers
- **Site structure** - Expanded from 5 to 8 pages (added SAJ, Coffee, Blog)

### Removed
- **Scroll indicator** - Removed from Hero section (was awkwardly positioned)
- **3 Pillars section** - Pillars now woven into content, not explicitly stated

### Fixed
- CSS easing class errors (`ease-out-expo` can't be used with `@apply`)
- Footer onClick error (missing 'use client' directive)
- Favicon.ico 404 error

---

## [0.1.0] - 2026-01-01

### Added - Foundation
- Next.js 14 project setup with App Router
- TypeScript configuration
- Tailwind CSS with custom Maída theme
- Framer Motion for animations
- Static export configuration for Namecheap

### Added - Components
- `Navbar` - Responsive navigation with mobile drawer
- `Footer` - Full footer with social links
- `CustomCursor` - Desktop-only decorative cursor
- `ScrollProgress` - Animated progress bar
- `LanguageSwitcher` - Multi-language dropdown
- `CategoryCard` - Menu category with image
- `MenuItem` - Traditional menu item line

### Added - Sections
- `Hero` - Animated hero with floating orbs
- `Story` - About section with Arabic card
- `CTASection` - Call-to-action banner

### Added - Pages
- Homepage (partial: Hero, Story, CTA)
- Menu page (complete with category carousel)

### Added - Data
- Menu JSON structure (categories, items)
- English translations (complete)
- Portuguese translations (complete)
- German translations (placeholder)
- Italian translations (placeholder)
- Spanish translations (placeholder)

### Added - Documentation
- README.md with setup instructions
- ROADMAP.md for project tracking
- ARCHITECTURE.md for technical docs
- DESIGN-SYSTEM.md for UI guidelines
- DEPLOYMENT.md for hosting guide
- CHANGELOG.md (this file)

### Added - Assets
- Organized image structure
- Logo files
- Food photography (6 images)
- Drinks photography (5 images)
- Atmosphere photography (4 images)
- Catering photography (8 images)
- Hero images (2 images)

### Integrated
- UMAI reservation widget
- Google Tag Manager (GTM-MZ83M6VJ)

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.6.0 | 2026-01-03 | Homepage design refinements (in progress) |
| 0.5.0 | 2026-01-02 | Blog system complete |
| 0.4.0 | 2026-01-02 | SAJ + Coffee & Tea pages, Footer update |
| 0.3.0 | 2026-01-02 | Maída Live page with DJ form |
| 0.2.5 | 2026-01-02 | Story page complete |
| 0.2.4 | 2026-01-02 | Contact page with reCAPTCHA |
| 0.2.3 | 2026-01-02 | Homepage complete |
| 0.2.0 | 2026-01-01 | PageLoader, watermark fixes |
| 0.1.0 | 2026-01-01 | Initial release - Foundation, Menu page |

---

## Upcoming Milestones

### v0.7.0 - Performance & SEO
- Schema.org structured data
- Sitemap.xml / Robots.txt
- Lighthouse optimization

### v0.8.0 - Translations
- Complete German translations
- Complete Italian translations
- Complete Spanish translations

### v1.0.0 - Production Ready
- Performance optimized (Lighthouse 95+)
- All SEO complete
- Ready for public launch
