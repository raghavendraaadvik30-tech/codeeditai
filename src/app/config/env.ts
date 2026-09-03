// Centralized frontend environment configuration.

export const env = {
  // Backend API base URL.
  // TODO: Set VITE_API_URL in .env when backend is connected.
  apiUrl:
    (import.meta as any).env?.VITE_API_URL ||
    "https://api.example.com",

  // Current application environment (development/production).
  // Used to identify the runtime environment.
  env:
    (import.meta as any).env?.MODE ||
    "development",
};