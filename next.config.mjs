// Mesocratic Party – Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/about/declaration',
        destination: '/party/declaration',
        permanent: true,
        statusCode: 308,
      },
      {
        source: '/about/mission',
        destination: '/party/mission',
        permanent: true,
        statusCode: 308,
      },
      {
        source: '/about/politics',
        destination: '/party/politics',
        permanent: true,
        statusCode: 308,
      },
    ];
  },
};

export default nextConfig;
