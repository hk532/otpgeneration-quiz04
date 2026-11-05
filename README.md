# Pakistani Phone OTP Verification

An Expo React Native app that verifies Pakistani mobile numbers with Firebase Phone Authentication. Firebase native modules require a local native development build; this app does not run in Expo Go and does not use EAS cloud builds.

## Firebase setup

1. Create a Firebase project on the free Spark plan at [Firebase Console](https://console.firebase.google.com/).
2. Add an Android app with package name `com.yourname.otpquiz`.
3. Download its `google-services.json` and place it in this project root. The file is intentionally ignored by Git.
4. In Firebase Console, open **Authentication > Sign-in method > Phone** and enable Phone authentication.
5. Add your development certificate fingerprints under **Project settings > Your apps > Android app > SHA certificate fingerprints**. See the [Firebase Android setup instructions](https://firebase.google.com/docs/android/setup#prerequisites) for obtaining SHA-1 and SHA-256:
   - For the local debug build, run `cd android` then `.\gradlew signingReport` after prebuild, and copy the debug SHA-1 and SHA-256 fingerprints into Firebase.
   - For a release key, use `keytool -list -v -keystore <keystore-path> -alias <key-alias>` and register those fingerprints too.
   - After adding fingerprints, download the updated `google-services.json` and replace the root copy.
6. To test without real SMS charges or delivery, open **Authentication > Sign-in method > Phone > Phone numbers for testing**, add a Pakistani test number and a fixed 6-digit code. Use that number and code in the app. Firebase test numbers do not send SMS.

## Install and run on Android

Install Node.js and the Android development prerequisites (Android Studio/SDK and Java), then run:

```sh
npm install
npx expo prebuild
npx expo run:android
```

`google-services.json` must be in the project root before running prebuild. The native Firebase packages need a development build, so do not open the project in Expo Go. No EAS cloud build or paid service is required.

## Phone number input

The app only accepts Pakistani mobile numbers. It accepts `03001234567`, `3001234567`, `923001234567`, and `+923001234567`, strips spaces and dashes, and normalizes to `+923XXXXXXXXX`. The visible `+92` prefix is a fixed label; users can type the local number after it.

## Logs

OTP flow diagnostics are written with `[OTP]` prefixes. With `npx expo run:android`, watch the terminal output; you can also inspect native device output with `adb logcat`. OTP digits are not written to logs.
