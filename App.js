import React, { useState } from "react";
import { Alert, StatusBar, StyleSheet, View } from "react-native";
import auth from "@react-native-firebase/auth";
import OtpScreen from "./screens/OtpScreen";
import PhoneScreen from "./screens/PhoneScreen";
import SuccessScreen from "./screens/SuccessScreen";
import {
  getFriendlyAuthError,
  sendOtp,
  signOut,
  verifyOtp,
} from "./services/authService";

export default function App() {
  const [screen, setScreen] = useState("phone");
  const [confirmation, setConfirmation] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(number) {
    setLoading(true);
    try {
      const result = await sendOtp(number);
      setPhoneNumber(number);
      setConfirmation(result);
      setScreen("otp");
    } catch (error) {
      Alert.alert("Could not send OTP", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    const result = await sendOtp(phoneNumber);
    setConfirmation(result);
  }

  async function handleVerifyOtp(currentConfirmation, code) {
    setLoading(true);
    try {
      await verifyOtp(currentConfirmation, code);
      setScreen("success");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      setConfirmation(null);
      setPhoneNumber("");
      setScreen("phone");
    } catch (error) {
      Alert.alert("Sign out failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToPhone() {
    setConfirmation(null);
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
          confirmation={confirmation}
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
          onSignOut={handleSignOut}
          phoneNumber={auth().currentUser?.phoneNumber || phoneNumber}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
});
