# Pakistani OTP Demo (Expo Go)

This Expo app demonstrates a Pakistani-only, six-digit OTP flow using Firebase Firestore. The OTP is generated locally by the app and delivered in a local phone notification; **no SMS is sent**.

> **Demo only:** This does not verify ownership of a phone number and is not suitable for authentication or production use. The OTP is created on the client and printed to the development terminal. Firestore test mode permits broad database access; never use these settings or this flow for sensitive data.

## Firebase setup

1. Create a Firebase project on the free Spark plan at [Firebase Console](https://console.firebase.google.com/).
2. Create a Cloud Firestore database and choose **Start in test mode** for this demo.
3. Add a **web app** in the project settings. Copy the Firebase web config values.
4. Copy `.env.example` to `.env` and fill in the values from the web app config:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

`.env` is ignored by Git. Expo's `EXPO_PUBLIC_` values are included in the client app bundle; do not put private credentials in them.

## Run in Expo Go

Install Node.js, then run:

```sh
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. No native prebuild, Android/iOS project, EAS build, paid service, or remote push notification is required. Allow notifications when prompted so the app can show a local notification; if permission is denied or notifications are unavailable, the OTP appears in an in-app banner instead.

## OTP flow

- The app accepts Pakistani mobile number formats `03001234567`, `3001234567`, `923001234567`, and `+923001234567`. It strips spaces and dashes and normalizes to `+923XXXXXXXXX`.
- A fresh random six-digit OTP is generated using Expo Crypto for each request. A SHA-256 hash salted with the normalized phone number, a 60-second expiration, and an attempt count are saved to the `otpRequests` Firestore collection. A successful verification deletes the document; three incorrect attempts require a new OTP.
- The SMS is **simulated with a local notification** titled “SMS: Verification Code”; it is not delivered over SMS or remote push.
- Find the OTP in the Metro/Expo terminal (`[OTP] Phone: ... | OTP: ...`) or in the phone notification. Avoid recording real personal numbers when sharing a screen recording.

## Firestore warning

Test mode is for temporary development only and may allow anyone with the project configuration to read or change database contents. Configure restrictive Firestore Security Rules before exposing any real data, and do not treat this client-generated OTP flow as phone authentication.
