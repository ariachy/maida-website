# Maída Website - Design System

## 🎨 Brand Colors

### Primary Palette
| Name | Hex | Usage |
|------|-----|-------|
| **Warm White** | `#FEFCF9` | Page backgrounds |
| **Cream** | `#F8F4EF` | Section backgrounds, cards |
| **Sand** | `#E8E0D5` | Borders, dividers, subtle backgrounds |
| **Terracotta** | `#C67D5E` | Primary accent, CTAs, highlights |
| **Terracotta Light** | `#D4957A` | Hover states, secondary accent |
| **Terracotta Glow** | `#E8A88A` | Gradients, glows |
| **Rust** | `#A65D3F` | Deep accent, gradients |
| **Charcoal** | `#2D2926` | Primary text, dark backgrounds |
| **Stone** | `#6B635B` | Secondary text, muted content |
| **Sage** | `#9BAA8E` | Accent, tags, decorative |
| **Sage Light** | `#B5C4A8` | Light accent, backgrounds |

### Tailwind Classes
```css
/* Backgrounds */
bg-warm-white    bg-cream    bg-sand    bg-charcoal

/* Text */
text-charcoal    text-stone    text-terracotta

/* Accents */
bg-terracotta    bg-sage    bg-rust
```

---

## 📝 Typography

### Font Families
| Font | Usage | Weight |
|------|-------|--------|
| **Fraunces** | Headings, display text | 300, 400 (italic) |
| **DM Sans** | Body text, UI | 300, 400, 500 |

### Type Scale (Fluid)
```css
text-fluid-xs   /* 0.75rem → 0.875rem */
text-fluid-sm   /* 0.875rem → 1rem */
text-fluid-base /* 1rem → 1.125rem */
text-fluid-lg   /* 1.125rem → 1.25rem */
text-fluid-xl   /* 1.25rem → 1.5rem */
text-fluid-2xl  /* 1.5rem → 2rem */
text-fluid-3xl  /* 2rem → 3rem */
text-fluid-4xl  /* 2.5rem → 4rem */
text-fluid-5xl  /* 3rem → 6rem */
```

### Usage Guidelines
- **Hero titles:** `text-fluid-5xl font-display font-light`
- **Section titles:** `text-fluid-3xl font-display font-light`
- **Subtitles:** `text-lg text-stone`
- **Body text:** `text-base text-charcoal`
- **Labels:** `text-xs tracking-[0.25em] uppercase text-terracotta`

---

## 📐 Spacing

### Section Spacing
```css
.section        /* py-20 px-6 md:py-32 md:px-12 */
.section-narrow /* py-16 px-6 md:py-24 md:px-12 */
```

### Container
```css
.container-custom /* max-w-7xl mx-auto */
```

---

## 🔲 Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Reserve a Table</button>
```
- Background: charcoal
- Text: warm-white
- Hover: terracotta fill from bottom

#### Ghost Button
```html
<button class="btn btn-ghost">View Menu</button>
```
- Background: transparent
- Border: sand
- Hover: terracotta border & text

#### Light Button
```html
<button class="btn btn-light">See More</button>
```
- Background: warm-white
- Text: charcoal
- Hover: terracotta background

### Cards

#### Category Card
```html
<div class="category-card">
  <img class="category-card-image" />
  <div class="category-card-overlay" />
  <div class="category-card-content">
    <h3 class="category-card-name">Mezze</h3>
  </div>
</div>
```

### Menu Items
```html
<div class="menu-item-line">
  <div>
    <h4 class="menu-item-name">Hummus Beiruti</h4>
    <p class="menu-item-description">Warm chickpeas, olive oil</p>
  </div>
  <span class="menu-item-price">€8</span>
</div>
```

### Tags
```html
<span class="tag">V</span>
<span class="tag">VG</span>
<span class="tag">GF</span>
```

---

## ✨ Animations

### Timing Functions
```css
--ease: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
```

### Animation Classes
```css
animate-fade-up     /* Fade up from 30px */
animate-fade-in     /* Simple fade in */
animate-slide-up    /* Slide up from 100% */
animate-scale-in    /* Scale from 0.95 */
animate-float       /* Gentle floating motion */
animate-shimmer     /* Loading shimmer effect */
```

### Framer Motion Presets
```tsx
// Fade up on scroll
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}

// Staggered children
transition={{ staggerChildren: 0.1 }}

// Spring animation
transition={{ type: 'spring', stiffness: 500, damping: 30 }}
```

---

## 🖱️ Interactive States

### Hover Effects
| Element | Effect |
|---------|--------|
| Nav links | Color change + underline grows |
| Buttons | Fill animation + slight lift |
| Cards | Scale 1.02 + image zoom |
| Menu items | Slide right + color change |

### Focus States
- Visible focus ring for accessibility
- Use `focus-visible` for keyboard-only

---

## 📱 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px
```

### Mobile-First Approach
```css
/* Mobile default */
.element { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .element { padding: 2rem; }
}
```

---

## 🌙 Dark Elements

For dark background sections (menu, footer):
- Background: `bg-charcoal`
- Text: `text-warm-white`
- Muted: `text-stone`
- Accent: `text-terracotta-light`
- Borders: `border-white/10`

---

## 🖼️ Image Guidelines

### Formats
- **Photos:** WebP (25-35% smaller than JPEG)
- **Logos:** PNG with transparency, or SVG
- **Icons:** Lucide React (consistent style)

### Sizes
- **Hero:** Max 200KB, 1920px width
- **Cards:** 50-100KB, 800px width
- **Thumbnails:** 20-50KB, 400px width

### Loading
- Lazy load below-fold images
- Use blur placeholder for hero
- `loading="lazy"` attribute

---

## ♿ Accessibility

### Requirements
- Color contrast: 4.5:1 minimum
- Focus indicators visible
- Skip to main content link
- Alt text on all images
- ARIA labels on interactive elements
- Keyboard navigable

### Testing
- axe DevTools
- Lighthouse accessibility audit
- Manual keyboard navigation test
