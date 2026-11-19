import { existsSync, readFileSync } from "fs"
import { join } from "path"
import type { CapacitorConfig } from "@capacitor/cli"

// Reads VITE_API_URL the same way `vite build --mode mobile` does
// (.env, .env.local, .env.mobile, .env.mobile.local; later files win),
// so the native settings below always match the URL baked into the app.
function readMobileApiUrl(): string {
  let url = process.env.VITE_API_URL ?? ""
  if (url) return url
  for (const file of [".env", ".env.local", ".env.mobile", ".env.mobile.local"]) {
    const path = join(process.cwd(), file)
    if (!existsSync(path)) continue
    const match = readFileSync(path, "utf8").match(
      /^\s*VITE_API_URL\s*=\s*["']?([^"'\r\n#]*)/m
    )
    if (match?.[1]?.trim()) url = match[1].trim()
  }
  return url
}

// A plain-http backend (e.g. http://192.168.1.20:8088 on your Wi-Fi) is only
// reachable if the WebView may mix https pages with http requests and the OS
// allows cleartext traffic. Both stay off for an https backend.
const usesHttpBackend = readMobileApiUrl().startsWith("http://")

const config: CapacitorConfig = {
  appId: "com.docupilot.app",
  appName: "DocuPilot",
  webDir: "dist",
  server: {
    // Android serves the app from https://localhost so that secure-context
    // browser APIs (clipboard, crypto, etc.) keep working.
    androidScheme: "https",
    cleartext: usesHttpBackend,
  },
  ios: {
    contentInset: "never", // the web layer handles safe areas itself
    backgroundColor: "#D3E3FD",
  },
  android: {
    backgroundColor: "#D3E3FD",
    allowMixedContent: usesHttpBackend,
  },
  plugins: {
    SplashScreen: {
      // Hidden by native.ts as soon as the app has started. The auto-hide
      // is a safety net: if start-up fails, the app shows the error screen
      // instead of being stuck on the splash screen.
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#D3E3FD",
    },
    Keyboard: {
      resize: "body",
    },
  },
}

export default config
