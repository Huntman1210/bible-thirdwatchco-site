/** @type {import('next').NextConfig} */
// GH_PAGES=1 builds for GitHub Pages subpath hosting
// (huntman1210.github.io/bible-thirdwatchco-site).
// Unset (default) builds for root-domain hosting (bible.thirdwatchco.com via Vercel).
const isGhPages = process.env.GH_PAGES === "1";
const basePath  = isGhPages ? "/bible-thirdwatchco-site" : "";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: { typedRoutes: true },
  basePath,
  assetPrefix: basePath ? basePath + "/" : undefined
};
export default nextConfig;
