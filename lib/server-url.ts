import "server-only";

const PRODUCTION_APP_URL = "https://www.crypticsolutionsltd.com";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export function getServerAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) return PRODUCTION_APP_URL;

  try {
    const url = new URL(configuredUrl);
    if (process.env.NODE_ENV === "production" && LOCAL_HOSTNAMES.has(url.hostname)) {
      return PRODUCTION_APP_URL;
    }
    return url.origin;
  } catch {
    return PRODUCTION_APP_URL;
  }
}
