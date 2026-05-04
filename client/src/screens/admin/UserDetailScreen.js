import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { adminAPI } from "../../api/admin";

const ROLES = ["STUDENT", "STAFF", "REP", "ADMIN"];
const ROLE_COLOR = {
  STUDENT: "#8b5cf6", STAFF: "#f59e0b",
  REP: "#ec4899",     ADMIN: "#ef4444",
};

export default function UserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    adminAPI.getAllUsers()
      .then(({ data }) => {
        const found = (data ?? []).find((u) => u._id === userId);
        setUser(found ?? null);
      })
      .catch(() => { Alert.alert("Error", "Could not load user."); navigation.goBack(); })
      .finally(() => setLoading(false));
  }, [userId]);

  const run = async (action, confirmMsg, onDone) => {
    Alert.alert("Confirm", confirmMsg, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes", style: "destructive", onPress: async () => {
          setActioning(true);
          try {
            await action();
            if (onDone) onDone();
          } catch (e) {
            Alert.alert("Error", e.response?.data?.message || "Action failed.");
          } finally {
            setActioning(false);
          }
        },
      },
    ]);
  };

  const handleDeactivate = () =>
    run(
      () => adminAPI.deactivateUser(userId),
      "Deactivate this user?",
      () => setUser((u) => ({ ...u, isActive: false })),
    );

  const handleReactivate = () =>
    run(
      () => adminAPI.reactivateUser(userId),
      "Reactivate this user?",
      () => setUser((u) => ({ ...u, isActive: true })),
    );

  const handleDelete = () =>
    run(
      () => adminAPI.deleteUser(userId),
      "Permanently delete this user? This cannot be undone.",
      () => navigation.goBack(),
    );

  const handleRoleChange = (role) => {
    Alert.alert("Change Role", `Set role to ${role}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Change", onPress: async () => {
          setActioning(true);
          try {
            await adminAPI.updateUserRole(userId, role);
            setUser((u) => ({ ...u, role: [role] }));
          } catch (e) {
            Alert.alert("Error", e.response?.data?.message || "Role update failed.");
          } finally {
            setActioning(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#64748b" }}>User not found.</Text>
      </SafeAreaView>
    );
  }

  const currentRole = user.role?.[0] ?? "STUDENT";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>User Detail</Text>
          {actioning && <ActivityIndicator size="small" color="#0ea5e9" style={{ marginLeft: 12 }} />}
        </View>

        {/* Profile card */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 16, padding: 20,
          alignItems: "center", marginBottom: 20,
          borderWidth: 0.5, borderColor: "#e2e8f0",
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: "#e0f2fe",
            justifyContent: "center", alignItems: "center", marginBottom: 12,
          }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#0ea5e9" }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{user.email}</Text>

          {/* Role badge */}
          <View style={{
            marginTop: 10, backgroundColor: ROLE_COLOR[currentRole] ?? "#64748b",
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4,
          }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{currentRole}</Text>
          </View>

          {/* Active status */}
          <View style={{
            flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6,
          }}>
            <View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: user.isActive ? "#22c55e" : "#ef4444",
            }} />
            <Text style={{ fontSize: 12, color: user.isActive ? "#22c55e" : "#ef4444", fontWeight: "600" }}>
              {user.isActive ? "Active" : "Deactivated"}
            </Text>
          </View>

          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Role Assignment */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b", marginBottom: 10 }}>
          ASSIGN ROLE
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => currentRole !== r && handleRoleChange(r)}
              style={{
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                backgroundColor: currentRole === r ? (ROLE_COLOR[r] ?? "#64748b") : "#fff",
                borderWidth: 1, borderColor: currentRole === r ? (ROLE_COLOR[r] ?? "#64748b") : "#e2e8f0",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "700",
                color: currentRole === r ? "#fff" : "#64748b",
              }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b", marginBottom: 10 }}>
          ACCOUNT ACTIONS
        </Text>
        <View style={{ gap: 10 }}>
          {user.isActive ? (
            <ActionButton
              label="Deactivate User"
              color="#f59e0b"
              onPress={handleDeactivate}
            />
          ) : (
            <ActionButton
              label="Reactivate User"
              color="#22c55e"
              onPress={handleReactivate}
            />
          )}
          <ActionButton
            label="Delete User"
            color="#ef4444"
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 12, paddingVertical: 13, alignItems: "center",
        borderWidth: 1.5, borderColor: color,
      }}
    >
      <Text style={{ color, fontWeight: "700", fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}
