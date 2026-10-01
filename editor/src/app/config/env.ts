// Centralized frontend environment configuration.

export const env = {
  // Backend API base URL.
  // Set VITE_API_URL in .env when backend is connected.
  apiUrl:
    (import.meta as any).env?.VITE_API_URL ||
    "https://api.example.com",

  // Google Fonts API key.
  googleFontsApiKey:
    (import.meta as any).env?.VITE_GOOGLE_FONTS_API_KEY ||
    "",

  // Current application environment.
  env:
    (import.meta as any).env?.MODE ||
    "development",
};