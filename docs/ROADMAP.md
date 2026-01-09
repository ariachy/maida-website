# Maída Website - Project Roadmap

## 📋 Project Overview

**Project:** Maída Restaurant Website  
**Stack:** Next.js 14, Tailwind CSS, Framer Motion, TypeScript  
**Deployment:** Static export → FTP to Namecheap  
**Languages:** EN (primary), PT, DE, IT, ES  

---

## 🗺️ Site Structure

```
maida.pt/
├── /                   Homepage ✅
├── /menu               Full Menu ✅
├── /story              Our Story ✅
├── /contact            Find Us ✅
├── /maida-live         Maída Live (Events) ✅
├── /maida-saj          SAJ Manoushe (SEO) ✅
├── /coffee-tea         Coffee & Tea (SEO) ✅
├── /blog               Blog Index ✅
└── /blog/[slug]        Blog Posts ✅
```

**8 pages + dynamic blog posts**

---

## 🎯 Project Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Project setup (Next.js, Tailwind, TypeScript)
- [x] Folder structure
- [x] Tailwind theme configuration (Maída colors, fonts)
- [x] Global styles (CSS variables, utilities)
- [x] i18n system (JSON-based, API-ready)
- [x] Image organization

### Phase 2: Core Components ✅ COMPLETE
- [x] Custom cursor (desktop only)
- [x] Scroll progress bar
- [x] Navbar (responsive, mobile drawer, solid background)
- [x] Footer (with Discover section)
- [x] Language switcher
- [x] Button components
- [x] Page loader (مائدة + spinning logo)

### Phase 3: Homepage ✅ COMPLETE
- [x] Hero section (animated, no scroll indicator)
- [x] Arabic watermark (مائدة - visible, centered)
- [x] Floating orbs animation
- [x] Story Preview section
- [x] Menu Highlights section (horizontal scroll, 4 items)
- [x] Visit/Location section (address, hours, map, CTAs)
- [x] CTA section

### Phase 4: Menu Page ✅ COMPLETE
- [x] Category carousel with arrows
- [x] Traditional inline menu layout
- [x] Category switching
- [x] Dietary tags (V, VG, GF)

### Phase 5: Contact Page ✅ COMPLETE
- [x] Two-column layout
- [x] Contact form with reCAPTCHA Enterprise
- [x] PHP backend
- [x] Google Map
- [x] Opening hours

### Phase 6: Story + Maída Live ✅ COMPLETE
- [x] Story page with all sections
- [x] Maída Live page with interactive night cards
- [x] DJ application form with backend

### Phase 7: SEO Pages + Blog ✅ COMPLETE
- [x] SAJ page (SEO landing)
- [x] Coffee & Tea page (SEO landing)
- [x] Blog index page
- [x] Blog post template
- [x] 404 page (2 random variations)

### Phase 8: Design Refinements (v0.6.0) ⏳ IN PROGRESS
- [ ] Hero: Tighter line-height
- [ ] Story Card: Remove decorative boxes, add emblem pattern
- [ ] Menu Section: Terracotta button, reduce margins
- [ ] Visit Section: Reduce margin, remove Reserve button
- [ ] CTA Section: Reduce padding
- [ ] Footer: Tighter spacing
- [ ] Navbar: Add "Home" link

### Phase 9: Performance & SEO 🔮 PLANNED
- [ ] Image optimization
- [ ] Lighthouse 95+
- [ ] Schema.org markup
- [ ] Sitemap.xml

---

## 🎨 Design Decisions

### Navigation
- Navbar always has solid `bg-warm-white/95` background (not transparent)
- Changed "Events" to "Maída Live" in nav
- SAJ and Coffee & Tea pages NOT in main nav (accessible via footer + menu links)
- **v0.6.0:** Adding "Home" link as first nav item

### Scroll Indicators
- Removed from ALL pages (Hero, Story, Maída Live)
- Decision: cleaner look, users know to scroll

