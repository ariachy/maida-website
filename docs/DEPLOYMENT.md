# Maída Website - Deployment Guide

## 🚀 Deployment Overview

The Maída website runs as a **full Next.js server** on Namecheap hosting with Node.js support.

| Component | Technology | Location |
|-----------|------------|----------|
| **Public Site** | Next.js SSG | maida.pt/* |
| **Admin Panel** | Next.js Server | maida.pt/admin/* |
| **API Routes** | Next.js API | maida.pt/api/* |
| **Database** | SQLite + Prisma | prisma/admin.db |

---

## 📦 Namecheap Node.js Deployment

### Prerequisites
- Namecheap hosting with Node.js support (cPanel)
- FTP client (FileZilla)
- Node.js 18+ installed locally
- Terminal/SSH access to server

### Server Structure

```
/home/thehlxvx/maida.pt/           ← Node.js app root
├── .next/                          ← Built Next.js output
├── public/                         ← Static assets
│   ├── images/
│   ├── favicon.ico
│   ├── sitemap.xml
│   ├── robots.txt
│   └── google*.html               ← Search Console verification
├── prisma/
│   ├── schema.prisma
│   └── admin.db                   ← SQLite database
├── src/
│   └── data/                      ← JSON content files
│       ├── locales/
│       │   ├── en.json
│       │   └── pt.json
│       ├── menu.json
│       └── blog.json
├── node_modules/                   ← Installed via NPM Install
├── package.json
├── package-lock.json
├── next.config.js
├── tsconfig.json
├── server.js                      ← Custom server entry point
└── .env                           ← Environment variables

/home/thehlxvx/maida.pt/public_html/
└── .htaccess                      ← Security headers only

/home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/
├── .prisma/                       ← Prisma client (with Linux binaries)
└── @prisma/
```

---

## 🔧 Initial Setup

### 1. Build Locally

```bash
# Ensure next.config.js does NOT have output: 'export'

# Install dependencies
npm install

# Generate Prisma client with Linux binary
npx prisma generate

# Build for production
npm run build
```

### 2. Prisma Configuration

In `prisma/schema.prisma`, include the Linux binary target:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.0.x"]
}
```

### 3. Create server.js

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### 4. Upload via FTP (FileZilla)

**Important:** Set transfer mode to **Binary** (Transfer → Transfer Type → Binary)

Upload to `/home/thehlxvx/maida.pt/`:
- `.next/` folder
- `public/` folder
- `prisma/` folder (including admin.db)
- `src/data/` folder
- `package.json`
- `package-lock.json`
- `next.config.js`
- `tsconfig.json`
- `server.js`
- `.env`

Upload to `/home/thehlxvx/maida.pt/public_html/`:
- `.htaccess`

**Do NOT upload:** `node_modules/`, `.git/`, `out/`

### 5. Upload Prisma Binaries

The Prisma client needs Linux binaries. Upload from your local machine:

```
node_modules/.prisma/  →  /home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/.prisma/
node_modules/@prisma/  →  /home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/@prisma/
```

### 6. Configure Node.js App in cPanel

1. Go to **cPanel → Node.js**
2. Click **CREATE APPLICATION**
3. Settings:
   - **Node.js version:** 20.x
   - **Application mode:** Production
   - **Application root:** `/home/thehlxvx/maida.pt`
   - **Application URL:** `maida.pt`
   - **Startup file:** `server.js`
4. Click **CREATE**
5. Click **Run NPM Install**
6. Add **Environment Variables**:
   - `DATABASE_URL` = `file:/home/thehlxvx/maida.pt/prisma/admin.db`
7. Click **START APP**

### 7. Set Permissions

In cPanel Terminal:
```bash
chmod 777 /home/thehlxvx/maida.pt/prisma/
chmod 666 /home/thehlxvx/maida.pt/prisma/admin.db
```

---

## 🔄 Update Workflow

### Content Updates (JSON files)
```bash
# 1. Edit locally
# 2. Upload changed files via FTP:
#    - src/data/locales/en.json
#    - src/data/locales/pt.json
#    - src/data/menu.json
# 3. Changes take effect on next request (no restart needed for static data)
```

### Code Updates
```bash
# 1. Make changes locally
# 2. Test: npm run dev
# 3. Build: npm run build
# 4. Delete .next on server: rm -rf /home/thehlxvx/maida.pt/.next
# 5. Upload new .next/ folder
# 6. Restart app in cPanel
```

### Prisma Schema Updates
```bash
# 1. Update prisma/schema.prisma
# 2. Run: npx prisma generate
# 3. Upload:
#    - node_modules/.prisma/ → /home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/
#    - node_modules/@prisma/ → /home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/
#    - prisma/admin.db (if schema changed, run migrations first)
# 4. Restart app in cPanel
```

---

## ⚙️ Environment Variables

### Local (.env)
```env
DATABASE_URL="file:./prisma/admin.db"
SMTP_HOST=maida.pt
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USERNAME=noreply@maida.pt
SMTP_PASSWORD=your_password
CONTACT_TO_EMAIL=info@maida.pt
CONTACT_FROM_EMAIL=noreply@maida.pt
RECAPTCHA_SITE_KEY=your_key
RECAPTCHA_API_KEY=your_key
RECAPTCHA_PROJECT_ID=your_project
NEXT_PUBLIC_SITE_URL=https://maida.pt
```

### Server (cPanel Environment Variables)
| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:/home/thehlxvx/maida.pt/prisma/admin.db` |

**Important:** The `DATABASE_URL` in cPanel must use the **absolute path**.

---

## 🛡️ .htaccess Configuration

The `.htaccess` file in `public_html/` handles security headers only (Node.js handles routing):

```apache
# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Cross-Origin-Opener-Policy "same-origin-allow-popups"
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Block sensitive files
<FilesMatch "\.(env|db|log)$">
    Order allow,deny
    Deny from all
</FilesMatch>

Options -Indexes
```

---

## 🐛 Troubleshooting

### "Cannot find module 'next'"
- Run **NPM Install** in cPanel Node.js app
- Ensure `package.json` was uploaded

### "Prisma Client could not locate the Query Engine"
- Upload Prisma binaries to `/home/thehlxvx/nodevenv/maida.pt/20/lib/node_modules/`
- Ensure `binaryTargets` includes `debian-openssl-1.0.x` in schema.prisma

### "Error code 14: Unable to open database file"
1. Check `DATABASE_URL` in cPanel environment variables (must be absolute path)
2. Check file permissions: `chmod 666 prisma/admin.db`
3. Check folder permissions: `chmod 777 prisma/`
4. Restart the app in cPanel

### "404 for static chunks (_next/static/...)"
- Build hashes mismatch - delete `.next` on server and re-upload fresh build
- Ensure all files in `.next/static/chunks/` were uploaded

### "503 Service Unavailable"
- Check `stderr.log` in `/home/thehlxvx/maida.pt/`
- Usually means app crashed - check for missing files or errors

### View Error Logs
```bash
# In cPanel Terminal:
cat /home/thehlxvx/maida.pt/stderr.log
tail -50 /home/thehlxvx/maida.pt/stderr.log
```

---

## ✅ Post-Deployment Checklist

### Public Site
- [ ] Homepage loads (`/en`, `/pt`)
- [ ] All pages accessible
- [ ] Images loading
- [ ] UMAI widget opens
- [ ] Contact form works
- [ ] Mobile responsive

### Admin Panel
- [ ] Login page accessible (`/admin`)
- [ ] Can log in with credentials
- [ ] Dashboard loads
- [ ] Session persists on refresh
- [ ] Logout works
- [ ] Content editors work
- [ ] Media upload works

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Mobile PageSpeed | 60+ | 66 |
| Desktop PageSpeed | 80+ | 90+ |
| LCP | < 2.5s | ✅ |
| FID | < 100ms | ✅ |
| CLS | < 0.1 | ✅ |

Test at: https://pagespeed.web.dev
