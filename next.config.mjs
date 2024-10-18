/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'forum-web-storage.s3.us-east-1.amazonaws.com',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
