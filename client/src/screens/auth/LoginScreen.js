import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert(
        "Login failed",
        err.response?.data?.message || "Something went wrong"
      );
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

        {/* Logo area */}
        <View style={{ marginBottom: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "700", color: "#0ea5e9" }}>
            UniSync
          </Text>
          <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Faculty of Computing
          </Text>
        </View>

        {/* Card */}
        <View style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 24,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 20 }}>
            Sign in
          </Text>

          <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@my.campus.lk"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
              paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 14, color: "#0f172a", marginBottom: 16,
              backgroundColor: "#f8fafc",
            }}
          />

          <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={{
              borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
              paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 14, color: "#0f172a", marginBottom: 24,
              backgroundColor: "#f8fafc",
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: "#0ea5e9",
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Sign in</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: "#64748b", fontSize: 13 }}>
            No account?{" "}
            <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>Register</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}
