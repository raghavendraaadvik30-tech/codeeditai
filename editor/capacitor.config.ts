import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.docupilot.app",
  appName: "DocuPilot",
  webDir: "dist",
  // Android serves the app from https://localhost (not http) so that
  // secure-context browser APIs (clipboard, crypto, etc.) keep working.
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "never", // the web layer handles safe areas itself
    backgroundColor: "#D3E3FD",
  },
  android: {
    backgroundColor: "#D3E3FD",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false, // hidden manually once React has mounted
      backgroundColor: "#D3E3FD",
    },
    Keyboard: {
      resize: "body",
    },
  },
}

export default config
