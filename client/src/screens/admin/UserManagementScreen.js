import { useState, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { adminAPI } from "../../api/admin";

const ROLE_FILTERS = ["ALL", "STUDENT", "STAFF", "REP", "ADMIN"];

const ROLE_COLOR = {
  STUDENT: "#8b5cf6", STAFF: "#f59e0b",
  REP: "#ec4899",     ADMIN: "#ef4444",
};

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const load = async () => {
    try {
      const { data } = await adminAPI.getAllUsers();
      setUsers(data ?? []);
    } catch {
      setUsers([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = users.filter((u) => {
    const matchRole =
      roleFilter === "ALL" || u.role?.includes(roleFilter);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>
          Users ({users.length})
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search by name or email…"
          placeholderTextColor="#94a3b8"
          style={{
            backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14,
            paddingVertical: 10, fontSize: 14, color: "#0f172a",
            borderWidth: 0.5, borderColor: "#e2e8f0",
          }}
        />
      </View>

      {/* Role filter chips */}
      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <FlatList
          data={ROLE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setRoleFilter(item)}
              style={{
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                marginRight: 8,
                backgroundColor: roleFilter === item ? "#0ea5e9" : "#fff",
                borderWidth: 1, borderColor: roleFilter === item ? "#0ea5e9" : "#e2e8f0",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: roleFilter === item ? "#fff" : "#64748b" }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* User list */}
      <FlatList
        data={filtered}
        keyExtractor={(u) => u._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#94a3b8", marginTop: 40 }}>
            No users found.
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("UserDetail", { userId: item._id })}
            style={{
              backgroundColor: "#fff", borderRadius: 14, padding: 14,
              flexDirection: "row", alignItems: "center",
              borderWidth: 0.5, borderColor: "#e2e8f0",
            }}
          >
            {/* Avatar */}
            <View style={{
              width: 44, height: 44, borderRadius: 22, marginRight: 12,
              backgroundColor: "#e0f2fe", justifyContent: "center", alignItems: "center",
            }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#0ea5e9" }}>
                {item.firstName?.[0]}{item.lastName?.[0]}
              </Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748b" }} numberOfLines={1}>
                {item.email}
              </Text>
              {/* Role badges */}
              <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                {(item.role ?? []).map((r) => (
                  <View key={r} style={{
                    backgroundColor: ROLE_COLOR[r] ?? "#64748b",
                    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Status dot */}
            <View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: item.isActive ? "#22c55e" : "#ef4444",
              marginLeft: 8,
            }} />
            <Text style={{ fontSize: 18, color: "#94a3b8", marginLeft: 8 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
