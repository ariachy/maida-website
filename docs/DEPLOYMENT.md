# Maída Website - Deployment Guide

## 🚀 Deployment to Namecheap

### Prerequisites
- FTP client (FileZilla, Cyberduck, etc.)
- Node.js 18+ installed locally
- Namecheap hosting credentials

---

## 📦 Build Process

### 1. Install Dependencies
```bash
cd maida.pt
npm install
```

### 2. Build for Production
```bash
npm run build
```

This command:
- Compiles TypeScript
- Bundles and optimizes JavaScript
- Generates static HTML for all routes
- Outputs to `/out` directory

### 3. Verify Build
```bash
# Check the output
ls -la out/

# Should see:
# - en/
# - pt/
# - _next/
# - images/
# - index.html
```

---

## 📤 Upload to Namecheap

### Via FTP (FileZilla)

1. **Connect to your server**
   ```
   Host: ftp.maida.pt
   Username: your_ftp_username
   Password: your_ftp_password
   Port: 21
   ```

2. **Navigate to public_html**
   ```
   Remote site: /public_html
   ```

3. **Upload the /out folder contents**
   - Select all files/folders inside `/out`
   - Drag to `/public_html`
   - Overwrite existing files when prompted

4. **Verify upload**
   - Visit https://maida.pt
   - Check all pages load correctly
   - Test language switching

---

## ⚙️ Server Configuration

### .htaccess (Apache)

Create `/public_html/.htaccess`:

```apache
# Enable rewrite engine
RewriteEngine On

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove trailing slash
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)/$ /$1 [L,R=301]

# Handle clean URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Block query parameter spam (soft 404 fix)
RewriteCond %{QUERY_STRING} ^(MD|ND|.{1,2})$ [NC]
RewriteRule ^(.*)$ /$1? [R=301,L]

# Custom 404
ErrorDocument 404 /404.html

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>
```

---

## 🔄 Update Workflow

### Quick Deploy
```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Upload /out folder via FTP
```

### Checklist
- [ ] Changes tested locally
- [ ] Build succeeds
- [ ] Uploaded to correct directory
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] All pages working
- [ ] Mobile view tested

---

## ✅ Post-Deployment Verification

### Run Test Script
```bash
node test-site.js
```

### Manual Checks
- [ ] Homepage loads (`/en`, `/pt`)
- [ ] All pages accessible
- [ ] hreflang tags present (View Source → search "hreflang")
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Images loading
- [ ] UMAI widget opens
- [ ] Mobile responsive

### Google Search Console
After deployment:
1. Go to Search Console
2. URL Inspection → test key pages
3. Sitemaps → resubmit if updated
4. Request indexing for new/changed pages

---

## 🔐 Admin Panel Deployment (Future)

When admin panel is added:

### Environment Variables
Create `.env.local` on server (never commit):
```env
DATABASE_URL="file:./prisma/admin.db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://maida.pt"
```

### Database Setup
```bash
# On first deploy
npx prisma generate
npx prisma db push
npm run setup-admin
```

### Files to Exclude from Git
```gitignore
.env
.env.local
prisma/admin.db
prisma/admin.db-journal
public/uploads/*
!public/uploads/.gitkeep
```

### Admin URL
```
https://maida.pt/admin
```

---

## 🛠 Troubleshooting

### 404 Errors
- Check `.htaccess` uploaded
- Verify folder structure matches routes
- Clear browser cache

### Soft 404 in Search Console
- Usually spam bots with query params (?MD, ?ND)
- The .htaccess rule above blocks these
- Validate fix in Search Console

### Images Not Loading
- Check paths are lowercase
- Verify files uploaded to `/images/`
- Check file permissions (644)

### hreflang Not Detected
- View page source, search for "hreflang"
- If present in source but tool fails, tool may have issues
- Google will see it correctly

### Styles Missing
- Hard refresh (Ctrl+Shift+R)
- Check `_next` folder uploaded
- Clear CDN cache if using Cloudflare

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Mobile PageSpeed | 60+ |
| Desktop PageSpeed | 80+ |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

Test at: https://pagespeed.web.dev

---

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| https://maida.pt | Live site |
| https://maida.pt/sitemap.xml | Sitemap |
| https://maida.pt/en | English homepage |
| https://maida.pt/pt | Portuguese homepage |
| https://search.google.com/search-console | Search Console |
| https://pagespeed.web.dev | Performance testing |
