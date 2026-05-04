import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { adminAPI } from "../../api/admin";
import { resourcesAPI } from "../../api/resources";

export default function AdminDashboardScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        adminAPI.getAllUsers(),
        resourcesAPI.getPendingResources(),
      ]);
      setUsers(usersRes.data ?? []);
      setPendingCount((pendingRes.data ?? []).length);
    } catch {
      // silently fail — stats will just show 0
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const total = users.length;
  const active = users.filter((u) => u.isActive).length;
  const students = users.filter((u) => u.role?.includes("STUDENT")).length;
  const staff = users.filter((u) => u.role?.includes("STAFF")).length;
  const reps = users.filter((u) => u.role?.includes("REP")).length;
  const admins = users.filter((u) => u.role?.includes("ADMIN")).length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1a3c6e"
          />
        }
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          Admin Dashboard
        </Text>
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
          Platform overview
        </Text>

        {/* User stats */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#64748b",
            marginBottom: 10,
          }}
        >
          USER STATS
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total Users" value={total} color="#1a3c6e" />
          <StatCard label="Active" value={active} color="#22c55e" />
          <StatCard label="Students" value={students} color="#8b5cf6" />
          <StatCard label="Staff" value={staff} color="#f59e0b" />
          <StatCard label="REPs" value={reps} color="#ec4899" />
          <StatCard label="Admins" value={admins} color="#ef4444" />
        </View>

        {/* Quick Actions */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#64748b",
            marginBottom: 10,
          }}
        >
          QUICK ACTIONS
        </Text>
        <View style={{ gap: 10 }}>
          <ActionCard
            icon="👥"
            title="Manage Users"
            subtitle={`${total} registered users`}
            onPress={() => navigation.navigate("UserManagement")}
          />
          <ActionCard
            icon="📚"
            title="Pending Resources"
            subtitle={
              pendingCount > 0
                ? `${pendingCount} resource${pendingCount > 1 ? "s" : ""} awaiting approval`
                : "No pending approvals"
            }
            badge={pendingCount > 0 ? pendingCount : null}
            onPress={() =>
              navigation.navigate("Resources", { screen: "PendingResources" })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
        minWidth: 90,
        flex: 1,
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "800", color }}>{value}</Text>
      <Text
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, badge, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Text style={{ fontSize: 24, marginRight: 14 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      {badge ? (
        <View
          style={{
            backgroundColor: "#ef4444",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 3,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 18, color: "#94a3b8" }}>›</Text>
    </TouchableOpacity>
  );
}
