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
- [x] Category cards carousel
- [x] Arrow navigation
- [x] Traditional menu layout
- [x] Menu item component
- [x] Category switching animation
- [x] Dietary tags (V, VG, GF)
- [ ] SAJ callout + link to /maida-saj (optional)
- [ ] Sharing note (optional)

### Phase 5: Content Pages ✅ COMPLETE
- [x] Story page (/story) - Hero, مائدة meaning, From Beirut to Lisboa, What we believe, CTA
- [x] Contact page (/contact) - Form with reCAPTCHA, map, hours, UMAI widget
- [x] Maída Live page (/maida-live) - Interactive night cards, DJ application modal, Thursday rotation
- [x] SAJ page (/maida-saj) - What is SAJ, how we make it, full SAJ menu
- [x] Coffee & Tea page (/coffee-tea) - Our coffee, teas, signature items, full menu

### Phase 6: Blog ✅ COMPLETE
- [x] Blog index page (featured post + grid)
- [x] Blog post template (rich content rendering)
- [x] Blog data JSON structure
- [x] Tabbouleh article migrated with full content
- [x] Related posts section
- [x] Tags system

### Phase 7: Enhancements 🔜 TODO
- [ ] Page transitions (fade/slide between pages)
- [ ] Loading states for images
- [ ] Image lazy loading with blur
- [ ] SEO meta tags per page
- [ ] Schema.org structured data
- [ ] 404 page
- [ ] Sitemap.xml
- [ ] Robots.txt

### Phase 8: Backend Preparation 🔮 FUTURE
- [ ] API route structure
- [ ] Database schema design
- [ ] Admin panel wireframes
- [ ] CMS integration planning

---

## 📅 Development Log

### 2026-01-01 (Session 1)
- Initial project setup
- Created all foundation files
- Built core layout components
- Completed Hero, Story, CTA sections
- Built full Menu page with carousel
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

---

## 🎨 Design Decisions

### Navigation
- Navbar always has solid `bg-warm-white/95` background (not transparent)
- Changed "Events" to "Maída Live" in nav
- SAJ and Coffee & Tea pages NOT in main nav (accessible via footer + menu links)

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
      | Story    | SAJ      | ...   | ...
      | Menu     | Coffee   |       |
      | Maída Live| Blog    |       |
      | Contact  |          |       |
```

### Blog
- Featured post: Large card with image left, content right
- Other posts: Grid of cards
- Post template: Full-width hero image, rich content blocks

---

## 🐛 Known Issues

1. metadata.metadataBase warning (cosmetic, fix when deploying)

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
