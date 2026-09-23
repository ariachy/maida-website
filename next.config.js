/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  trailingSlash: true,
  //basePath: '/new',
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Skip type checking during build (for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Maída Live was renamed to Maída Sessions. Permanent redirect keeps old links,
  // Instagram bios, Google results and bookmarks working.
  async redirects() {
    return [
      {
        source: '/:lang(en|pt)/maida-live/:path*',
        destination: '/:lang/maida-sessions/',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
