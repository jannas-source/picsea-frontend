/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['productimageserver.com'],
  },
};

module.exports = nextConfig;
