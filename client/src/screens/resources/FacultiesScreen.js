import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hierarchyAPI } from "../../api/hierarchy";

export default function FacultiesScreen({ navigation }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchFaculties = async () => {
    try {
      const res = await hierarchyAPI.getFaculties();
      setFaculties(res.data);
    } catch (error) {
      Alert.alert("Error", "Could not load faculties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFaculties();
  };

  const filteredFaculties = faculties.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1e3a8a",
            marginBottom: 16,
          }}
        >
          Browse Resources
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#0f172a" }}>
            Faculty
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#0f172a"
            style={{ marginHorizontal: 8 }}
          />
          <Text style={{ fontSize: 16, color: "#0f172a" }}>Department</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#0f172a"
            style={{ marginHorizontal: 8 }}
          />
          <Text style={{ fontSize: 16, color: "#0f172a" }}>Module</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            paddingHorizontal: 12,
            marginBottom: 20,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search faculties..."
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingLeft: 8,
              fontSize: 16,
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: "#64748b",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          AVAILABLE FACULTIES
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={filteredFaculties}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}
            >
              No faculties found.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DepartmentsList", { faculty: item })
              }
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#64748b" }}>
                  {item.description || "Select to view departments"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
