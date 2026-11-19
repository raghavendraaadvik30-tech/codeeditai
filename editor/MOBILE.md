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

`localhost` on a phone means the phone itself. Create `editor/.env.mobile`:

```
VITE_API_URL=https://api.your-domain.com
```

The Go backend already sends `Access-Control-Allow-Origin: *`, which covers the
app origins (`https://localhost` on Android, `capacitor://localhost` on iOS).
Login uses a Bearer token in localStorage, so no cookie setup is needed.

Testing against a dev machine over Wi-Fi: use its LAN IP, e.g.
`http://192.168.1.20:8088`. Plain `http` needs two extra settings:
- Android: add `android:usesCleartextTraffic="true"` to `<application>` in
  `android/app/src/main/AndroidManifest.xml`.
- iOS: add an `NSAppTransportSecurity` exception in `ios/App/App/Info.plist`.
Remove both for release builds.

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

Re-run one of these after every web change (they rebuild and sync).

## 5. Release

- Android: Android Studio, Build > Generate Signed Bundle (AAB), upload to Google Play.
- iOS: Xcode, set your Team and bundle ID, Product > Archive, upload to App Store Connect.
- Change `appId` in `capacitor.config.ts` (`com.docupilot.app`) to your own
  reverse-domain ID before the first store upload. It cannot change later.

## What changed for mobile

- `index.html`: `viewport-fit=cover`, theme colour, no phone-number auto-linking.
- `src/styles/mobile.css`: safe-area padding, `100dvh`, 16px inputs (stops iOS zoom), scroll strips.
- `src/app/native.ts`: status bar, splash hide, Android back button, keyboard scroll. No-op in browsers.
- Dashboard: drawer backdrop and smaller padding on phones.
- Editor (width < 768px): bottom tool bar replaces the left rail, tool and AI panels
  open full screen, ribbon and header scroll sideways, page zoom starts fit-to-width.
