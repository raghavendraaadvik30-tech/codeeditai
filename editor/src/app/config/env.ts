// Centralized frontend environment configuration.

export const env = {
  // Backend API base URL.
  // Set VITE_API_URL in .env when backend is connected.
  apiUrl:
    import.meta.env?.VITE_API_URL ||
    "http://localhost:8088",

  // Google Fonts API key.
  googleFontsApiKey:
    import.meta.env?.VITE_GOOGLE_FONTS_API_KEY ||
    "",

  // Current application environment.
  env:
    import.meta.env?.MODE ||
    "development",
};
