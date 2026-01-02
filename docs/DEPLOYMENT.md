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
cd maida-website
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
# - de/
# - it/
# - es/
# - images/
# - _next/
# - index.html (redirects to /en)
```

---

## 📤 Upload to Namecheap

### Via FTP (FileZilla)

1. **Connect to your server**
   ```
   Host: ftp.maida.pt (or your server)
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

### Via cPanel File Manager

1. Log into Namecheap cPanel
2. Open File Manager
3. Navigate to `public_html`
4. Upload a ZIP of the `/out` folder
5. Extract the ZIP
6. Move contents to `public_html` root

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

# Remove trailing slash (except for directories)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)/$ /$1 [L,R=301]

# Handle clean URLs for Next.js static export
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Custom 404
ErrorDocument 404 /404.html

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
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

### Making Changes

1. **Edit files locally**
2. **Test locally**
   ```bash
   npm run dev
   # Check http://localhost:3000
   ```
3. **Build**
   ```bash
   npm run build
   ```
4. **Upload changed files**
   - Only upload files that changed
   - Or re-upload entire `/out` folder

### Quick Checklist
- [ ] Changes tested locally
- [ ] Build succeeds without errors
- [ ] Uploaded to correct directory
- [ ] Cache cleared if needed
- [ ] All pages working
- [ ] Mobile view tested

---

## 🌐 Domain Configuration

### DNS Settings (if not already configured)

In Namecheap DNS settings:
```
Type    Host    Value           TTL
A       @       [server IP]     Automatic
CNAME   www     maida.pt        Automatic
```

### SSL Certificate

Namecheap usually provides free SSL via:
- AutoSSL (cPanel)
- Let's Encrypt

Ensure HTTPS is working before launch.

---

## 🐛 Troubleshooting

### 404 Errors on Routes
- Check `.htaccess` is uploaded
- Verify `trailingSlash: true` in next.config.js
- Clear browser cache

### Images Not Loading
- Check file paths are correct
- Verify images uploaded to `/public_html/images/`
- Check file permissions (644 for files)

### Styles Not Applying
- Hard refresh (Ctrl+Shift+R)
- Check `_next` folder uploaded correctly
- Verify CSS files exist

### Language Routes Not Working
- Ensure all `/en/`, `/pt/` etc. folders uploaded
- Check `.htaccess` rules

---

## 📊 Post-Deployment Checks

### Functionality
- [ ] Homepage loads
- [ ] All language versions work
- [ ] Menu page and filtering works
- [ ] Navigation works
- [ ] Mobile menu works
- [ ] UMAI reservation widget opens
- [ ] Contact links work
- [ ] Social links work

### Performance
- [ ] Run Lighthouse audit (aim for 90+)
- [ ] Check Core Web Vitals
- [ ] Test on slow connection (3G)

### SEO
- [ ] Title tags correct
- [ ] Meta descriptions present
- [ ] Open Graph images working
- [ ] Robots.txt accessible
- [ ] Sitemap.xml uploaded (if created)

---

## 🔮 Future: CI/CD Setup

When ready for automated deployments:

### Option 1: GitHub Actions + FTP
```yaml
# .github/workflows/deploy.yml
name: Deploy to Namecheap
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: SamKirkland/FTP-Deploy-Action@v4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./out/
```

### Option 2: Move to VPS
For backend features, consider:
- DigitalOcean
- Linode
- Vultr

With proper Node.js hosting for API routes.
