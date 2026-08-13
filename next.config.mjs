/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any origin (base64 for local photos)
  images: {
    unoptimized: true,
  },
  // PWA: mark sw.js as static
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
  ],
}

export default nextConfig
