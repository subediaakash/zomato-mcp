import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Some remote providers (like source.unsplash.com with redirects) can fail
    // through the Image Optimization pipeline on some deployments. Disabling
    // optimization ensures the browser requests the image directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
