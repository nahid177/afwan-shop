/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'forum-web-storage.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'afwanimage.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'techmade.s3.us-east-1.amazonaws.com',
          pathname: '/**',
        },
      ],
      
      },
};

export default nextConfig;
