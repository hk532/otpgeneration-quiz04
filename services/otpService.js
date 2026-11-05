import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const OTP_LIFETIME_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RANDOM_VALUE_LIMIT = 4_294_000_000;
let activeOtpRequest = null;
let activePhoneNumber = null;

export async function generateOtp() {
  while (true) {
    const bytes = await Crypto.getRandomBytesAsync(4);
    const randomValue = bytes.reduce(
      (value, byte) => value * 256 + byte,
      0,
    );

    if (randomValue < RANDOM_VALUE_LIMIT) {
      return String(randomValue % 1_000_000).padStart(6, "0");
    }
  }
}

async function notifyOtp(otp) {
  const message = `Your OTP is ${otp}. Valid for 60 seconds.`;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("otp-codes", {
        name: "Verification codes",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      permission = await Notifications.requestPermissionsAsync();
    }

    if (!permission.granted) {
      console.log("[OTP] Notification permission denied; using in-app banner");
      return { shown: false, message };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "SMS: Verification Code",
        body: message,
        sound: false,
      },
      trigger: null,
    });
    console.log("[OTP] Local verification notification displayed");
    return { shown: true, message };
  } catch (error) {
    console.log(
      `[OTP] Local notification unavailable; using in-app banner: ${error?.message || "unknown error"}`,
    );
    return { shown: false, message };
  }
}

export async function sendOtp(phoneNumber) {
  console.log(`[OTP] Generating a new code for ${phoneNumber}`);
  try {
    const otp = await generateOtp();
    const expiresAt = Date.now() + OTP_LIFETIME_MS;
    activeOtpRequest = { otp, expiresAt, attempts: 0 };
    activePhoneNumber = phoneNumber;

    console.log(`[OTP] Phone: ${phoneNumber} | OTP: ${otp}`);
    const notification = await notifyOtp(otp);

    return {
      expiresAt,
      notificationMessage: notification.message,
      notificationShown: notification.shown,
    };
  } catch (error) {
    console.log(`[OTP] Generation failed: ${error?.message || "unknown error"}`);
    throw error;
  }
}

export async function verifyOtp(phoneNumber, enteredOtp) {
  console.log(`[OTP] Verification started for ${phoneNumber}`);
  if (!activeOtpRequest || activePhoneNumber !== phoneNumber) {
    console.log(`[OTP] Verification failed for ${phoneNumber}: missing`);
    throw new Error("missing");
  }

  if (activeOtpRequest.expiresAt <= Date.now()) {
    activeOtpRequest = null;
    activePhoneNumber = null;
    console.log(`[OTP] Verification failed for ${phoneNumber}: expired`);
    throw new Error("expired");
  }

  if (activeOtpRequest.attempts >= MAX_ATTEMPTS) {
    console.log(`[OTP] Verification failed for ${phoneNumber}: max-attempts`);
    throw new Error("max-attempts");
  }

  if (activeOtpRequest.otp !== enteredOtp) {
    activeOtpRequest.attempts += 1;
    const result =
      activeOtpRequest.attempts >= MAX_ATTEMPTS ? "max-attempts" : "invalid";
    console.log(`[OTP] Verification failed for ${phoneNumber}: ${result}`);
    throw new Error(result);
  }

  activeOtpRequest = null;
  activePhoneNumber = null;
  console.log(`[OTP] Verification succeeded for ${phoneNumber}`);
}

export function clearOtp(phoneNumber) {
  if (activePhoneNumber === phoneNumber) {
    activeOtpRequest = null;
    activePhoneNumber = null;
    console.log(`[OTP] In-memory code cleared for ${phoneNumber}`);
  }
}

export function getOtpErrorMessage(error) {
  switch (error?.message) {
    case "expired":
    case "missing":
      return "OTP expired. Request a new code.";
    case "max-attempts":
      return "Too many incorrect attempts. Request a new OTP.";
    case "invalid":
      return "Invalid OTP. Check the code and try again.";
    default:
      return "Could not complete the request. Please try again.";
  }
}
