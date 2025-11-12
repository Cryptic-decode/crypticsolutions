import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent optional Node-only deps from breaking client builds
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // pdfjs-dist conditionally requires 'canvas' in Node; not needed in browser
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
