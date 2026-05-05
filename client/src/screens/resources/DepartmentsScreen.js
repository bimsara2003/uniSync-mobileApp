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
import { hierarchyAPI } from "../../api/hierarchy";

export default function DepartmentsScreen({ route, navigation }) {
  const { faculty } = route.params;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await hierarchyAPI.getDepartments(faculty._id);
      setDepartments(res.data);
    } catch (error) {
      Alert.alert("Error", "Could not load departments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [faculty._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 12 }}
        >
          <Text style={{ fontSize: 16, color: "#3b82f6", fontWeight: "600" }}>
            ← Back to Faculties
          </Text>
        </TouchableOpacity>

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
            flexWrap: "wrap",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("FacultiesList")}
          >
            <Text style={{ fontSize: 16, color: "#0f172a" }}>
              {faculty.name}
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: "#0f172a", marginHorizontal: 8 }}>
            ›
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#0f172a" }}>
            Department
          </Text>
          <Text style={{ fontSize: 16, color: "#0f172a", marginHorizontal: 8 }}>
            ›
          </Text>
          <Text style={{ fontSize: 16, color: "#0f172a" }}>Module</Text>
        </View>

        <TextInput
          placeholder="🔍 Search departments..."
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            padding: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: "#64748b",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          DEPARTMENTS IN {faculty.name.toUpperCase()}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={filteredDepartments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}
            >
              No departments found.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ModulesList", {
                  faculty,
                  department: item,
                })
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
                  {item.description || "Select to view modules"}
                </Text>
              </View>
              <Text style={{ color: "#94a3b8", fontSize: 24 }}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
