# Maída Website - Technical Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                    (Next.js 14.2.35)                            │
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
│              (Namecheap Node.js v20.19.4)                       │
│                                                                 │
│   Full Next.js server (public site + admin + API routes)        │
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
│   ├── uploads/               # User-uploaded images (gitignored)
│   ├── favicon.ico
│   ├── sitemap.xml
│   ├── robots.txt
│   └── google*.html           # Search Console verification
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
│   │   │   ├── page.tsx       # Login page ✅
│   │   │   └── (protected)/   # Auth-protected routes
│   │   │       ├── layout.tsx     # Admin layout with sidebar ✅
│   │   │       ├── dashboard/     # Dashboard ✅
│   │   │       ├── content/       # Content editors ✅
│   │   │       │   ├── homepage/  ✅
│   │   │       │   ├── menu/      ✅
│   │   │       │   ├── story/     ✅
│   │   │       │   ├── contact/   ✅
│   │   │       │   └── maida-live/ ✅
│   │   │       ├── media/         # Image upload ✅
│   │   │       ├── users/         # User management (Phase 3)
│   │   │       └── settings/      # Account settings (Phase 3)
│   │   │
│   │   └── api/
│   │       └── admin/         # Admin API routes
│   │           ├── auth/
│   │           │   ├── login/     # ✅ Working
│   │           │   ├── logout/    # ✅ Working
│   │           │   └── session/   # ✅ Working
│   │           ├── content/       # ✅ Working
│   │           │   └── [...file]/ # Read/write JSON files
│   │           └── upload/        # ✅ Working
│   │
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, etc.
│   │   ├── sections/          # Page sections
│   │   ├── ui/                # Buttons, Cards, etc.
│   │   ├── menu/              # Menu components
│   │   ├── blog/              # Blog components
│   │   ├── integrations/      # Third-party integrations
│   │   │   └── UmaiLoader.tsx # Deferred UMAI widget loading
│   │   └── admin/             # Admin components
│   │       └── AdminSidebar.tsx   # ✅ Working
│   │
│   ├── data/
│   │   ├── locales/           # Translation files
│   │   │   ├── en.json        # English (~690 lines)
│   │   │   └── pt.json        # Portuguese (~704 lines)
│   │   ├── menu.json          # Menu structure (~150 items)
│   │   └── blog.json          # Blog posts
│   │
│   ├── lib/
│   │   ├── i18n.ts            # Internationalization
│   │   ├── seo.ts             # SEO utilities (hreflang)
│   │   ├── auth.ts            # Authentication ✅
│   │   └── prisma.ts          # Database client ✅
│   │
│   └── styles/
│       └── globals.css        # Global styles, Tailwind
│
├── prisma/
│   ├── schema.prisma          # Database schema ✅
│   └── admin.db               # SQLite database (gitignored) ✅
│
├── scripts/
│   └── setup-admin.ts         # Create primary admin ✅
│
├── server.js                  # Custom Node.js server entry
├── .env                       # Environment variables
├── next.config.js             # Next.js configuration
└── package.json
```

---

## 🌍 Internationalization (i18n)

### Current Languages
| Code | Language | Status |
|------|----------|--------|
| `en` | English | ✅ Complete |
| `pt` | Portuguese | ✅ Complete |
| `de` | German | 🔮 Phase 4 |
| `it` | Italian | 🔮 Phase 4 |
| `es` | Spanish | 🔮 Phase 4 |

### URL Structure
```
maida.pt/en/          → English (default)
maida.pt/pt/          → Portuguese
```

### Translation Files Structure
```json
// src/data/locales/en.json
{
  "locale": "en",
  "nav": { ... },
  "hero": { ... },
  "homeStory": { ... },
  "homeMenu": { ... },
  "menu": {
    "categories": { ... },
    "subCategories": { ... },
    "items": {
      "honey-roasted-halloumi": {
        "name": "Honey Roasted Halloumi",
        "description": "With roasted cherry tomatoes..."
      },
      // ... 100+ items
    }
  },
  "story": { ... },
  "contact": { ... },
  "maidaLive": { ... }
}
```

---

## 🔐 Admin Panel Architecture

### Implementation Status
| Feature | Status |
|---------|--------|
| Login page | ✅ Complete |
| Session auth (cookies) | ✅ Complete |
| Dashboard | ✅ Complete |
| Sidebar navigation | ✅ Complete |
| Logout | ✅ Complete |
| Content editors | ✅ Complete |
| Image upload | ✅ Complete |
| User management | 🔮 Phase 3 |
| Dynamic languages | 🔮 Phase 4 |

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

### Database Schema (Prisma + SQLite)
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.0.x"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String?
  passwordHash String    // Bcrypt (12 rounds)
  isPrimary    Boolean   @default(false)  // Cannot be deleted
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastLogin    DateTime?
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

### API Routes
| Route | Method | Status | Purpose |
|-------|--------|--------|---------|
| `/api/admin/auth/login` | POST | ✅ | Authenticate user |
| `/api/admin/auth/logout` | POST | ✅ | Destroy session |
| `/api/admin/auth/session` | GET | ✅ | Validate session |
| `/api/admin/content/[...file]` | GET | ✅ | Get JSON content |
| `/api/admin/content/[...file]` | PUT | ✅ | Update JSON content |
| `/api/admin/upload` | POST | ✅ | Upload image |
| `/api/admin/upload` | GET | ✅ | List images |
| `/api/admin/upload` | DELETE | ✅ | Delete image |

---

## 🚀 Deployment Architecture

### Server Configuration
| Component | Value |
|-----------|-------|
| **Hosting** | Namecheap cPanel |
| **Node.js** | v20.19.4 |
| **App Root** | `/home/thehlxvx/maida.pt` |
| **Startup File** | `server.js` |
| **Database** | SQLite at `prisma/admin.db` |

### Key Paths
```
/home/thehlxvx/maida.pt/                    # App root
/home/thehlxvx/maida.pt/.next/              # Built Next.js
/home/thehlxvx/maida.pt/prisma/admin.db     # Database
/home/thehlxvx/maida.pt/public_html/.htaccess  # Security headers
/home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/  # Node modules
```

### Environment Variables (cPanel)
| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:/home/thehlxvx/maida.pt/prisma/admin.db` |

