import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getFriendlyAuthError } from "../services/authService";

export default function OtpScreen({
  phoneNumber,
  confirmation,
  onVerify,
  onResend,
  onBack,
  loading,
}) {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((seconds) => seconds - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  async function handleVerify() {
    if (code.length !== 6 || loading) {
      return;
    }

    setErrorMessage("");
    try {
      await onVerify(confirmation, code);
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    }
  }

  async function handleResend() {
    if (secondsRemaining > 0 || loading) {
      return;
    }

    setErrorMessage("");
    setCode("");
    try {
      await onResend();
      setSecondsRemaining(60);
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboard}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
            <Text style={styles.backText}>‹  Change number</Text>
          </Pressable>
          <Text style={styles.eyebrow}>PHONE VERIFICATION</Text>
          <Text style={styles.title}>Enter your code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>

          <TextInput
            accessibilityLabel="Six digit verification code"
            autoComplete="sms-otp"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => {
              const nextCode = value.replace(/\D/g, "").slice(0, 6);
              setCode(nextCode);
              if (nextCode.length === 6) {
                console.log("[OTP] Code entered");
              }
              setErrorMessage("");
            }}
            placeholder="------"
            placeholderTextColor="#AAB4C1"
            style={styles.codeInput}
            textContentType="oneTimeCode"
            value={code}
          />

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={code.length !== 6 || loading}
            onPress={handleVerify}
            style={({ pressed }) => [
              styles.button,
              (code.length !== 6 || loading) && styles.buttonDisabled,
              pressed && code.length === 6 && !loading && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </Pressable>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn’t receive the code?</Text>
            <Pressable
              accessibilityRole="button"
              disabled={secondsRemaining > 0 || loading}
              onPress={handleResend}
            >
              <Text
                style={[
                  styles.resendAction,
                  (secondsRemaining > 0 || loading) && styles.resendDisabled,
                ]}
              >
                {secondsRemaining > 0
                  ? ` Resend in ${secondsRemaining}s`
                  : " Resend OTP"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F4F7FB",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 26,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    shadowColor: "#102A43",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  back: { alignSelf: "flex-start", marginBottom: 24 },
  backText: { color: "#2868C7", fontSize: 14, fontWeight: "700" },
  eyebrow: {
    color: "#3975D5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: { color: "#172B4D", fontSize: 28, fontWeight: "800" },
  subtitle: {
    color: "#66758A",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 9,
    marginBottom: 28,
  },
  phone: { color: "#344563", fontWeight: "700" },
  codeInput: {
    height: 62,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 12,
    backgroundColor: "#FBFCFE",
    color: "#172B4D",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 12,
    textAlign: "center",
  },
  error: {
    color: "#C9372C",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  button: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#2868C7",
    marginTop: 22,
  },
  buttonDisabled: { backgroundColor: "#AABBD4" },
  buttonPressed: { backgroundColor: "#1E56A6" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 23,
  },
  resendLabel: { color: "#758398", fontSize: 13 },
  resendAction: { color: "#2868C7", fontSize: 13, fontWeight: "700" },
  resendDisabled: { color: "#8A97A8" },
});
