// native.ts
// PURPOSE: Start-up code that only applies when the app runs inside the
// Capacitor shell (Android / iOS). In a normal browser every function here
// is a no-op, so the web build is unaffected.

import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import { Keyboard } from "@capacitor/keyboard"
import { SplashScreen } from "@capacitor/splash-screen"
import { StatusBar, Style } from "@capacitor/status-bar"

export const isNativeApp = Capacitor.isNativePlatform()

export async function setupNativeApp(): Promise<void> {
  if (!isNativeApp) return

  document.documentElement.classList.add("native-app")
  document.documentElement.classList.add(
    `platform-${Capacitor.getPlatform()}`
  )

  try {
    await StatusBar.setStyle({ style: Style.Light })
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#D3E3FD" })
    }
  } catch {
    // Status bar plugin is optional; ignore failures.
  }

  // Android hardware back button: go back in history, exit at the root.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.history.length > 1) {
      window.history.back()
    } else {
      void App.exitApp()
    }
  })

  // Scroll the focused field into view when the soft keyboard opens.
  Keyboard.addListener("keyboardDidShow", () => {
    document.activeElement?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    })
  })

  // Hide the splash screen after the first paint.
  requestAnimationFrame(() => {
    void SplashScreen.hide()
  })
}