---

## 🚀 Development Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Prisma + SQLite setup
- [x] User & Session models
- [x] Login/logout API routes
- [x] Session cookie management
- [x] Admin login page (styled)
- [x] Dashboard page
- [x] Sidebar navigation
- [x] Protected route layout

### Phase 2: Content Management ✅ COMPLETE
- [x] Content API routes (read/write JSON)
- [x] Homepage editor (EN/PT tabs)
- [x] Menu editor (EN/PT tabs)
- [x] Story page editor
- [x] Contact page editor
- [x] Maída Live editor
- [x] Image upload with Sharp optimization
- [x] Production deployment on Namecheap

### Phase 3: User Management (Next)
- [ ] List admin users
- [ ] Create new admin
- [ ] Delete admin (protect primary)
- [ ] Change password
- [ ] Account settings

### Phase 4: Dynamic Languages
- [ ] Language management UI
- [ ] Add/enable/disable languages
- [ ] Auto-generate locale files
- [ ] Frontend language switcher from DB
- [ ] Translation status indicators

---

## 📊 Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| UMAI | Reservation widget | ✅ Deferred loading |
| Google Tag Manager | Analytics (GTM-MZ83M6VJ) | ✅ |
| Google Analytics 4 | Tracking (G-4J9BRDE61S) | ✅ |
| reCAPTCHA Enterprise | Form protection | ✅ |
| Google Maps | Contact page embed | ✅ |

---

## 🔒 Security Measures

| Layer | Protection |
|-------|------------|
| Passwords | Bcrypt hash (12 rounds) |
| Sessions | HTTP-only, Secure, SameSite cookies |
| API | Auth check on all admin routes |
| Cookies | 30-min sliding expiration |
| Headers | HSTS, X-Frame-Options, CSP |
| Database | File permissions (666) |

---

## 📝 Important Notes

### Prisma Binary Targets
For Namecheap deployment, `schema.prisma` must include:
```prisma
binaryTargets = ["native", "debian-openssl-1.0.x"]
```

### Database Path
The `DATABASE_URL` in cPanel must use absolute path:
```
file:/home/thehlxvx/maida.pt/prisma/admin.db
```

### UMAI Widget
- Deferred loading for PageSpeed optimization
- Excluded from `/admin/*` pages
- Loads after user interaction (scroll, click, etc.)

### File Locations
| File | Purpose |
|------|---------|
| `src/data/locales/en.json` | English translations |
| `src/data/locales/pt.json` | Portuguese translations |
| `src/data/menu.json` | Menu structure (no translations) |
| `prisma/admin.db` | Admin users & sessions |
