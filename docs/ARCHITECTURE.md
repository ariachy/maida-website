# Maída Website - Technical Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                    (Next.js Static)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │    Pages    │  │ Components  │  │   Styles    │           │
│   │  (App Router)│  │  (React)   │  │ (Tailwind)  │           │
│   └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │    Data     │  │    Lib      │  │   Hooks     │           │
│   │   (JSON)    │  │ (Utilities) │  │  (Custom)   │           │
│   └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Static Export
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HOSTING                                    │
│                    (Namecheap FTP)                              │
│                                                                 │
│   /out folder → public_html                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
maida-website/
│
├── public/                     # Static assets
│   ├── images/
│   │   ├── hero/              # Hero/banner images
│   │   ├── food/              # Food photography
│   │   ├── drinks/            # Beverage photography
│   │   ├── atmosphere/        # Restaurant ambiance
│   │   ├── catering/          # Catering/events
│   │   └── brand/             # Logos, icons
│   └── fonts/                 # Custom fonts (if any)
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [lang]/           # Dynamic locale routes
│   │   │   ├── menu/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── layout.tsx    # Locale layout
│   │   │   └── page.tsx      # Homepage
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Redirect to default locale
│   │
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   │
│   │   ├── sections/         # Page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Story.tsx
│   │   │   ├── Philosophy.tsx
│   │   │   ├── MenuPreview.tsx
│   │   │   ├── DrinksPreview.tsx
│   │   │   ├── Visit.tsx
│   │   │   └── CTASection.tsx
│   │   │
│   │   ├── ui/               # Reusable UI
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── MenuItem.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   └── menu/             # Menu-specific
│   │       └── MenuClient.tsx
│   │
│   ├── data/
│   │   ├── locales/          # Translation files
│   │   │   ├── en.json
│   │   │   ├── pt.json
│   │   │   ├── de.json
│   │   │   ├── it.json
│   │   │   └── es.json
│   │   ├── menu.json         # Menu data
│   │   └── site.json         # Site configuration
│   │
│   ├── lib/
│   │   ├── i18n.ts           # Internationalization
│   │   ├── utils.ts          # Utility functions
│   │   └── constants.ts      # App constants
│   │
│   ├── hooks/
│   │   ├── useTranslation.ts
│   │   ├── useScrollProgress.ts
│   │   └── useMediaQuery.ts
│   │
│   └── styles/
│       ├── globals.css       # Global styles, Tailwind
│       ├── components/       # Component-specific CSS
│       └── pages/            # Page-specific CSS
│
├── docs/                      # Documentation
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── DEPLOYMENT.md
│   └── CHANGELOG.md
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🌍 Internationalization (i18n)

### URL Structure
```
maida.pt/en/          → English
maida.pt/pt/          → Portuguese (default)
maida.pt/de/          → German
maida.pt/it/          → Italian
maida.pt/es/          → Spanish
```

### Translation Flow
```
1. User visits /en/menu
2. [lang] param = "en"
3. loadTranslations("en") loads /data/locales/en.json
4. Translations passed to components as props
5. Components render localized content
```

### Translation File Structure
```json
{
  "locale": "en",
  "nav": { ... },
  "hero": { ... },
  "menu": {
    "categories": {
      "mezze": { "name": "...", "description": "..." }
    },
    "items": {
      "hummus-beiruti": { "name": "...", "description": "..." }
    }
  }
}
```

---

## 🎨 Component Architecture

### Layout Components
Wrap all pages, provide consistent structure:
- `Navbar` - Navigation, language switcher, reserve button
- `Footer` - Links, social, contact info
- `CustomCursor` - Desktop-only decorative cursor
- `ScrollProgress` - Reading progress indicator

### Section Components
Self-contained page sections:
- Receive translations as props
- Handle their own animations
- Responsive by default

### UI Components
Reusable primitives:
- `Button` - Primary, ghost, light variants
- `CategoryCard` - Menu category with image
- `MenuItem` - Traditional menu item line

---

## 🔄 Data Flow

### Menu Data
```
menu.json
    │
    ├── categories[] ─────► CategoryCard components
    │   ├── id
    │   ├── slug
    │   ├── image
    │   └── sortOrder
    │
    └── items[] ──────────► MenuItem components
        ├── id
        ├── categoryId
        ├── price
        ├── tags[]
        └── sortOrder

Translations (en.json, pt.json, etc.)
    │
    └── menu.items[id].name/description
```

### Translation Flow
```
Server Component
    │
    ├── loadTranslations(locale)
    │
    └── Pass to Client Component as prop
            │
            └── useTranslation(translations)
                    │
                    └── t("menu.items.hummus-beiruti.name")
```

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev          # Start dev server on :3000
```

### Production Build
```bash
npm run build        # Build + static export to /out
```

### Deployment
```bash
# 1. Build the project
npm run build

# 2. Connect to Namecheap via FTP
# 3. Upload /out/* to public_html/
# 4. Done!
```

---

## 🔮 Future: Backend Integration

When backend is added:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────►│   API       │────►│  Database   │
│  (Next.js)  │     │ (Node/PHP)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Admin     │
                    │   Panel     │
                    └─────────────┘
```

### API Endpoints (Planned)
```
GET  /api/menu              # All menu data
GET  /api/menu/:category    # Items by category
GET  /api/translations/:locale
POST /api/contact           # Contact form
```

### Database Schema (Planned)
```sql
categories (id, slug, icon, sort_order)
category_translations (category_id, locale, name, description)
menu_items (id, category_id, price, image, sort_order)
menu_item_translations (item_id, locale, name, description)
```
