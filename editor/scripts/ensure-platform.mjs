// ensure-platform.mjs
// Usage: node scripts/ensure-platform.mjs android|ios
//
// Creates the native project (android/ or ios/) the first time, so
// `npm run android` / `npm run ios` work without a separate
// `npx cap add` step. Does nothing if the folder already exists.

import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { join } from "node:path"

const platform = process.argv[2]
if (platform !== "android" && platform !== "ios") {
  console.error("Usage: node scripts/ensure-platform.mjs android|ios")
  process.exit(1)
}

if (platform === "ios" && process.platform !== "darwin") {
  console.error(
    "[ensure-platform] iOS apps can only be built on a Mac with Xcode. Use `npm run android` on Windows."
  )
  process.exit(1)
}

const projectDir = join(process.cwd(), platform)
if (existsSync(projectDir)) process.exit(0)

console.log(`[ensure-platform] ${platform}/ not found, running "npx cap add ${platform}"...`)
const result = spawnSync("npx", ["cap", "add", platform], {
  stdio: "inherit",
  shell: process.platform === "win32", // npx is npx.cmd on Windows
})
process.exit(result.status ?? 1)
