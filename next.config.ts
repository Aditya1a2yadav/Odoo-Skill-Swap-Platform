import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'icons.veryicon.com', pathname: '/**' },
    ],
  },

  /**
   * Add the following configuration to allow requests from your
   * Firebase Studio development environment.
  
 */
  // → ONLY hostnames (and port if you needed one), no protocol
  allowedDevOrigins: [
    'localhost:9002',            // direct local
    '0.0.0.0:9002',              // sometimes used
    '*.cloudworkstations.dev'    // matches both 9000-… and 6000-… origins
  ],
}

export default nextConfig
