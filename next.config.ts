import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pg', 'pg-types', 'pg-connection-string', 'pg-pool', 'pgpass'],
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/pg-types/**',
      './node_modules/pg-connection-string/**',
      './node_modules/pg-pool/**',
      './node_modules/pgpass/**',
      './node_modules/postgres-array/**',
      './node_modules/postgres-bytea/**',
      './node_modules/postgres-date/**',
      './node_modules/postgres-interval/**',
    ],
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", port: "", pathname: "/f/**" },
      { protocol: "https", hostname: "s9fz1hrsic.ufs.sh", port: "", pathname: "/f/**" },
    ],
  },
};

export default nextConfig;