import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = form;
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!email.endsWith("@my.campus.lk")) {
      Alert.alert("Error", "Email must end with @my.campus.lk");
      return;
    }
    setLoading(true);
    try {
      await register(firstName.trim(), lastName.trim(), email.trim(), password);
    } catch (err) {
      Alert.alert(
        "Registration Failed",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Image
            source={require("../../../assets/icon.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>UniSync</Text>
          <Text style={styles.tagline}>Create your account</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            value={form.firstName}
            onChangeText={set("firstName")}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            value={form.lastName}
            onChangeText={set("lastName")}
          />
          <TextInput
            style={styles.input}
            placeholder="Email (e.g. you@my.campus.lk)"
            placeholderTextColor="#9CA3AF"
            value={form.email}
            onChangeText={set("email")}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 chars)"
            placeholderTextColor="#9CA3AF"
            value={form.password}
            onChangeText={set("password")}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={form.confirmPassword}
            onChangeText={set("confirmPassword")}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switchText}>
              Already have an account?{" "}
              <Text style={styles.switchLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerImage: {
    width: 200,
    height: 150,
    alignSelf: "center",
    marginBottom: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A3C6E",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  btn: {
    backgroundColor: "#1A3C6E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  switchText: { textAlign: "center", color: "#6B7280", fontSize: 13 },
  switchLink: { color: "#1A3C6E", fontWeight: "600" },
});
