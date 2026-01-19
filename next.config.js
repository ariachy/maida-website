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
}

module.exports = nextConfig
