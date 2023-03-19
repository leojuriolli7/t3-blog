/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: [
      "cdn.discordapp.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "t3-images-bucket.s3.sa-east-1.amazonaws.com",
      "t3-avatars-bucket.s3.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
