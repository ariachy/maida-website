# Maída Website - Technical Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                    (Next.js 14)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ Public Site │  │ Admin Panel │  │   Styles    │            │
│   │  [lang]/*   │  │   /admin/*  │  │ (Tailwind)  │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │    Data     │  │    Lib      │  │   Prisma    │            │
│   │   (JSON)    │  │ (Auth/Utils)│  │  (SQLite)   │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HOSTING                                    │
│                    (Namecheap FTP)                              │
│                                                                 │
│   Static export (public site) + API routes (admin)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
maida.pt/
│
├── public/                     # Static assets
│   ├── images/
│   │   ├── hero/              # Hero/banner images
│   │   ├── food/              # Food photography
│   │   ├── drinks/            # Beverage photography
│   │   ├── atmosphere/        # Restaurant ambiance
│   │   ├── blog/              # Blog post images
│   │   ├── 404/               # 404 page images
│   │   └── brand/             # Logos, icons
│   └── uploads/               # User-uploaded images (gitignored)
│
├── src/
│   ├── app/
│   │   ├── [lang]/            # Public site (localized)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── menu/
│   │   │   ├── story/
│   │   │   ├── contact/
│   │   │   ├── maida-live/
│   │   │   ├── maida-saj/
│   │   │   ├── coffee-tea/
│   │   │   └── blog/
│   │   │
│   │   ├── admin/             # Admin panel (protected)
│   │   │   ├── page.tsx       # Login
│   │   │   ├── layout.tsx     # Admin layout with auth
│   │   │   ├── dashboard/
│   │   │   ├── content/       # Edit translations
│   │   │   │   ├── homepage/
│   │   │   │   ├── menu/
│   │   │   │   ├── story/
│   │   │   │   └── contact/
│   │   │   ├── blog/          # Manage blog posts
│   │   │   ├── media/         # Upload images
│   │   │   ├── users/         # Manage admins
│   │   │   └── settings/      # Change password
│   │   │
│   │   └── api/
│   │       └── admin/         # Admin API routes
│   │           ├── auth/
│   │           │   ├── login/
│   │           │   ├── logout/
│   │           │   └── session/
│   │           ├── content/
│   │           ├── upload/
│   │           └── users/
│   │
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, etc.
│   │   ├── sections/          # Page sections
│   │   ├── ui/                # Buttons, Cards, etc.
│   │   ├── menu/              # Menu components
│   │   ├── blog/              # Blog components
│   │   └── admin/             # Admin-specific components
│   │
│   ├── data/
│   │   ├── locales/           # Translation files
│   │   │   ├── en.json
│   │   │   └── pt.json
│   │   ├── menu.json          # Menu items
│   │   └── blog.json          # Blog posts
│   │
│   ├── lib/
│   │   ├── i18n.ts            # Internationalization
│   │   ├── seo.ts             # SEO utilities (hreflang)
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── prisma.ts          # Database client
│   │   ├── session.ts         # Session management
│   │   └── audit.ts           # Audit logging
│   │
│   └── styles/
│       └── globals.css        # Global styles, Tailwind
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── admin.db               # SQLite database (gitignored)
│
├── docs/
│   ├── ARCHITECTURE.md        # This file
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── CHANGELOG.md           # Version history
│   ├── DESIGN-SYSTEM.md       # UI guidelines
│   ├── ADMIN-SETUP.md         # Admin panel setup
│   └── SECURITY.md            # Security documentation
│
├── .env.local                 # Secrets (gitignored)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🌍 Internationalization (i18n)

### URL Structure
```
maida.pt/en/          → English (default)
maida.pt/pt/          → Portuguese
```

### Translation Flow
```
1. User visits /en/menu
2. [lang] param = "en"
3. loadTranslations("en") loads /data/locales/en.json
4. Translations passed to components as props
5. Components render localized content
```

### SEO: hreflang Tags
Each page includes proper hreflang tags via `generatePageMetadata()`:
```html
<link rel="alternate" hreflang="en" href="https://maida.pt/en/menu" />
<link rel="alternate" hreflang="pt" href="https://maida.pt/pt/menu" />
<link rel="alternate" hreflang="x-default" href="https://maida.pt/en/menu" />
```

---

## 🔐 Admin Panel Architecture

### Authentication Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Verify    │────▶│  Create     │
│   Form      │     │  Password   │     │  Session    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Bcrypt    │     │  HTTP-only  │
                    │   Compare   │     │   Cookie    │
                    └─────────────┘     └─────────────┘
```

### Session Security
- **HTTP-only cookies** - JavaScript cannot access
- **Secure flag** - HTTPS only
- **SameSite=strict** - CSRF protection
- **30-minute timeout** - Auto-logout on inactivity
- **Sliding expiration** - Extends on activity

### Database Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String    // Bcrypt (12 rounds)
  isPrimary     Boolean   @default(false)  // Cannot be deleted
  createdAt     DateTime  @default(now())
  lastLogin     DateTime?
  
  sessions      Session[]
  auditLogs     AuditLog[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(...)
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  action    String   // "UPDATE_MENU", "CREATE_USER", etc.
  target    String   // "en.json", "menu.json", etc.
  details   String?  // JSON of changes
  ipAddress String?
  createdAt DateTime @default(now())
}
```

### API Routes
```
POST /api/admin/auth/login     → Authenticate user
POST /api/admin/auth/logout    → Destroy session
GET  /api/admin/auth/session   → Validate current session

GET  /api/admin/content/:file  → Get JSON file content
PUT  /api/admin/content/:file  → Update JSON file

POST /api/admin/upload         → Upload image
GET  /api/admin/media          → List uploaded images
DELETE /api/admin/media/:id    → Delete image

GET  /api/admin/users          → List admins
POST /api/admin/users          → Create admin
PUT  /api/admin/users/:id      → Update admin
DELETE /api/admin/users/:id    → Delete admin (not primary)

GET  /api/admin/audit          → View audit logs
```

---

## 🎨 Component Architecture

### Layout Components
- `Navbar` - Navigation, language switcher
- `Footer` - Links, social, contact
- `AdminLayout` - Admin panel wrapper with auth check

### Section Components (Public Site)
- `Hero`, `Story`, `MenuHighlights`, `Visit`, etc.
- Receive translations as props
- Handle own animations

### Admin Components
- `AdminSidebar` - Navigation menu
- `ContentEditor` - JSON editing forms
- `MediaUploader` - Image upload with preview
- `UserManager` - Admin user CRUD

---

## 🔄 Data Flow

### Public Site
```
JSON Files (en.json, menu.json)
    │
    ├── loadTranslations(locale)
    │
    └── Server Component renders page
            │
            └── Client Components receive as props
```

### Admin Panel
```
Admin UI
    │
    ├── API Request (with session cookie)
    │
    ├── Validate Session
    │
    ├── Read/Write JSON Files
    │
    ├── Log to Audit Trail
    │
    └── Return Response
```

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev          # Start dev server on :3000
```

### Production Build
```bash
npm run build        # Build for production
```

### Database Setup (First Time)
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Create database tables
npm run setup-admin  # Create initial super admin
```

---

## 📊 Integrations

| Service | Purpose |
|---------|---------|
| UMAI | Reservation widget |
| Google Tag Manager | Analytics (GTM-MZ83M6VJ) |
| Google Analytics 4 | Tracking (G-4J9BRDE61S) |
| reCAPTCHA Enterprise | Form protection |
| Google Maps | Contact page embed |

---

## 🔒 Security Measures

| Layer | Protection |
|-------|------------|
| Passwords | Bcrypt hash (12 rounds) |
| Sessions | HTTP-only, Secure, SameSite cookies |
| API | Auth check on all admin routes |
| Input | Validation & sanitization |
| Files | Type whitelist, size limits, renamed |
| Audit | All changes logged with user/IP |
| Headers | X-Frame-Options, CSP, etc. |

See `SECURITY.md` for full details.
