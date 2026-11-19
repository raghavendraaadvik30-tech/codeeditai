// patch-native.mjs
// Runs after `cap sync` (see the "cap:sync" npm script).
//
// Android and iOS block plain-http requests by default. When the mobile
// build points at an http:// backend (e.g. your PC on Wi-Fi), this script
// enables cleartext traffic in the generated native projects. When the
// backend is https:// it removes those exceptions again, so store builds
// stay secure. Safe to run any number of times.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()

function readApiUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL
  let url = ""
  for (const file of [".env", ".env.local", ".env.mobile", ".env.mobile.local"]) {
    const path = join(root, file)
    if (!existsSync(path)) continue
    const match = readFileSync(path, "utf8").match(
      /^\s*VITE_API_URL\s*=\s*["']?([^"'\r\n#]*)/m
    )
    if (match?.[1]?.trim()) url = match[1].trim()
  }
  return url
}

const apiUrl = readApiUrl()
const allowHttp = apiUrl.startsWith("http://")

function patchAndroid() {
  const path = join(root, "android/app/src/main/AndroidManifest.xml")
  if (!existsSync(path)) return
  let xml = readFileSync(path, "utf8")
  const original = xml

  if (!xml.includes("android.permission.INTERNET")) {
    xml = xml.replace(
      /<application/,
      '<uses-permission android:name="android.permission.INTERNET" />\n\n    <application'
    )
  }

  xml = xml.replace(/\s+android:usesCleartextTraffic="(true|false)"/g, "")
  if (allowHttp) {
    xml = xml.replace(/<application/, '<application\n        android:usesCleartextTraffic="true"')
  }

  if (xml !== original) {
    writeFileSync(path, xml)
    console.log(`[patch-native] Android: cleartext http ${allowHttp ? "enabled" : "disabled"}`)
  }
}

const ATS_BLOCK =
  "\t<key>NSAppTransportSecurity</key>\n\t<dict>\n\t\t<key>NSAllowsArbitraryLoads</key>\n\t\t<true/>\n\t</dict>\n"

function patchIos() {
  const path = join(root, "ios/App/App/Info.plist")
  if (!existsSync(path)) return
  let plist = readFileSync(path, "utf8")
  const original = plist

  // Only touch the exact block this script adds; leave custom ATS rules alone.
  plist = plist.replace(
    /[ \t]*<key>NSAppTransportSecurity<\/key>\s*<dict>\s*<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>\s*<\/dict>\n?/,
    ""
  )
  if (allowHttp && !plist.includes("NSAppTransportSecurity")) {
    plist = plist.replace(/<\/dict>\s*<\/plist>\s*$/, `${ATS_BLOCK}</dict>\n</plist>\n`)
  }

  if (plist !== original) {
    writeFileSync(path, plist)
    console.log(`[patch-native] iOS: http exception ${allowHttp ? "added" : "removed"}`)
  }
}

console.log(`[patch-native] Mobile API URL: ${apiUrl || "(not set)"}`)
patchAndroid()
patchIos()
if (allowHttp) {
  console.log(
    "[patch-native] Plain http is allowed for testing. Use an https:// backend for Play Store / App Store builds."
  )
}
