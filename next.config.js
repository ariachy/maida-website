/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  //basePath: '/new',
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Skip type checking during build (for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
