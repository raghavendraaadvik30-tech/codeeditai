// Centralized frontend environment configuration.

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];

// Backend API base URL.
// Set VITE_API_URL in .env (web) and .env.mobile (Android / iOS app).
//
// Dev convenience: if the URL points at localhost but the page was opened
// from another device (e.g. a phone visiting http://192.168.1.20:5173),
// "localhost" would mean that device. In that case use the host the page
// was loaded from, keeping the configured port and path.
function resolveApiUrl(): string {
  const configured =
    import.meta.env?.VITE_API_URL || "http://localhost:8088";

  if (typeof window === "undefined") return configured;

  try {
    const api = new URL(configured);
    const pageHost = window.location.hostname;
    const isHttpPage = window.location.protocol.startsWith("http");

    if (
      isHttpPage &&
      LOCAL_HOSTS.includes(api.hostname) &&
      pageHost &&
      !LOCAL_HOSTS.includes(pageHost)
    ) {
      api.hostname = pageHost;
      return api.toString().replace(/\/$/, "");
    }
  } catch {
    // Not an absolute URL; use it as-is.
  }

  return configured;
}

export const env = {
  apiUrl: resolveApiUrl(),

  // Google Fonts API key.
  googleFontsApiKey:
    import.meta.env?.VITE_GOOGLE_FONTS_API_KEY ||
    "",

  // Current application environment.
  env:
    import.meta.env?.MODE ||
    "development",
};
