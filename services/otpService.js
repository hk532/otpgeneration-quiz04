import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import {
  deleteDoc,
  doc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

const OTP_LIFETIME_MS = 60_000;
const MAX_ATTEMPTS = 3;
const OTP_COLLECTION = "otpRequests";
const RANDOM_VALUE_LIMIT = 4_294_000_000;

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

async function hashOtp(phoneNumber, otp) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${phoneNumber}:${otp}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
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
  let otp;
  let expiresAt;
  let otpHash;
  try {
    otp = await generateOtp();
    expiresAt = Date.now() + OTP_LIFETIME_MS;
    otpHash = await hashOtp(phoneNumber, otp);
  } catch (error) {
    console.log(`[OTP] Generation failed: ${error?.message || "unknown error"}`);
    throw error;
  }
  const requestRef = doc(db, OTP_COLLECTION, phoneNumber);

  console.log(`[OTP] Phone: ${phoneNumber} | OTP: ${otp}`);

  try {
    await setDoc(requestRef, {
      otpHash,
      expiresAt: new Date(expiresAt),
      attempts: 0,
    });
  } catch (error) {
    console.log(`[OTP] Firestore save failed: ${error?.code || error?.message}`);
    throw error;
  }

  console.log(`[OTP] Firestore request saved for ${phoneNumber}`);
  const notification = await notifyOtp(otp);

  return {
    expiresAt,
    notificationMessage: notification.message,
    notificationShown: notification.shown,
  };
}

function getExpiryTime(value) {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (value && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return Number.NaN;
}

export async function verifyOtp(phoneNumber, enteredOtp) {
  console.log(`[OTP] Verification started for ${phoneNumber}`);
  const requestRef = doc(db, OTP_COLLECTION, phoneNumber);
  let result;
  try {
    const enteredHash = await hashOtp(phoneNumber, enteredOtp);
    result = await runTransaction(db, async (transaction) => {
      const request = await transaction.get(requestRef);

      if (!request.exists()) {
        return "missing";
      }

      const data = request.data();
      const expiresAt = getExpiryTime(data.expiresAt);
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        transaction.delete(requestRef);
        return "expired";
      }

      const attempts =
        Number.isSafeInteger(data.attempts) && data.attempts >= 0
          ? data.attempts
          : MAX_ATTEMPTS;
      if (attempts >= MAX_ATTEMPTS) {
        return "max-attempts";
      }

      if (data.otpHash === enteredHash) {
        transaction.delete(requestRef);
        return "verified";
      }

      const nextAttempts = attempts + 1;
      transaction.update(requestRef, { attempts: nextAttempts });
      return nextAttempts >= MAX_ATTEMPTS ? "max-attempts" : "invalid";
    });
  } catch (error) {
    console.log(
      `[OTP] Verification error: ${error?.code || error?.message || "unknown error"}`,
    );
    throw error;
  }

  if (result === "verified") {
    console.log(`[OTP] Verification succeeded for ${phoneNumber}`);
    return;
  }

  console.log(`[OTP] Verification failed for ${phoneNumber}: ${result}`);
  const error = new Error(result);
  error.code = result;
  throw error;
}

export async function clearOtp(phoneNumber) {
  await deleteDoc(doc(db, OTP_COLLECTION, phoneNumber));
}

export function getOtpErrorMessage(error) {
  switch (error?.code) {
    case "expired":
    case "missing":
      return "OTP expired. Request a new code.";
    case "max-attempts":
      return "Too many incorrect attempts. Request a new OTP.";
    case "invalid":
      return "Invalid OTP. Check the code and try again.";
    default:
      return "Could not complete the request. Check your connection and try again.";
  }
}
