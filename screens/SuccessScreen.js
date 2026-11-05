import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SuccessScreen({ phoneNumber, onStartOver, loading }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
        <Text style={styles.title}>Phone verified</Text>
        <Text style={styles.subtitle}>
          Phone number verified successfully
        </Text>
        <Text style={styles.label}>VERIFIED NUMBER</Text>
        <Text style={styles.phone}>{phoneNumber}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={onStartOver}
          style={({ pressed }) => [
            styles.button,
            pressed && !loading && styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Start Over</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "center",
    padding: 30,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    shadowColor: "#102A43",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  checkmark: {
    height: 66,
    width: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 33,
    backgroundColor: "#E3FCEF",
    marginBottom: 21,
  },
  checkmarkText: { color: "#1F845A", fontSize: 34, fontWeight: "700" },
  title: { color: "#172B4D", fontSize: 26, fontWeight: "800" },
  subtitle: {
    color: "#66758A",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    color: "#8491A3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  phone: {
    color: "#344563",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  button: {
    height: 54,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#2868C7",
    marginTop: 30,
  },
  buttonPressed: { backgroundColor: "#1E56A6" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
