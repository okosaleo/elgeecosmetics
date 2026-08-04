import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/pg/**',
      './node_modules/pg-types/**',
      './node_modules/pg-connection-string/**',
      './node_modules/pg-protocol/**',
      './node_modules/pg-int8/**',
      './node_modules/postgres-array/**',
      './node_modules/postgres-bytea/**',
      './node_modules/postgres-date/**',
      './node_modules/postgres-interval/**',
    ],
  },
  images: {
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "s9fz1hrsic.ufs.sh",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
