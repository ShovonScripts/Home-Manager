# Production & Deployment Guide: Home Manager

Congratulations on building **Home Manager**! Your app is fully optimized, offline-first, type-safe, and ready for deployment. This guide outlines how to build and distribute your app using **EAS (Expo Application Services)**.

## Prerequisites

1. Create a free account on [Expo.dev](https://expo.dev/).
2. Install the EAS CLI globally or run it via npx:
   ```bash
   npx eas-cli login
   ```

---

## 1. Configuring Build Profiles (`eas.json`)

Your project is already pre-configured with `eas.json`. The profiles are:
- **`development`**: For debugging with a development client.
- **`preview`**: For internal distribution (testing `.apk` on your phone).
- **`production`**: Generates optimized App Bundles (`.aab`) for the Google Play Store.

---

## 2. Building for Android (APK / Play Store)

To generate an Android build for testing on a physical phone (`preview` profile):
```bash
npx eas-cli build --platform android --profile preview
```

To generate an optimized Android App Bundle (`.aab`) for the Google Play Store (`production` profile):
```bash
npx eas-cli build --platform android --profile production
```

EAS will build your app in the cloud, handle all native Android compilation (including SQLite and local notifications), and provide a direct download link when complete.

---

## 3. Building for iOS (App Store / TestFlight)

*(Requires an Apple Developer Account)*

To build for iOS:
```bash
npx eas-cli build --platform ios --profile production
```
EAS will prompt you to log in with your Apple credentials and automatically configure signing certificates and provisioning profiles.

---

## Summary of Developer Credits
- **Developer**: Shovon
- **Facebook**: [shovon.5271](https://www.facebook.com/shovon.5271)
- **Support**: [Buy Me a Coffee](https://buymeacoffee.com/mr.nas)
