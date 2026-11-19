// native.ts
// PURPOSE: Start-up code that only applies when the app runs inside the
// Capacitor shell (Android / iOS). In a normal browser every function here
// is a no-op, so the web build is unaffected.

import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import { Keyboard } from "@capacitor/keyboard"
import { SplashScreen } from "@capacitor/splash-screen"
import { StatusBar, Style } from "@capacitor/status-bar"

import { isNativeApp, openExternal, printPage } from "@/shared/platform"

export { isNativeApp }

/** Event fired on the Android back button. Call preventDefault() to handle it. */
export const BACK_BUTTON_EVENT = "app:backbutton"

function syncStatusBarWithTheme() {
  const apply = () => {
    const dark = document.documentElement.classList.contains("dark")
    // Style.Dark = light text (for dark backgrounds), Style.Light = dark text.
    void StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(
      () => {}
    )
  }
  apply()
  new MutationObserver(apply).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
}

// Existing code calls window.open / window.print directly. Neither works in
// the app WebView, so route them through the native implementations.
function patchBrowserApis() {
  window.open = ((url?: string | URL) => {
    const href = url ? String(url) : ""
    if (href && href !== "about:blank") void openExternal(href)
    return null
  }) as typeof window.open

  window.print = () => {
    void printPage().catch((error) => console.error("Print failed:", error))
  }

  // Links with target="_blank" (hyperlinks inside documents, AI answers)
  // would otherwise do nothing on iOS.
  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented) return
      const anchor = (event.target as Element | null)?.closest?.("a[href]")
      if (!anchor) return
      const href = anchor.getAttribute("href") || ""
      const external =
        /^(https?:|mailto:|tel:|sms:)/i.test(href) &&
        !href.startsWith(window.location.origin)
      if (!external) return
      // Inside the editor a plain tap places the cursor; the editor's own
      // link handler decides what to do.
      if (anchor.closest('[contenteditable="true"]')) return
      event.preventDefault()
      void openExternal(href)
    },
    false
  )
}

function handleBackButton() {
  App.addListener("backButton", ({ canGoBack }) => {
    // 1. Let screens close their own panels/sheets first.
    const backEvent = new CustomEvent(BACK_BUTTON_EVENT, { cancelable: true })
    window.dispatchEvent(backEvent)
    if (backEvent.defaultPrevented) return

    // 2. Close an open dialog/menu (they all close on Escape).
    const overlay = document.querySelector(
      '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'
    )
    if (overlay) {
      const target = (document.activeElement as HTMLElement | null) ?? document.body
      target.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })
      )
      return
    }

    // 3. Navigate back, or leave the app at the first screen.
    if (canGoBack && window.history.length > 1) {
      window.history.back()
    } else {
      void App.exitApp()
    }
  })
}

function keepFocusedFieldVisible() {
  Keyboard.addListener("keyboardDidShow", () => {
    const active = document.activeElement as HTMLElement | null
    if (!active) return
    // Only form fields. Scrolling a contenteditable page would jump the
    // document away from the caret.
    if (!active.matches("input, textarea, select")) return
    active.scrollIntoView({ block: "center", behavior: "smooth" })
  })
}

export async function setupNativeApp(): Promise<void> {
  if (!isNativeApp) return

  const root = document.documentElement
  root.classList.add("native-app", `platform-${Capacitor.getPlatform()}`)

  patchBrowserApis()
  handleBackButton()
  keepFocusedFieldVisible()

  try {
    syncStatusBarWithTheme()
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#D3E3FD" })
    }
  } catch {
    // Not supported on every Android version (edge-to-edge); ignore.
  }

  // Hide the splash screen after the first paint.
  requestAnimationFrame(() => {
    void SplashScreen.hide()
  })
}
