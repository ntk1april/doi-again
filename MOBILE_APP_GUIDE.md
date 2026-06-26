# 📱 Doi Again - Mobile App Guide

This application has been configured to run as a native Android app using **Capacitor**.

Because this is a full-stack Next.js app (with an active database and server-side API routes), the mobile app is configured using the **WebView approach**. This means the native mobile app acts as a shell that automatically loads your live production website (`https://doi-again.vercel.app`).

This architecture is incredibly powerful because **any updates you deploy to Vercel will instantly appear on all users' mobile apps** without requiring them to download an update from the Play Store!

---

## 🎨 Changing the App Icon and Splash Screen

To change the app icon and the splash screen that shows while the app loads, we use the official `@capacitor/assets` tool.

### 1. Prepare your images for set icon app

1. Create a folder named `assets` in the root of your project (if it doesn't already exist).
2. Save your new app icon as **`icon.png`** inside the `assets/` folder. It must be a square `.png` image, at least `1024x1024` pixels.
3. _(Optional)_ Save a custom splash screen as **`splash.png`** inside the `assets/` folder. It should be at least `2732x2732` pixels.

### 2. Run the Generator

Open your terminal and run the following command to automatically crunch your images into all the necessary Android sizes:

```bash
npx capacitor-assets generate
```

### 3. See the changes

The tool automatically injects the new icons directly into your `android` folder. To see them on your device/emulator, simply run the app again:

```bash
npx cap run android
```

---

## 📦 Generating APKs

### Generating a Debug APK (For testing locally)

If you just want an `.apk` file to send to a friend or manually install on your own physical Android phone, you don't need to do any complex signing.

Every time you successfully run the app in the emulator or compile it, a debug APK is automatically generated. You can find it right here in your project folders:
👉 **`android/app/build/outputs/apk/debug/app-debug.apk`**

_(Note: When installing this on a physical phone, you must allow "Install from Unknown Sources" in your Android settings)._

### Generating a Release APK (For the Google Play Store)

If you want to publish your app to the Google Play Store, you must generate a highly optimized and cryptographically signed "Release" APK (or App Bundle).

1. Open Android Studio from your project:
   ```bash
   npx cap open android
   ```
2. Wait for Android Studio to finish indexing and syncing Gradle (watch the loading bar at the bottom right).
3. In the top menu bar, click **Build** -> **Generate Signed Bundle / APK...**
4. Choose **APK** (or **Android App Bundle** if uploading to Play Store) and click **Next**.
5. Under "Key store path", click **Create new...**
   - Create a keystore file (Save this file somewhere safe! If you lose it, you can never push an update to your app on the Play Store).
   - Fill out the passwords and certificate information.
6. Click **Next**, select the **release** build variant, and click **Finish**.

Android Studio will compile your app and pop up a notification when your signed Release APK is ready!