### Color Usage for Cards (Maída Live)
- Thursday: `stone/sand` tones
- Friday: `sage/sage-light` tones  
- Saturday: `terracotta/terracotta-light` tones

### Footer Structure
```
Brand | Navigate | Discover | Hours | Contact
      | Home     | SAJ      | ...   | ...
      | Story    | Coffee   |       |
      | Menu     | Blog     |       |
      | Maída Live|         |       |
      | Contact  |          |       |
```

### Blog
- Featured post: Large card with image left, content right
- Other posts: Grid of cards
- Post template: Full-width hero image, rich content blocks

### v0.6.0 Design Updates
- **Hero:** `leading-[0.9]` for tighter title spacing
- **Story Card:** No decorative boxes, emblem pattern at 20% opacity
- **Buttons:** "View full menu" in terracotta (not charcoal)
- **Spacing:** Reduced margins throughout homepage sections
- **Footer:** Tighter link spacing (`space-y-2`)

---

## 🐛 Known Issues

1. metadata.metadataBase warning (cosmetic, fix when deploying)

---

## 📝 Development Log

### 2026-01-01 (Session 1)
- Set up Next.js project with Tailwind
- Created component structure
- Built Full Menu page with carousel
- Organized all uploaded images
- Created EN and PT translations

### 2026-01-01 (Session 2)
- Fixed CSS easing class errors
- Added 'use client' to Footer component
- Added favicon files
- Removed scroll indicator from Hero
- Added PageLoader with مائدة + spinning logo
- Made مائدة watermark more visible
- Centered مائدة watermark properly
- Optimized PageLoader timing (0.8s)
- Created comprehensive sitemap with all 8 pages
- Planned content for all pages aligned with 3 brand pillars

### 2026-01-02 (Session 3)
- Completed Homepage (Menu Highlights + Visit sections)
- Built Contact page with reCAPTCHA Enterprise integration
- Created contact.php backend with email sending
- Built Story page with full content and animations
- Fixed navbar to always have solid background
- Removed all scroll indicators site-wide

### 2026-01-02 (Session 4)
- Built Maída Live page with interactive features:
  - Three night cards (Thursday/Friday/Saturday) that expand in place
  - Thursday cultural rotation calendar (Decades, World Music, Jazz, TBA)
  - DJ application modal with genre multi-select
  - dj-apply.php backend
- Updated navbar: "Events" → "Maída Live"
- Built SAJ page (SEO landing page with full menu)
- Built Coffee & Tea page (SEO landing page with full menu)
- Updated Footer with "Discover" section (SAJ, Coffee & Tea, Blog links)
- Updated Footer with correct opening hours
- Built Blog system:
  - Blog index with featured post layout
  - Dynamic blog post template with rich content
  - Migrated tabbouleh article with full content
  - Tags and related posts support

### 2026-01-09 (Session 7)
- Homepage Hero mobile spacing adjustments
- Maída Live: Combined Private Events + DJ Application into single section
- Created 404 page with 2 random variations (light/dark themes)
- Text content refinements:
  - Story page: "lively gatherings", "timeless flavours"
  - Brand messaging: Added drinking culture to مائدة definition
- Updated documentation

### 2026-01-03 (Session 5)
- Planning homepage design refinements (v0.6.0):
  - Hero title spacing
  - Story card simplification (remove decorative boxes)
  - Button color updates
  - Section margin adjustments
  - Footer spacing tightening
  - Navbar "Home" link addition
- Updated documentation

---

## 📝 Notes

- 3 brand pillars woven into content (never explicitly stated)
- Using static export for Namecheap compatibility
- UMAI widget integrated for reservations
- GTM installed (GTM-MZ83M6VJ)
- Images optimized to WebP format
- Custom cursor hidden on mobile/touch devices
- Page loader shows for 0.8s on initial load
- reCAPTCHA Enterprise for contact + DJ forms
- Blog posts stored in JSON (can migrate to CMS later)

---

## 🔗 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [UMAI Widget](https://letsumai.com)
