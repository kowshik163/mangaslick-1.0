/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/mdx-api/:path*",
          destination: "https://api.mangadex.org/:path*",
        },
        {
            source: "/mdx-api/covers/:path*",
            destination: "https://uploads.mangadex.org/covers/:path*",
          },
      ];
    },
  };
  
  module.exports = nextConfig;