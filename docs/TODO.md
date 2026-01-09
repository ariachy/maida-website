# Maída Website - TODO

Quick reference for pending tasks. See ROADMAP.md for full details.

**Last Updated:** 2026-01-09

---

## 🔴 High Priority (Current Sprint)

### Homepage Design Updates (v0.6.0)
- [ ] Hero: Reduce line-height between "Mediterranean" and "Flavours" (`leading-[0.9]`)
- [ ] Story Card: Remove sage decorative box (bottom-left)
- [ ] Story Card: Remove rust decorative box (top-right)
- [ ] Story Card: Add emblem pattern (20% opacity)
- [ ] Menu Section: Change "View full menu" button to terracotta
- [ ] Menu Section: Reduce margin-bottom
- [ ] Visit Section: Reduce margin-top
- [ ] Visit Section: Remove "Reserve a Table" button
- [ ] CTA Section: Reduce top/bottom padding
- [ ] Footer: Reduce overall padding
- [ ] Footer: Tighter link spacing (space-y-2)
- [ ] Footer: Reduce margin under copyright
- [ ] Navbar: Add "Home" link before "Story"

### Recently Completed (v0.7.1)
- [x] Homepage Hero: Mobile spacing adjustments ✅
- [x] Maída Live: Combined Private Events + DJ Application sections ✅
- [x] 404 page with 2 random variations ✅
- [x] Text content refinements (Story, brand messaging) ✅

---

## 🟢 Low Priority (Nice to Have)

### Menu Page Updates (Optional)
- [ ] SAJ callout with link to /maida-saj
- [ ] Sharing note at top of menu

### Enhancements
- [ ] Page transitions (fade/slide between pages)
- [ ] Image blur placeholders while loading
- [ ] Loading skeleton states
- [x] 404 page (2 random variations) ✅

### SEO
- [ ] Set metadataBase for production URL
- [ ] Schema.org structured data per page
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Open Graph images

### Translations
- [ ] Complete German translations
- [ ] Complete Italian translations
- [ ] Complete Spanish translations

### Performance
- [ ] Lighthouse 95+ score
- [ ] Image optimization audit
- [ ] Bundle size analysis

---

## 🔮 Future (Backend Phase)

- [ ] API routes structure
- [ ] Database schema (PostgreSQL/SQLite)
- [ ] Admin panel for menu management
- [ ] Translation management system
- [ ] Image upload system
- [ ] Blog CMS migration

---

## ✅ Completed

### Foundation
- [x] Project setup (Next.js 14, Tailwind, TypeScript)
- [x] Folder structure
- [x] Tailwind theme (Maída colors, fonts)
- [x] Global styles & CSS utilities
- [x] i18n system (JSON-based)
- [x] Image organization

### Components
- [x] Navbar (responsive, mobile drawer, solid background)
- [x] Footer (with Discover section, correct hours)
- [x] Custom cursor (desktop only)
- [x] Scroll progress bar
- [x] Language switcher
- [x] Page loader (مائدة + spinning logo, 0.8s)
- [x] Category cards
- [x] Menu items (traditional layout)
- [x] Buttons (primary, ghost, light)

### Homepage ✅ COMPLETE
- [x] Hero section (animated text reveals, no scroll indicator)
- [x] Arabic watermark مائدة (visible, centered, terracotta)
- [x] Floating orbs animation
- [x] Story Preview section
- [x] Menu Highlights section (horizontal scroll, 4 items)
- [x] Visit section (address, hours, map, CTAs)
- [x] CTA section

### Menu Page ✅ COMPLETE
- [x] Category carousel with arrows
- [x] Traditional inline menu layout
- [x] Category switching animation
- [x] Dietary tags (V, VG, GF)

### Contact Page ✅ COMPLETE
- [x] Two-column layout
- [x] Contact form with validation
- [x] reCAPTCHA Enterprise integration
- [x] Honeypot + time-based spam protection
- [x] PHP backend (contact.php)
- [x] Google Map embed
- [x] Opening hours display
- [x] UMAI reservation widget

### Story Page ✅ COMPLETE
- [x] Hero with background image
- [x] مائدة meaning section with Arabic card
- [x] From Beirut to Lisboa section with image grid
- [x] What We Believe section (3 pillars cards)
- [x] Final CTA

### Maída Live Page ✅ COMPLETE
- [x] Dark theme hero with DJ image
- [x] "More than music" concept section
- [x] Interactive night cards (Thursday/Friday/Saturday)
- [x] Cards expand in place (not pushing content down)
- [x] Thursday rotation calendar (Decades, World Music, Jazz, TBA)
- [x] Friday DJ Dinner details
- [x] Saturday party + brunch mention
- [x] DJ Application CTA with modal
- [x] DJ form (name, email, phone, genres, music link, message)
- [x] dj-apply.php backend
- [x] Private events inquiry section
- [x] Final CTA with reserve buttons

### SAJ Page ✅ COMPLETE
- [x] Hero section
- [x] What is SAJ explanation
- [x] How we make it section
- [x] Full SAJ menu (savoury + sweet)
- [x] Dietary tags
- [x] Final CTA

### Coffee & Tea Page ✅ COMPLETE
- [x] Hero section
- [x] Our Coffee section (Baobá, Lavender Coffee, Cafe Blanc)
- [x] Our Teas section
- [x] Full menu (coffee + tea items)
- [x] Signature items highlighted
- [x] Final CTA

### Blog ✅ COMPLETE
- [x] Blog index page
- [x] Featured post layout (large card)
- [x] Post grid for additional posts
- [x] Dynamic blog post template
- [x] Rich content rendering (paragraphs, headings, lists, callouts, highlights)
- [x] Tags display
- [x] Related posts section
- [x] Blog data JSON structure
- [x] Tabbouleh article migrated with full content

### Data & Translations
- [x] Menu JSON structure
- [x] Blog JSON structure
- [x] English translations (complete)
- [x] Portuguese translations (complete)
- [x] DE/IT/ES placeholders

### Integrations
- [x] UMAI reservation widget
- [x] Google Tag Manager (GTM-MZ83M6VJ)
- [x] reCAPTCHA Enterprise
- [x] Favicon

### Backend
- [x] contact.php (contact form handling)
- [x] dj-apply.php (DJ application handling)
- [x] .env configuration
- [x] Rate limiting
- [x] Input sanitization

### Design Decisions Implemented
- [x] Navbar always solid background (not transparent)
- [x] Removed all scroll indicators
- [x] "Events" renamed to "Maída Live" in nav
- [x] Footer "Discover" section added
- [x] Brand color palette for night cards (stone, sage, terracotta)

### Documentation
- [x] SITEMAP-FINAL.md
- [x] ROADMAP.md
- [x] TODO.md
- [x] CHANGELOG.md

---

## 📝 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Files go to /out folder for FTP upload
```

---

## 📊 Progress Summary

| Category | Status |
|----------|--------|
| Pages | 8/8 complete ✅ |
| Blog | Index + Posts ✅ |
| Forms | Contact + DJ ✅ |
| Translations | EN/PT complete, DE/IT/ES pending |
| SEO | Basic meta, advanced pending |
| Performance | Not yet optimized |
| v0.6.0 Design | In progress |
