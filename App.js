import React, { useState } from "react";
import * as Notifications from "expo-notifications";
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import OtpScreen from "./screens/OtpScreen";
import PhoneScreen from "./screens/PhoneScreen";
import SuccessScreen from "./screens/SuccessScreen";
import { clearOtp, sendOtp, verifyOtp } from "./services/otpService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [screen, setScreen] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpBanner, setOtpBanner] = useState("");

  async function handleSendOtp(number) {
    setLoading(true);
    try {
      const result = await sendOtp(number);
      setPhoneNumber(number);
      setOtpBanner(
        result.notificationShown ? "" : result.notificationMessage,
      );
      setScreen("otp");
    } catch (error) {
      console.log(`[OTP] Request failed: ${error?.code || error?.message}`);
      Alert.alert(
        "Could not save OTP",
        "Check your Firebase configuration and Firestore connection, then try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    const result = await sendOtp(phoneNumber);
    setOtpBanner(result.notificationShown ? "" : result.notificationMessage);
  }

  async function handleVerifyOtp(code) {
    setLoading(true);
    try {
      await verifyOtp(phoneNumber, code);
      setScreen("success");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await clearOtp(phoneNumber);
      setOtpBanner("");
      setPhoneNumber("");
      setScreen("phone");
    } catch (error) {
      console.log(`[OTP] Cleanup failed: ${error?.code || error?.message}`);
      Alert.alert("Could not clear the OTP request", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToPhone() {
    setOtpBanner("");
    setPhoneNumber("");
    setScreen("phone");
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      {screen === "phone" ? (
        <PhoneScreen onSendOtp={handleSendOtp} loading={loading} />
      ) : null}
      {screen === "otp" ? (
        <OtpScreen
          loading={loading}
          onBack={handleBackToPhone}
          onResend={handleResendOtp}
          onVerify={handleVerifyOtp}
          phoneNumber={phoneNumber}
        />
      ) : null}
      {screen === "success" ? (
        <SuccessScreen
          loading={loading}
          onStartOver={handleSignOut}
          phoneNumber={phoneNumber}
        />
      ) : null}
      {otpBanner && screen === "otp" ? (
        <View accessibilityRole="alert" style={styles.banner}>
          <Text style={styles.bannerText}>{otpBanner}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss OTP message"
            onPress={() => setOtpBanner("")}
            style={styles.bannerDismiss}
          >
            <Text style={styles.bannerDismissText}>×</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  banner: {
    position: "absolute",
    top: 52,
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#E9F2FF",
    borderColor: "#B5D1FA",
    borderWidth: 1,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
  },
  bannerText: {
    flex: 1,
    color: "#174A8B",
    fontSize: 14,
    fontWeight: "600",
  },
  bannerDismiss: { paddingHorizontal: 8, paddingVertical: 2 },
  bannerDismissText: { color: "#174A8B", fontSize: 23, lineHeight: 25 },
});
