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

const GOOGLE_FONTS_API =
  "https://www.googleapis.com/webfonts/v1/webfonts";

export async function fetchAllGoogleFonts(): Promise<GoogleFont[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VITE_GOOGLE_FONTS_API_KEY is missing"
    );
  }

  const url =
    `${GOOGLE_FONTS_API}?key=${apiKey}&sort=alpha`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Google Fonts API failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as GoogleFontsResponse;

  return data.items || [];
}
export function loadGoogleFont(
  fontFamily: string,
  variant = "400"
) {
  const id =
    `google-font-${fontFamily
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

  if (document.getElementById(id)) {
    return;
  }

  const encodedFamily =
    encodeURIComponent(fontFamily);

  const link =
    document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";

  link.href =
    `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;600;700&display=swap`;

  document.head.appendChild(link);
}