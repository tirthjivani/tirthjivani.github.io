// Absolute origin for canonical URLs, the sitemap, and OG/Twitter image
// resolution. Without this Next resolves social images against
// "http://localhost:3000", so every share card in production 404s.
//
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is injected at build time and
// tracks the project's production domain (including a custom one once it's
// assigned). NEXT_PUBLIC_SITE_URL overrides it for anything else.
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const SITE_URL = (fromEnv ?? "http://localhost:8080").replace(/\/+$/, "");
