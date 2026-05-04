import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { resourcesAPI } from "../../api/resources";

export default function PendingResourcesScreen({ navigation }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await resourcesAPI.getPendingResources();
      setResources(data);
    } catch {
      Alert.alert("Error", "Could not load pending resources");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetch(); }, []));

  const handleApprove = async (id) => {
    try {
      await resourcesAPI.approveResource(id);
      fetch();
    } catch {
      Alert.alert("Error", "Could not approve resource");
    }
  };

  const handleReject = async (id) => {
    try {
      await resourcesAPI.rejectResource(id, "Rejected by reviewer");
      fetch();
    } catch {
      Alert.alert("Error", "Could not reject resource");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
        flexDirection: "row", alignItems: "center",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 22, color: "#0ea5e9" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
          Pending Review ({resources.length})
        </Text>
      </View>

      <FlatList
        data={resources}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor="#0ea5e9" />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>No pending resources</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{
            backgroundColor: "#fff", borderRadius: 14, padding: 16,
            marginBottom: 12, borderWidth: 0.5, borderColor: "#e2e8f0",
          }}>
            <TouchableOpacity onPress={() => navigation.navigate("ResourceDetail", { id: item._id })}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#0f172a", marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                {item.module?.code || "—"} · Uploaded by {item.uploadedBy?.firstName || "Unknown"}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleApprove(item._id)}
                style={{
                  flex: 1, backgroundColor: "#dcfce7", borderRadius: 10,
                  paddingVertical: 10, alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#166534", fontSize: 13 }}>✓ Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReject(item._id)}
                style={{
                  flex: 1, backgroundColor: "#fee2e2", borderRadius: 10,
                  paddingVertical: 10, alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#991b1b", fontSize: 13 }}>✗ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
