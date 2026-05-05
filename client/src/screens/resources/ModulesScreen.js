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
  SafeAreaView
} from "react-native";
import { hierarchyAPI } from "../../api/hierarchy";

export default function ModulesScreen({ route, navigation }) {
  const { faculty, department } = route.params;
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchModules = async () => {
    try {
      const res = await hierarchyAPI.getModules(department._id);
      setModules(res.data);
    } catch (error) {
      Alert.alert("Error", "Could not load modules");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [department._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchModules();
  };

  const filteredModules = modules.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: "#3b82f6", fontWeight: "600" }}>← Back to Departments</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a8a", marginBottom: 16 }}>
          Browse Resources
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 14, color: "#3b82f6" }}>{faculty.name}</Text>
          <Text style={{ fontSize: 14, color: "#cbd5e1", marginHorizontal: 6 }}>›</Text>
          <Text style={{ fontSize: 14, color: "#3b82f6" }}>{department.name}</Text>
          <Text style={{ fontSize: 14, color: "#cbd5e1", marginHorizontal: 6 }}>›</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#0f172a" }}>Module</Text>
        </View>

        <TextInput
          placeholder="🔍 Search modules by name or code..."
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

        <Text style={{ fontSize: 12, fontWeight: "bold", color: "#64748b", marginBottom: 12, textTransform: "uppercase" }}>
          MODULES IN {department.name.toUpperCase()}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={filteredModules}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}>
              No modules found.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate("ResourcesList", { faculty, department, module: item })}
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
              <View style={{
                backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 12
              }}>
                <Text style={{ fontWeight: "bold", color: "#475569", fontSize: 12 }}>{item.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 2 }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  Year {item.yearOfStudy} · Semester {item.semester}
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