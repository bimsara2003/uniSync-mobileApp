import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { resourcesAPI } from "../../api/resources";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "LECTURE_NOTE", label: "Lectures" },
  { key: "PAST_PAPER", label: "Past Papers" },
  { key: "PROJECT", label: "Projects" },
  { key: "TEMPLATE", label: "Templates" },
  { key: "SUMMARY", label: "Summaries" },
  { key: "OTHER", label: "Other" },
];

const CATEGORY_ICON = {
  LECTURE_NOTE: "document-text-outline",
  PAST_PAPER: "newspaper-outline",
  PROJECT: "code-slash-outline",
  TEMPLATE: "clipboard-outline",
  SUMMARY: "reader-outline",
  OTHER: "folder-outline",
};

const STATUS_STYLE = {
  APPROVED: { bg: "#dcfce7", text: "#166534" },
  PENDING: { bg: "#fef3c7", text: "#92400e" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b" },
};

function ResourceCard({ item, onPress, onBookmark, userId }) {
  const isBookmarked = item.bookmarkedBy?.includes(userId);
  const statusStyle = STATUS_STYLE[item.status] || STATUS_STYLE.PENDING;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
      }}
    >
      {/* Top row */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <View style={{ marginRight: 12 }}>
          <Ionicons
            name={CATEGORY_ICON[item.category] || "folder-outline"}
            size={24}
            color="#1a3c6e"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: "#0f172a" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {item.module?.code || "—"} · {item.module?.name || ""}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onBookmark(item._id)}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? "#3b82f6" : "#94a3b8"}
          />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {item.description ? (
        <Text
          numberOfLines={2}
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 19,
            marginBottom: 10,
          }}
        >
          {item.description.replace(/<[^>]*>?/gm, "")}
        </Text>
      ) : null}

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              backgroundColor: statusStyle.bg,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: statusStyle.text,
              }}
            >
              {item.status}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            {item.resourceType === "OFFICIAL" ? "Official" : "Student"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="download-outline" size={14} color="#94a3b8" />
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            {item.downloadCount || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ResourcesScreen({ route, navigation }) {
  const { faculty, department, module } = route.params || {};
  const { user, isStaffOrAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);

  const fetchResources = async () => {
    try {
      let res;
      if (showBookmarks) {
        res = await resourcesAPI.getBookmarks();
      } else {
        const filters = {};
        if (activeCategory !== "ALL") filters.category = activeCategory;
        if (module) filters.module = module._id;
        else if (department) filters.department = department._id;
        else if (faculty) filters.faculty = faculty._id;
        res = await resourcesAPI.getResources(filters);
      }
      setResources(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load resources");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchResources();
    }, [activeCategory, showBookmarks]),
  );

  const handleBookmark = async (id) => {
    try {
      await resourcesAPI.toggleBookmark(id);
      fetchResources();
    } catch {
      Alert.alert("Error", "Could not update bookmark");
    }
  };

  const filtered = resources.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f9ff",
        }}
      >
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "#e2e8f0",
        }}
      >
        {faculty && department && module && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("FacultiesList")}
            >
              <Text style={{ fontSize: 13, color: "#0f172a" }}>
                {faculty.name}
              </Text>
            </TouchableOpacity>
            <Ionicons
              name="chevron-forward"
              size={13}
              color="#0f172a"
              style={{ marginHorizontal: 6 }}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DepartmentsList", { faculty })
              }
            >
              <Text style={{ fontSize: 13, color: "#0f172a" }}>
                {department.name}
              </Text>
            </TouchableOpacity>
            <Ionicons
              name="chevron-forward"
              size={13}
              color="#0f172a"
              style={{ marginHorizontal: 6 }}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ModulesList", { faculty, department })
              }
            >
              <Text style={{ fontSize: 13, color: "#0f172a" }}>
                {module.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>
            {module ? `${module.code} Resources` : "Resources"}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowBookmarks(!showBookmarks)}
              style={{
                backgroundColor: showBookmarks ? "#1a3c6e" : "#f1f5f9",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 0.5,
                borderColor: showBookmarks ? "#1a3c6e" : "#e2e8f0",
              }}
            >
              <Ionicons
                name={showBookmarks ? "bookmark" : "bookmark-outline"}
                size={14}
                color={showBookmarks ? "#fff" : "#64748b"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: showBookmarks ? "#fff" : "#64748b",
                }}
              >
                Saved
              </Text>
            </TouchableOpacity>
            {isStaffOrAdmin && (
              <TouchableOpacity
                onPress={() => navigation.navigate("PendingResources")}
                style={{
                  backgroundColor: "#fef3c7",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#92400e" }}
                >
                  Pending
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f1f5f9",
            borderRadius: 10,
            paddingHorizontal: 14,
            marginBottom: 12,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search resources..."
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingLeft: 8,
              fontSize: 14,
              color: "#0f172a",
            }}
          />
        </View>

        {/* Category pills */}
        {!showBookmarks && (
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    activeCategory === item.key ? "#1a3c6e" : "#f1f5f9",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: activeCategory === item.key ? "#fff" : "#64748b",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Resource list */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchResources();
            }}
            tintColor="#1a3c6e"
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons
              name="folder-open-outline"
              size={48}
              color="#cbd5e1"
              style={{ marginBottom: 12 }}
            />
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              {showBookmarks ? "No saved resources" : "No resources found"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ResourceCard
            item={item}
            userId={user?._id}
            onBookmark={handleBookmark}
            onPress={() =>
              navigation.navigate("ResourceDetail", { id: item._id })
            }
          />
        )}
      />

      {/* Floating Action Button for Create Resource */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateResource")}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: "#1a3c6e",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#1a3c6e",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
