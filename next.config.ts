import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  // Both packages ship prebuilt native binaries (sharp = libvips bindings,
  // ffmpeg-static = the actual ffmpeg executable). Next.js' bundler can't
  // inline them; they must resolve via Node's require() at runtime.
  serverExternalPackages: ["sharp", "ffmpeg-static"],
};

export default nextConfig;
