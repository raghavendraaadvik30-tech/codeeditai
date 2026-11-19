// platform/index.ts
// PURPOSE: One place for features that behave differently in a browser and
// inside the Android / iOS app (Capacitor). Feature code calls these helpers
// instead of browser-only APIs, so the same code works everywhere.
//
// Browser-only APIs that do NOT work inside the app WebView:
// - <a download> / blob URLs      -> saveFile() (writes the file, opens the share sheet)
// - window.print()                -> printPage() (native print dialog, incl. "Save as PDF")
// - window.open(url, "_blank")    -> openExternal() (in-app browser / mail app)
// - navigator.clipboard (iOS)     -> copyText() (falls back to execCommand)

import { Capacitor } from "@capacitor/core"
import { Browser } from "@capacitor/browser"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"
import { Printer } from "@capgo/capacitor-printer"

import { env } from "@/app/config/env"

export const isNativeApp = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform() as "web" | "android" | "ios"

// Keep a reference to the real browser functions; native.ts replaces the
// window versions with app-safe wrappers.
const browserOpen = window.open.bind(window)
const browserPrint = window.print.bind(window)

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = String(reader.result)
      resolve(result.slice(result.indexOf(",") + 1))
    }
    reader.readAsDataURL(blob)
  })
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "file"
}

function isShareCancel(error: unknown): boolean {
  const message = String((error as { message?: string })?.message ?? error)
  return /cancel/i.test(message)
}

/**
 * Save a generated file.
 * Web: normal browser download.
 * App: writes the file to the app cache and opens the system share sheet,
 * where the user can pick "Save to Files", Drive, WhatsApp, Mail, etc.
 */
export async function saveFile(blob: Blob, fileName: string): Promise<void> {
  const name = safeFileName(fileName)

  if (!isNativeApp) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = name
    anchor.rel = "noopener"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return
  }

  const { uri } = await Filesystem.writeFile({
    path: name,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
    recursive: true,
  })

  try {
    await Share.share({ title: name, files: [uri], dialogTitle: `Save ${name}` })
  } catch (error) {
    if (!isShareCancel(error)) throw error
  }
}

/**
 * Open a link outside the app.
 * http(s) opens the in-app browser (Safari View Controller / Chrome Custom
 * Tab). mailto:, tel: and other schemes are handed to the OS, which opens
 * the matching app.
 */
export async function openExternal(url: string): Promise<void> {
  if (!url) return

  if (!isNativeApp) {
    browserOpen(url, "_blank", "noopener,noreferrer")
    return
  }

  if (/^https?:\/\//i.test(url)) {
    await Browser.open({ url })
  } else {
    window.location.href = url
  }
}

/**
 * Print the current page using its @media print styles.
 * Browser: window.print(). App: the native print dialog, which also offers
 * "Save as PDF". Resolves once the dialog has been handed to the OS.
 */
export async function printPage(jobName = document.title || "Document"): Promise<void> {
  if (!isNativeApp) {
    browserPrint()
    return
  }
  await Printer.printWebView({ name: jobName })
}

/** Copy text to the clipboard, with a fallback for WebViews without the Clipboard API. */
export async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // fall through to the legacy path
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.top = "0"
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  const ok = document.execCommand("copy")
  textarea.remove()
  if (!ok) throw new Error("Copy to clipboard is not available")
}

/**
 * Public address of the web app, used in links sent to other people
 * (invitation emails etc.). Inside the app, window.location.origin is
 * "https://localhost" / "capacitor://localhost", which is useless to the
 * recipient, so VITE_PUBLIC_APP_URL is used instead.
 */
export function publicAppUrl(): string {
  return env.publicAppUrl || window.location.origin
}
