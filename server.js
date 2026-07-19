const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Paths
const nextDir = path.join(__dirname, '.next');
const maintenancePage = path.join(__dirname, 'public', 'maintenance.html');
const maintenanceFlagFile = path.join(__dirname, '.maintenance');
const buildManifest = path.join(nextDir, 'build-manifest.json');

// Check if Next.js build is ready
function isNextReady() {
  try {
    return fs.existsSync(buildManifest);
  } catch (err) {
    return false;
  }
}

// Check manual maintenance mode
function isMaintenanceMode() {
  return fs.existsSync(maintenanceFlagFile);
}

// Read maintenance HTML
function getMaintenanceHtml() {
  try {
    if (fs.existsSync(maintenancePage)) {
      return fs.readFileSync(maintenancePage, 'utf-8');
    }
  } catch (err) {
    console.error('Error reading maintenance page:', err);
  }

  return `<!DOCTYPE html>
<html>
<head>
  <title>Maída | Updating...</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #2C2C2C;
      color: #F5F1EB;
      text-align: center;
    }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #C4A484; }
    p { color: #9CA3AF; font-size: 1.1rem; }
    .loader {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin: 2rem 0;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #C4A484;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
  </style>
</head>
<body>
  <div>
    <h1>maída</h1>
    <div class="loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <p>We're refreshing our table.<br>This only takes a moment.</p>
  </div>
</body>
</html>`;
}

// Serve maintenance page
function serveMaintenancePage(req, res) {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  // Allow static files from public folder during maintenance
  if (pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2)$/)) {
    const publicFile = path.join(__dirname, 'public', pathname);
    if (fs.existsSync(publicFile)) {
      const ext = path.extname(publicFile).toLowerCase();
      const mimeTypes = {
        '.ico': 'image/x-icon',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      fs.createReadStream(publicFile).pipe(res);
      return;
    }
  }

  res.statusCode = 503;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Retry-After', '30');
  res.setHeader('Cache-Control', 'no-store');
  res.end(getMaintenanceHtml());
}

// Main server — lazy initialization
let nextApp = null;
let nextHandler = null;
let isStartingNext = false;
let nextFailed = false;

async function initNext() {
  if (isStartingNext || nextHandler) return;
  isStartingNext = true;

  try {
    console.log('Initializing Next.js...');
    nextApp = next({ dev, hostname, port });
    await nextApp.prepare();
    // IMPORTANT: only set handler AFTER prepare succeeds
    nextHandler = nextApp.getRequestHandler();
    console.log('Next.js ready');
    isStartingNext = false;
    nextFailed = false;
  } catch (err) {
    console.error('Failed to initialize Next.js:', err);
    nextApp = null;
    nextHandler = null;
    isStartingNext = false;
    nextFailed = true;
  }
}

// Create HTTP server
const server = createServer(async (req, res) => {
  try {
    // Manual maintenance mode
    if (isMaintenanceMode()) {
      const parsedUrl = parse(req.url, true);
      // Allow admin rebuild endpoint through
      if (parsedUrl.pathname === '/api/admin/rebuild' && nextHandler) {
        await nextHandler(req, res, parsedUrl);
        return;
      }
      serveMaintenancePage(req, res);
      return;
    }

    // Check if .next exists
    if (!isNextReady()) {
      serveMaintenancePage(req, res);
      return;
    }

    // Initialize Next.js if not already done
    if (!nextHandler && !isStartingNext) {
      await initNext();
    }

    // If Next.js is ready, use it
    if (nextHandler) {
      const parsedUrl = parse(req.url, true);
      await nextHandler(req, res, parsedUrl);
    } else {
      // Still initializing or failed, serve maintenance
      serveMaintenancePage(req, res);
    }
  } catch (err) {
    console.error('Error handling request:', req.url, err);
    if (!res.headersSent) {
      serveMaintenancePage(req, res);
    }
  }
});

// Watch for .next directory changes
function watchNextDir() {
  setInterval(() => {
    const ready = isNextReady();

    if (ready && !nextHandler && !isStartingNext) {
      console.log('.next directory detected, initializing...');
      initNext();
    } else if (!ready && nextHandler) {
      console.log('.next directory removed, switching to maintenance...');
      nextApp = null;
      nextHandler = null;
    }
  }, 5000);
}

// Start server
server.listen(port, hostname, (err) => {
  if (err) throw err;
  console.log(`> Server listening on http://${hostname}:${port}`);

  if (isNextReady()) {
    initNext();
  } else {
    console.log('.next not found, serving maintenance page');
  }

  watchNextDir();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
