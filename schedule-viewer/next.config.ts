import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/calendar/:name.ics',
        destination: '/api/calendar/:name',
      },
    ];
  }
};

export default nextConfig;
