import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert,
    ActivityIndicator, ScrollView,
} from "react-native";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const Field = ({ label, k, placeholder, secure, keyboard, form, set }) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{label}</Text>
        <TextInput
            value={form[k]}
            onChangeText={set(k)}
            placeholder={placeholder}
            secureTextEntry={secure}
            keyboardType={keyboard || "default"}
            autoCapitalize={k === "email" ? "none" : "words"}
            style={{
                borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 14, color: "#0f172a", backgroundColor: "#f8fafc",
            }}
        />
    </View>
);

export default function RegisterScreen({ navigation }) {
    const { login } = useAuth();
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "", adminSecret: "",
    });
    const [loading, setLoading] = useState(false);

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    const handleRegister = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            // Try to register first
            await api.post("/auth/register", {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email.trim().toLowerCase(),
                password: form.password,
                adminSecret: form.adminSecret,
                role: form.adminSecret ? "ADMIN" : "STUDENT",
            });
            // Then login
            await login(form.email.trim().toLowerCase(), form.password);
        } catch (err) {
            Alert.alert("Registration failed", err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: "#f8fafc" }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}>
                <View style={{ marginBottom: 32, alignItems: "center" }}>
                    <Text style={{ fontSize: 32, fontWeight: "700", color: "#0ea5e9" }}>UniSync</Text>
                    <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Create your account</Text>
                </View>

                <View style={{
                    backgroundColor: "#fff", borderRadius: 16, padding: 24,
                    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
                }}>
                    <Text style={{ fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 20 }}>Register</Text>
                    <Field label="First name" k="firstName" placeholder="Kasun" form={form} set={set} />
                    <Field label="Last name" k="lastName" placeholder="Perera" form={form} set={set} />
                    <Field label="Email" k="email" placeholder="you@my.campus.lk" keyboard="email-address" form={form} set={set} />
                    <Field label="Password" k="password" placeholder="Min 8 characters" secure form={form} set={set} />
                    <Field label="Admin Secret (Optional)" k="adminSecret" placeholder="Enter secret for admin access" secure form={form} set={set} />

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        style={{ backgroundColor: "#0ea5e9", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 }}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Create account</Text>
                        }
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 20, alignItems: "center" }}>
                    <Text style={{ color: "#64748b", fontSize: 13 }}>
                        Already have an account?{" "}
                        <Text style={{ color: "#0ea5e9", fontWeight: "600" }}>Sign in</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
