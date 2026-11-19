import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const rootDir = import.meta.dirname

// `npm run build:mobile` runs Vite with --mode mobile. The API URL is baked
// into the app at build time, and "localhost" on a phone is the phone itself,
// so stop the build early with a clear message instead of shipping an app
// that cannot log in.
function assertMobileApiUrl(mode: string) {
  if (mode !== "mobile") return
  const { VITE_API_URL: url = "" } = loadEnv(mode, rootDir, "VITE_")
  const fix =
    "Create editor/.env.mobile with VITE_API_URL=<backend URL the phone can reach>, e.g.\n" +
    "  VITE_API_URL=https://api.your-domain.com      (deployed backend)\n" +
    "  VITE_API_URL=http://192.168.1.20:8088         (your PC's Wi-Fi IP, same network)\n" +
    "  VITE_API_URL=http://10.0.2.2:8088             (Android emulator -> your PC)"
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`[mobile] VITE_API_URL is not set.\n${fix}`)
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(url)) {
    throw new Error(
      `[mobile] VITE_API_URL is "${url}". A phone cannot reach your PC through localhost.\n${fix}`
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  assertMobileApiUrl(mode)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
    },
    publicDir: path.resolve(rootDir, "./public"),
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
  }
})
