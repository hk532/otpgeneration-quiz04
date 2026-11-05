import React, { useState } from "react";
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
import { isValidPkNumber, normalizePkNumber } from "../utils/phone";

const INVALID_PHONE_MESSAGE =
  "Enter a valid Pakistani mobile number (e.g. 0300 1234567)";

export default function PhoneScreen({ onSendOtp, loading }) {
  const [phoneInput, setPhoneInput] = useState("");
  const valid = isValidPkNumber(phoneInput);
  const showError = phoneInput.length > 0 && !valid;

  async function handleSubmit() {
    if (!valid || loading) {
      return;
    }

    await onSendOtp(normalizePkNumber(phoneInput));
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboard}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SECURE SIGN IN</Text>
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            We’ll send you a one-time code to confirm your number.
          </Text>

          <Text style={styles.label}>Pakistani mobile number</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.prefix}>+92</Text>
            <View style={styles.divider} />
            <TextInput
              accessibilityLabel="Pakistani mobile number"
              autoComplete="tel"
              autoCorrect={false}
              keyboardType="phone-pad"
              onChangeText={(text) => {
                setPhoneInput(text);
              }}
              placeholder="300 1234567"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
              value={phoneInput}
            />
          </View>
          {showError && !valid ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {INVALID_PHONE_MESSAGE}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!valid || loading}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              (!valid || loading) && styles.buttonDisabled,
              pressed && valid && !loading && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>
          <Text style={styles.footnote}>SMS verification · Pakistan (+92)</Text>
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
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 28,
  },
  label: {
    color: "#344563",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },
  phoneInput: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FBFCFE",
  },
  prefix: { color: "#172B4D", fontSize: 16, fontWeight: "700" },
  divider: {
    height: 23,
    width: 1,
    backgroundColor: "#DCE3EC",
    marginHorizontal: 13,
  },
  input: { flex: 1, color: "#172B4D", fontSize: 16, paddingVertical: 0 },
  error: { color: "#C9372C", fontSize: 12, marginTop: 9, lineHeight: 18 },
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
  footnote: {
    color: "#8491A3",
    fontSize: 12,
    textAlign: "center",
    marginTop: 19,
  },
});
