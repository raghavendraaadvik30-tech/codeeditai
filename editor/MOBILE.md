# DocuPilot mobile app (Android + iOS)

The web app is wrapped with [Capacitor 8](https://capacitorjs.com). One React
codebase produces the website, the Android app and the iOS app.

## Requirements

| Target  | Needs |
|---------|-------|
| All     | Node 22+, `npm install` in this folder |
| Android | Android Studio (SDK 36, JDK 21), Windows/macOS/Linux |
| iOS     | A Mac with Xcode 26 (iOS 15+ target) |

## 1. Point the app at your backend

The backend URL is baked into the app when you build it. `localhost` on a
phone means the phone itself, so the mobile build refuses to use it.

Create `editor/.env.mobile` with ONE of these:

```
# A deployed backend (required for Play Store / App Store builds)
VITE_API_URL=https://api.your-domain.com

# Your PC on the same Wi-Fi as the phone (testing). Find the IP with `ipconfig`
# ("IPv4 Address"); Vite also prints it as "Network: http://<ip>:5173".
VITE_API_URL=http://192.168.31.240:8088

# Android emulator talking to your PC
VITE_API_URL=http://10.0.2.2:8088
```

For an `http://` URL the build automatically:
- allows mixed content in the Android WebView (`capacitor.config.ts`),
- adds `android:usesCleartextTraffic="true"` to the Android manifest and an
  ATS exception to the iOS `Info.plist` (`scripts/patch-native.mjs`, run by
  `npm run cap:sync`). Switching to an `https://` URL removes them again.

The Go backend listens on all network interfaces and sends
`Access-Control-Allow-Origin: *`, so it needs no changes. Login uses a Bearer
token in localStorage, so no cookie setup is needed either.

### Windows: let the phone reach the backend on your PC

Run once in an **Administrator** PowerShell:

```powershell
netsh advfirewall firewall add rule name="DocuPilot API 8088" dir=in action=allow protocol=TCP localport=8088
```

Then, with the backend running, open `http://<your-ip>:8088/health` in the
phone's browser. If you don't see `"API is running"`, the app can't connect
either: check that the phone and PC are on the same Wi-Fi (not a guest network)
and that the IP is current.

## 2. One-time setup

```bash
cd editor
npm install
npm run build:mobile      # creates dist/
npx cap add android       # creates android/
npx cap add ios           # creates ios/ (run on a Mac to install pods)
```

Commit the generated `android/` and `ios/` folders.

## 3. Icons and splash screen

Put a 1024x1024 `assets/icon-only.png` (and optionally `assets/splash.png`,
2732x2732) in `editor/assets/`, then:

```bash
npm run assets
```

## 4. Daily workflow

```bash
npm run android        # build, sync, open Android Studio, press Run
npm run ios            # build, sync, open Xcode, press Run
npm run android:run    # build, sync, run on a connected device/emulator
npm run ios:run
```

Re-run one of these after every web change **and after every change to
`.env.mobile`** (they rebuild and sync). Running the old APK will keep the old URL.

## Troubleshooting "cannot connect"

The login screen now shows the exact address the app tried, e.g.
"Cannot reach the server at http://192.168.31.240:8088".

| Symptom | Fix |
|---------|-----|
| Build stops with `[mobile] VITE_API_URL is ...` | Create/fix `editor/.env.mobile` (section 1). |
| Address shown is `localhost` | You're running an old build. Run `npm run android` again. |
| `/health` doesn't open in the phone browser | Firewall rule, same Wi-Fi, backend running, correct IP. |
| `/health` works in phone browser but app fails | Run `npm run cap:sync` so the cleartext patch is applied, then rebuild in Android Studio. |
| Works on emulator only | Emulator uses `10.0.2.2`; a real phone needs your PC's Wi-Fi IP. |

Debug the app's network calls from Chrome on your PC: open
`chrome://inspect`, pick the DocuPilot WebView, and check the Console and
Network tabs. On iOS use Safari > Develop > [device].

## 5. Release

- Android: Android Studio, Build > Generate Signed Bundle (AAB), upload to Google Play.
- iOS: Xcode, set your Team and bundle ID, Product > Archive, upload to App Store Connect.
- Change `appId` in `capacitor.config.ts` (`com.docupilot.app`) to your own
  reverse-domain ID before the first store upload. It cannot change later.

## What changed for mobile

- `index.html`: `viewport-fit=cover`, theme colour, no phone-number auto-linking.
- `src/styles/mobile.css`: safe-area padding, `100dvh`, 16px inputs (stops iOS zoom), scroll strips.
- `src/app/native.ts`: status bar, splash hide, Android back button, keyboard scroll. No-op in browsers.
- Dashboard: drawer backdrop and smaller padding on phones; Users page shows
  cards instead of the wide table below 768px; dialogs scroll when taller
  than the screen.
- Opening the dev server from a phone browser (`http://<ip>:5173`) rewrites a
  `localhost` API URL to that same IP automatically (`src/app/config/env.ts`).
- Editor (width < 768px): bottom tool bar replaces the left rail, tool and AI panels
  open full screen, ribbon and header scroll sideways, page zoom starts fit-to-width.
