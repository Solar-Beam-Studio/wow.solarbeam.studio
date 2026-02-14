import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@wow/database"],
  serverExternalPackages: ["pg", "pg-connection-string", "pgpass"],
};

export default withNextIntl(nextConfig);
