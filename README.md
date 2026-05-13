# MyFinance

A privacy-first personal finance + net worth tracker. **Track your money without linking your bank** — all data lives locally on the device by default; cloud sync is optional and additive.

Built with React Native + Expo, ships on iOS and Android.

## Tech stack

- **Framework:** React Native, Expo SDK 55, Expo Router, TypeScript (strict)
- **Local storage:** SQLite via `expo-sqlite`
- **Native deps:** `react-native-svg` (charts), `expo-linear-gradient` (gradients), `react-native-reanimated` (swipe pager), `react-native-gesture-handler`, `@expo/vector-icons` (Material Icons)
- **Path aliases:** `@/*` → `./src/*`, `@/assets/*` → `./assets/*`
- **Backend (future, optional):** Supabase Auth + Postgres + Edge Functions
- **Monetization (future):** RevenueCat IAP, AdMob

This project uses `expo-dev-client`, so it requires a **development build** (custom native app) rather than Expo Go. Expo Go cannot load custom native modules and will not work.

## Prerequisites for a fresh workstation

You need all of these installed before you can build the app. Versions are what's tested on this project.

| Tool | Required for | How to install |
|---|---|---|
| **Node.js 20.19+** | Everything | Use [nvm](https://github.com/nvm-sh/nvm), then `nvm install` (reads `.nvmrc`) |
| **Git** | Cloning the repo | Comes with Xcode Command Line Tools |
| **Xcode + Command Line Tools** | iOS builds | App Store → Xcode → open once → `sudo xcodebuild -license accept` |
| **CocoaPods** | iOS native deps | `brew install cocoapods` |
| **UTF-8 locale** | CocoaPods + Ruby 4 | Add to `~/.zshrc`: `export LANG=en_US.UTF-8` and `export LC_ALL=en_US.UTF-8` |
| **Android Studio** | Android builds, emulator | [developer.android.com/studio](https://developer.android.com/studio) → run setup wizard |
| **ANDROID_HOME env** | Android CLI tools | Add to `~/.zshrc`: see Android section below |

### macOS shell config snippet

Add to `~/.zshrc` (or `~/.bash_profile`) on a new Mac:

```sh
# UTF-8 locale (fixes CocoaPods crash on Ruby 4.0+)
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Android SDK (after Android Studio installs the SDK to its default location)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

Then `source ~/.zshrc` (or open a new terminal).

## First-time setup on this machine

```sh
git clone <repo-url>          # or copy the repo folder over
cd MyFinance
nvm install                   # installs Node version from .nvmrc (20.20.2)
npm install                   # restores node_modules
```

That gets you a buildable project. To actually run it:

### iOS (Mac required)

1. Open Xcode once, install any prompted components, and accept the license.
2. Plug in an iPhone **or** launch a simulator (Xcode → Open Developer Tool → Simulator).
3. Build + install the dev client (takes ~5 min the first time, generates `/ios`):
   ```sh
   npx expo run:ios            # simulator
   # or:
   npx expo run:ios --device   # connected iPhone (free Apple ID OK for personal-team signing, app expires after 7 days)
   ```
4. After the first build, daily loop is:
   ```sh
   npm start                   # starts Metro
   # then press `i` to launch the dev client
   ```

### Android (Mac, Windows, or Linux)

1. Open Android Studio → **Device Manager** → create a Pixel emulator with API 35 (or plug in an Android device with USB debugging enabled).
2. Start the emulator (or connect the device).
3. Build + install (takes ~5–8 min the first time, generates `/android`):
   ```sh
   npx expo run:android
   ```
4. After the first build:
   ```sh
   npm start                   # then press `a`
   ```

### When to rebuild the dev client

Only when you add or remove a **native dependency** (anything with native code — `react-native-svg`, `expo-linear-gradient`, RevenueCat, AdMob, etc.). JS-only changes hot-reload through Metro and never need a rebuild.

## Daily development loop

```sh
npm start         # Metro bundler — press i (iOS) or a (Android)
npm run typecheck # full TypeScript check
npm run lint      # Expo lint
```

In Metro's terminal:
- `r` — reload the app
- `j` — open the JS debugger
- `m` — toggle the dev menu inside the app

## Project structure

```
app/                           # Expo Router — every file = a route
  _layout.tsx                  # root layout, Stack navigator, theme
  index.tsx                    # entry — renders the TabbedShell

src/
  components/
    shell/TabbedShell.tsx      # header + horizontal swipe pager (Reanimated)
    sections/                  # one file per tab
      HomeSection.tsx          # dashboard
      AccountsSection.tsx      # manual account list
      LogSection.tsx           # transaction-entry keypad
      ChartsSection.tsx        # analytics (SVG line chart)
      GoalsSection.tsx         # savings goals (SVG progress rings)
      PlaceholderSection.tsx   # generic placeholder (Subscribe)
    ui/GlassCard.tsx           # reusable glass-surface card
  constants/theme.ts           # colors, spacing, radii, type scale
  data/dummy.ts                # dummy data for all sections (until SQLite lands)
  db/migrations/               # SQLite migrations (scaffolded, empty)
  db/repositories/             # SQLite reads/writes (scaffolded, empty)

assets/                        # icons, images, fonts
```

**Architecture rules** (kept consistent across the project):

- Business logic stays out of screen components.
- All SQLite reads/writes go through `src/db/repositories/` files.
- Screens consume data via hooks in `src/hooks/`, never direct DB calls.
- Sync logic (future Supabase) will live in `src/sync/` and stays separate from local CRUD.

## Migrating to a new Mac

The fastest path. Estimated time: 30–60 min depending on download speeds.

**Before you leave the old Mac:**

1. Push to a remote (recommended):
   ```sh
   git remote add origin <git-url>
   git push -u origin main
   ```
   If you don't have a remote yet, create a private repo on GitHub/GitLab/Bitbucket and push.

2. (Alternative if no remote) Copy the folder. **Exclude these to save tens of GB and avoid stale state:**
   ```sh
   rsync -av --exclude node_modules --exclude ios --exclude android \
              --exclude .expo --exclude build.log \
              ~/MyFinance/ /Volumes/ExternalDrive/MyFinance/
   ```

3. **Back up secrets out-of-band.** Any files matching these patterns are gitignored for security reasons and need separate transfer (1Password, encrypted drive, etc.):
   - `*.jks` (Android keystore)
   - `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`, `*.pem` (iOS signing)
   - `.env*.local` (API keys)

   Right now this project has **none** of those files — you only need to worry about this once you add signing/secrets.

**On the new Mac:**

1. Install prerequisites (see [Prerequisites](#prerequisites-for-a-fresh-workstation)).
2. Get the code:
   ```sh
   git clone <repo-url>
   cd MyFinance
   ```
3. Restore dependencies:
   ```sh
   nvm install
   npm install
   ```
4. Build the iOS dev client:
   ```sh
   npx expo run:ios
   ```
5. (Optional) Build the Android dev client:
   ```sh
   npx expo run:android
   ```

That's it. You're back to the daily dev loop.

## What's in `.gitignore` and why it matters

Everything that's regenerable, machine-specific, or secret. See the comments in [`.gitignore`](.gitignore) for the full list. Highlights:

- **`node_modules/`** — restored by `npm install`.
- **`/ios`, `/android`** — auto-generated by `npx expo run:*` from `app.json`. The "source of truth" for native config is `app.json`; the platform folders are output, not input. If you ever need to edit native code by hand (rare for an Expo project), that's when you'd commit them — but then you can no longer regenerate cleanly.
- **`.expo/`, `expo-env.d.ts`** — Expo's caches and generated type declarations. Always regenerated.
- **Signing keys & env files** — NEVER commit. Back up to 1Password / encrypted drive.
- **`build.log`, `*.log`** — local build/run output. Noise.

## Common gotchas

- **"No development build for this project is installed"** → you haven't run `npx expo run:ios` / `run:android` yet on this machine, or you reinstalled the OS. Build it once.
- **CocoaPods crash with `Encoding::CompatibilityError`** → your shell's `LANG` isn't UTF-8. Add the export lines from the shell config snippet above.
- **`adb devices` shows nothing** → emulator isn't running or USB debugging isn't enabled on your phone. Also check `ANDROID_HOME` is set.
- **Adding a native dependency (RevenueCat, AdMob, etc.) doesn't work** → rebuild the dev client: `npx expo run:ios` / `run:android`. JS reload alone can't pick up new native code.
