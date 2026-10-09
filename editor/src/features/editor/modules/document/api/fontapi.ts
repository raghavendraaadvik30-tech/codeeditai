export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
}

interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

/**
 * Standard cross-platform system fonts commonly used in document editing.
 * These are already installed on user systems and do not require external web font loading.
 */
export const STANDARD_SYSTEM_FONTS = [
  "Calibri",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Trebuchet MS",
  "Tahoma",
  "Garamond",
  "Comic Sans MS",
  "Impact",
];

const SYSTEM_FONT_SET = new Set(
  [
    ...STANDARD_SYSTEM_FONTS,
    "geist",
    "geist variable",
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
  ].map((f) => f.toLowerCase())
);

/**
 * Checks whether a font is a local/system font that should not be queried from Google Fonts CDN.
 */
export function isSystemFont(fontFamily: string): boolean {
  if (!fontFamily) return false;
  return SYSTEM_FONT_SET.has(fontFamily.trim().toLowerCase());
}

/**
 * Curated list of top popular Google Fonts.
 * Used as default when no Google Fonts API key is provided, or when offline.
 */
export const POPULAR_GOOGLE_FONTS: GoogleFont[] = [
  { family: "Roboto", category: "sans-serif", variants: ["400", "500", "700"], subsets: ["latin"], version: "v30", lastModified: "", files: {} },
  { family: "Open Sans", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v35", lastModified: "", files: {} },
  { family: "Lato", category: "sans-serif", variants: ["400", "700"], subsets: ["latin"], version: "v24", lastModified: "", files: {} },
  { family: "Montserrat", category: "sans-serif", variants: ["400", "500", "600", "700"], subsets: ["latin"], version: "v25", lastModified: "", files: {} },
  { family: "Inter", category: "sans-serif", variants: ["400", "500", "600", "700"], subsets: ["latin"], version: "v12", lastModified: "", files: {} },
  { family: "Poppins", category: "sans-serif", variants: ["400", "500", "600", "700"], subsets: ["latin"], version: "v20", lastModified: "", files: {} },
  { family: "Oswald", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v49", lastModified: "", files: {} },
  { family: "Raleway", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v28", lastModified: "", files: {} },
  { family: "Nunito", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v25", lastModified: "", files: {} },
  { family: "Merriweather", category: "serif", variants: ["400", "700"], subsets: ["latin"], version: "v30", lastModified: "", files: {} },
  { family: "Playfair Display", category: "serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v30", lastModified: "", files: {} },
  { family: "Lora", category: "serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v32", lastModified: "", files: {} },
  { family: "PT Sans", category: "sans-serif", variants: ["400", "700"], subsets: ["latin"], version: "v17", lastModified: "", files: {} },
  { family: "PT Serif", category: "serif", variants: ["400", "700"], subsets: ["latin"], version: "v17", lastModified: "", files: {} },
  { family: "Rubik", category: "sans-serif", variants: ["400", "500", "700"], subsets: ["latin"], version: "v26", lastModified: "", files: {} },
  { family: "Ubuntu", category: "sans-serif", variants: ["400", "500", "700"], subsets: ["latin"], version: "v20", lastModified: "", files: {} },
  { family: "Source Sans 3", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v15", lastModified: "", files: {} },
  { family: "Work Sans", category: "sans-serif", variants: ["400", "600"], subsets: ["latin"], version: "v18", lastModified: "", files: {} },
  { family: "DM Sans", category: "sans-serif", variants: ["400", "500", "700"], subsets: ["latin"], version: "v14", lastModified: "", files: {} },
  { family: "Fira Sans", category: "sans-serif", variants: ["400", "500", "700"], subsets: ["latin"], version: "v17", lastModified: "", files: {} },
  { family: "Quicksand", category: "sans-serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v30", lastModified: "", files: {} },
  { family: "Barlow", category: "sans-serif", variants: ["400", "600"], subsets: ["latin"], version: "v12", lastModified: "", files: {} },
  { family: "Cinzel", category: "serif", variants: ["400", "600", "700"], subsets: ["latin"], version: "v17", lastModified: "", files: {} },
  { family: "Inconsolata", category: "monospace", variants: ["400", "700"], subsets: ["latin"], version: "v31", lastModified: "", files: {} },
  { family: "Libre Baskerville", category: "serif", variants: ["400", "700"], subsets: ["latin"], version: "v14", lastModified: "", files: {} },
  { family: "Caveat", category: "handwriting", variants: ["400", "700"], subsets: ["latin"], version: "v17", lastModified: "", files: {} },
  { family: "Dancing Script", category: "handwriting", variants: ["400", "700"], subsets: ["latin"], version: "v24", lastModified: "", files: {} },
  { family: "Pacifico", category: "handwriting", variants: ["400"], subsets: ["latin"], version: "v22", lastModified: "", files: {} },
];

const GOOGLE_FONTS_API = "https://www.googleapis.com/webfonts/v1/webfonts";

/**
 * Validates that an API key is non-empty and not a dummy placeholder value.
 */
function isValidApiKey(key: unknown): key is string {
  if (typeof key !== "string") return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (
    trimmed === "YOUR_ACTUAL_GOOGLE_FONTS_API_KEY" ||
    trimmed.startsWith("YOUR_") ||
    trimmed === "your_api_key_here" ||
    trimmed === "undefined" ||
    trimmed === "null"
  ) {
    return false;
  }
  return true;
}

/**
 * Fetches the Google Fonts directory.
 * If no valid API key is present or the API returns an error, gracefully falls back
 * to a curated list of top Google Fonts without throwing an exception.
 */
export async function fetchAllGoogleFonts(): Promise<GoogleFont[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;

  if (!isValidApiKey(apiKey)) {
    return POPULAR_GOOGLE_FONTS;
  }

  try {
    const url = `${GOOGLE_FONTS_API}?key=${encodeURIComponent(apiKey.trim())}&sort=alpha`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `Google Fonts API returned status ${response.status}. Using curated fonts fallback.`
      );
      return POPULAR_GOOGLE_FONTS;
    }

    const data = (await response.json()) as GoogleFontsResponse;
    if (data.items && data.items.length > 0) {
      return data.items;
    }
    return POPULAR_GOOGLE_FONTS;
  } catch (error) {
    console.warn(
      "Unable to fetch Google Fonts API, using curated fonts fallback:",
      error
    );
    return POPULAR_GOOGLE_FONTS;
  }
}
/**
 * Dynamically loads a Google Font by injecting a stylesheet link tag into <head>.
 * This uses Google's public CSS2 CDN which does not require any API key.
 */
export function loadGoogleFont(fontFamily: string, variant = "400") {
  if (!fontFamily || isSystemFont(fontFamily)) {
    return;
  }

  const id = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;

  if (document.getElementById(id)) {
    return;
  }

  const encodedFamily = encodeURIComponent(fontFamily.trim()).replace(/%20/g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${variant};500;600;700&display=swap`;
  document.head.appendChild(link);
}
