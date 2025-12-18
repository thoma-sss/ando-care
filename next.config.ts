import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.strava.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
