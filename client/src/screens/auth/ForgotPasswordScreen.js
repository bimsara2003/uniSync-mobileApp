import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { authAPI } from "../../api/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      Alert.alert("Success", "A reset code has been sent to your email");
      setStep(2);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(otp, newPassword);
      Alert.alert("Success", "Password reset successfully", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>

        {/* Logo */}
        <View style={{ marginBottom: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "700", color: "#0ea5e9" }}>
            UniSync
          </Text>
          <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Reset your password
          </Text>
        </View>

        {/* Card */}
        <View style={{
          backgroundColor: "#ffffff", borderRadius: 16, padding: 24,
          shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
        }}>
          {step === 1 ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 20 }}>
                Forgot Password
              </Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 20 }}>
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </Text>

              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@my.campus.lk"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  fontSize: 14, color: "#0f172a", marginBottom: 24, backgroundColor: "#f8fafc",
                }}
              />

              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={loading}
                style={{
                  backgroundColor: "#0ea5e9", borderRadius: 10,
                  paddingVertical: 14, alignItems: "center",
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Send Reset Code</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 20 }}>
                Enter Code
              </Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 20 }}>
                Enter the 6-digit code sent to {email}
              </Text>

              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Reset Code</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  fontSize: 18, color: "#0f172a", marginBottom: 16, backgroundColor: "#f8fafc",
                  textAlign: "center", letterSpacing: 8,
                }}
              />

              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>New Password</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min 8 characters"
                secureTextEntry
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  fontSize: 14, color: "#0f172a", marginBottom: 16, backgroundColor: "#f8fafc",
                }}
              />

              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  fontSize: 14, color: "#0f172a", marginBottom: 24, backgroundColor: "#f8fafc",
                }}
              />

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                style={{
                  backgroundColor: "#0ea5e9", borderRadius: 10,
                  paddingVertical: 14, alignItems: "center",
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Reset Password</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#64748b", fontSize: 13 }}>
            Back to{" "}
            <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
