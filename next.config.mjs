/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "scontent-iad3-2.cdninstagram.com",
      },
      {
        protocol: 'https',
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: 'https',
        hostname: "instagram.fxyz1-1.fna.fbcdn.net",
      },
      {
        protocol: 'https',
        hostname: "media.istockphoto.com",
      },
      {
        protocol: 'https',
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: "cdn.yourdomain.com",
      },
    ],
  },
}

export default nextConfig
