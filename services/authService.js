import auth from "@react-native-firebase/auth";

const FRIENDLY_AUTH_ERRORS = {
  "auth/invalid-verification-code": "That code is incorrect. Check it and try again.",
  "auth/code-expired": "That code has expired. Request a new OTP.",
  "auth/too-many-requests": "Too many attempts. Please wait a while before trying again.",
  "auth/invalid-phone-number":
    "Enter a valid Pakistani mobile number (e.g. 0300 1234567)",
};

export function getFriendlyAuthError(error) {
  return (
    FRIENDLY_AUTH_ERRORS[error?.code] ||
    "Something went wrong. Please try again."
  );
}

export async function sendOtp(phoneNumber) {
  console.log(`[OTP] Requested for phone: ${phoneNumber}`);
  try {
    return await auth().signInWithPhoneNumber(phoneNumber);
  } catch (error) {
    console.log(`[OTP] Request failed: ${error?.code || "unknown error"}`);
    throw error;
  }
}

export async function verifyOtp(confirmation, code) {
  console.log("[OTP] Verification started");

  try {
    const result = await confirmation.confirm(code);
    console.log(`[OTP] Verification succeeded for phone: ${result.user.phoneNumber}`);
    return result;
  } catch (error) {
    console.log(`[OTP] Verification failed: ${error?.code || "unknown error"}`);
    throw error;
  }
}

export async function signOut() {
  return auth().signOut();
}
