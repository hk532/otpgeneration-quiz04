# Pakistani OTP Demo (Expo Go)

This app demonstrates a Pakistani-only, six-digit OTP flow. There is **no Firebase, database, backend, or SMS delivery**. A new random code is generated on the device and kept only in the app's memory. The SMS is simulated with a local phone notification; if notifications are unavailable or permission is denied, the app shows the code in an in-app banner.

> **Demo only:** This does not verify ownership of a phone number and is not suitable for authentication or production use. The code is printed in the development terminal and is stored only in client memory.

## Run in Expo Go

Install Node.js, then run:

```sh
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. No native build, database, backend, paid service, or remote push notification is required. Allow local notifications when prompted to see the simulated SMS notification.

## OTP flow

- The app accepts Pakistani mobile number formats `03001234567`, `3001234567`, `923001234567`, and `+923001234567`. It strips spaces and dashes and normalizes to `+923XXXXXXXXX`.
- A fresh random six-digit OTP is generated for each request and kept in memory with a 60-second expiration and a maximum of three attempts. A successful verification clears it.
- The SMS is **simulated with a local notification** titled “SMS: Verification Code”; it is not delivered over SMS or remote push.
- Find the OTP in the Metro/Expo terminal (`[OTP] Phone: ... | OTP: ...`) or in the phone notification/in-app banner.
