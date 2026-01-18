/**
 * Maída Website Test Script
 * Run with: node test-site.js
 * 
 * Prerequisites: npm install node-fetch cheerio
 */

const BASE_URL = 'https://maida.pt';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const pass = (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const fail = (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`);
const info = (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
const section = (msg) => console.log(`\n${colors.yellow}═══ ${msg} ═══${colors.reset}`);

// Test results
const results = { passed: 0, failed: 0, errors: [] };

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MaidaTestBot/1.0' }
    });
    const html = await response.text();
    return { status: response.status, html, ok: response.ok };
  } catch (error) {
    return { status: 0, html: '', ok: false, error: error.message };
  }
}

function checkHreflang(html, path) {
  const tests = [];
  
  // Check for hreflang tags (handle both quote styles and variations)
  const hasEnHreflang = html.includes('hreflang="en"') || html.includes("hreflang='en'") || html.includes('hreflang=en');
  const hasPtHreflang = html.includes('hreflang="pt"') || html.includes("hreflang='pt'") || html.includes('hreflang=pt');
  const hasXDefault = html.includes('hreflang="x-default"') || html.includes("hreflang='x-default'") || html.includes('x-default');
  
  if (hasEnHreflang) {
    tests.push({ pass: true, msg: `hreflang="en" found` });
  } else {
    tests.push({ pass: false, msg: `hreflang="en" missing` });
  }
  
  if (hasPtHreflang) {
    tests.push({ pass: true, msg: `hreflang="pt" found` });
  } else {
    tests.push({ pass: false, msg: `hreflang="pt" missing` });
  }
  
  if (hasXDefault) {
    tests.push({ pass: true, msg: `hreflang="x-default" found` });
  } else {
    tests.push({ pass: false, msg: `hreflang="x-default" missing` });
  }
  
  return tests;
}

function checkMetaTags(html) {
  const tests = [];
  
  // Title
  const hasTitle = html.includes('<title>') && html.includes('Maída');
  tests.push({ 
    pass: hasTitle, 
    msg: hasTitle ? 'Title tag present with Maída' : 'Title tag missing or incorrect' 
  });
  
  // Meta description
  const hasDescription = html.includes('meta name="description"');
  tests.push({ 
    pass: hasDescription, 
    msg: hasDescription ? 'Meta description present' : 'Meta description missing' 
  });
  
  // Open Graph
  const hasOG = html.includes('og:title');
  tests.push({ 
    pass: hasOG, 
    msg: hasOG ? 'Open Graph tags present' : 'Open Graph tags missing' 
  });
  
  // Canonical
  const hasCanonical = html.includes('rel="canonical"');
  tests.push({ 
    pass: hasCanonical, 
    msg: hasCanonical ? 'Canonical tag present' : 'Canonical tag missing' 
  });
  
  return tests;
}

async function testPage(path, locale, checkContent = null) {
  const url = `${BASE_URL}${path}`;
  const { status, html, ok, error } = await fetchPage(url);
  
  if (error) {
    fail(`${path} - Network error: ${error}`);
    results.failed++;
    results.errors.push({ path, error });
    return;
  }
  
  if (ok) {
    pass(`${path} - Status ${status}`);
    results.passed++;
  } else {
    fail(`${path} - Status ${status}`);
    results.failed++;
    results.errors.push({ path, status });
    return;
  }
  
  // Check hreflang
  const hreflangTests = checkHreflang(html, path);
  hreflangTests.forEach(t => {
    if (t.pass) {
      pass(`  ${path} - ${t.msg}`);
      results.passed++;
    } else {
      fail(`  ${path} - ${t.msg}`);
      results.failed++;
    }
  });
  
  // Check custom content if provided
  if (checkContent) {
    checkContent.forEach(content => {
      if (html.includes(content)) {
        pass(`  ${path} - Contains "${content.substring(0, 40)}..."`);
        results.passed++;
      } else {
        fail(`  ${path} - Missing "${content.substring(0, 40)}..."`);
        results.failed++;
      }
    });
  }
}

async function testSitemap() {
  const url = `${BASE_URL}/sitemap.xml`;
  const { status, html, ok } = await fetchPage(url);
  
  if (ok && html.includes('<urlset')) {
    pass(`Sitemap accessible at /sitemap.xml`);
    results.passed++;
    
    // Count URLs
    const urlCount = (html.match(/<url>/g) || []).length;
    info(`  Sitemap contains ${urlCount} URLs`);
    
    // Check for both locales
    const hasEn = html.includes('/en');
    const hasPt = html.includes('/pt');
    
    if (hasEn) {
      pass(`  Sitemap includes /en URLs`);
      results.passed++;
    } else {
      fail(`  Sitemap missing /en URLs`);
      results.failed++;
    }
    
    if (hasPt) {
      pass(`  Sitemap includes /pt URLs`);
      results.passed++;
    } else {
      fail(`  Sitemap missing /pt URLs`);
      results.failed++;
    }
  } else {
    fail(`Sitemap not accessible or invalid`);
    results.failed++;
  }
}

async function testMenuContent() {
  const url = `${BASE_URL}/en/menu`;
  const { html, ok } = await fetchPage(url);
  
  if (!ok) {
    fail(`Cannot test menu content - page not accessible`);
    results.failed++;
    return;
  }
  
  // Check for items that should have descriptions
  const itemsToCheck = [
    { name: 'Shawarma', desc: 'fries' },
    { name: 'Salmon', desc: 'tahini' },
    { name: 'Tiramisu', desc: 'mascarpone' },
    { name: 'Znoud', desc: 'baklava' },
  ];
  
  itemsToCheck.forEach(item => {
    if (html.includes(item.desc)) {
      pass(`  Menu has ${item.name} description`);
      results.passed++;
    } else {
      fail(`  Menu missing ${item.name} description`);
      results.failed++;
    }
  });
  
  // Check Pain Perdu is removed
  if (!html.includes('Pain Perdu') && !html.includes('pain-perdu')) {
    pass(`  Pain Perdu removed from menu`);
    results.passed++;
  } else {
    fail(`  Pain Perdu still in menu`);
    results.failed++;
  }
}

async function runTests() {
  console.log(`
╔═══════════════════════════════════════════╗
║     Maída Website Test Suite              ║
║     Testing: ${BASE_URL}                  ║
╚═══════════════════════════════════════════╝
  `);
  
  // Test pages
  section('PAGE ACCESSIBILITY & HREFLANG');
  
  const pages = [
    '/en',
    '/pt',
    '/en/menu',
    '/pt/menu',
    '/en/story',
    '/pt/story',
    '/en/contact',
    '/pt/contact',
    '/en/maida-live',
    '/pt/maida-live',
    '/en/maida-saj',
    '/pt/maida-saj',
    '/en/coffee-tea',
    '/pt/coffee-tea',
    '/en/blog',
    '/pt/blog',
  ];
  
  for (const page of pages) {
    await testPage(page, page.startsWith('/en') ? 'en' : 'pt');
  }
  
  // Test sitemap
  section('SITEMAP');
  await testSitemap();
  
  // Test menu content
  section('MENU CONTENT');
  await testMenuContent();
  
  // Test meta tags on homepage
  section('META TAGS (Homepage)');
  const { html } = await fetchPage(`${BASE_URL}/en`);
  const metaTests = checkMetaTags(html);
  metaTests.forEach(t => {
    if (t.pass) {
      pass(`  ${t.msg}`);
      results.passed++;
    } else {
      fail(`  ${t.msg}`);
      results.failed++;
    }
  });
  
  // Summary
  section('SUMMARY');
  console.log(`
  Total Passed: ${colors.green}${results.passed}${colors.reset}
  Total Failed: ${colors.red}${results.failed}${colors.reset}
  `);
  
  if (results.errors.length > 0) {
    console.log(`${colors.red}Errors:${colors.reset}`);
    results.errors.forEach(e => {
      console.log(`  - ${e.path}: ${e.error || `Status ${e.status}`}`);
    });
  }
  
  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Review the issues above.${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(console.error);
