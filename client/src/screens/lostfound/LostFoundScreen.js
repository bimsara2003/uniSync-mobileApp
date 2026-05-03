import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Alert, Image, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { lostFoundAPI } from "../../api/lostFound";
import { useAuth } from "../../context/AuthContext";

const TABS = ["ALL", "LOST", "FOUND"];

const CATEGORY_ICONS = {
  ELECTRONICS: "📱",
  DOCUMENTS:   "📄",
  CLOTHING:    "👕",
  KEYS:        "🔑",
  BOOKS:       "📚",
  OTHER:       "📦",
};

const TYPE_STYLE = {
  LOST:  { bg: "#fee2e2", text: "#991b1b", label: "LOST" },
  FOUND: { bg: "#d1fae5", text: "#065f46", label: "FOUND" },
};

function ItemCard({ item, onPress }) {
  const typeStyle = TYPE_STYLE[item.type];
  const icon = CATEGORY_ICONS[item.category] || "📦";
  const date = new Date(item.dateLostFound).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        {/* Photo or icon */}
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
        ) : (
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 28 }}>{icon}</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          {/* Type badge + status */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.badgeText, { color: typeStyle.text }]}>
                {typeStyle.label}
              </Text>
            </View>
            {item.status === "RESOLVED" && (
              <View style={[styles.badge, { backgroundColor: "#f1f5f9" }]}>
                <Text style={[styles.badgeText, { color: "#64748b" }]}>Resolved</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

          <Text style={styles.cardMeta}>
            {icon} {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
          </Text>

          <Text style={styles.cardMeta} numberOfLines={1}>
            📍 {item.location}
          </Text>

          <Text style={styles.cardMeta}>🗓 {date}</Text>

          <Text style={styles.cardPoster} numberOfLines={1}>
            by {item.postedBy?.firstName} {item.postedBy?.lastName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LostFoundScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch]       = useState("");

  const fetchItems = useCallback(async () => {
    try {
      const filters = { status: "ACTIVE" };
      if (activeTab !== "ALL") filters.type = activeTab;
      const { data } = await lostFoundAPI.getItems(filters);
      setItems(data);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to load items");
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchItems().finally(() => setLoading(false));
    }, [fetchItems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const filtered = items.filter((i) =>
    search
      ? i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found</Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateLostFound")}
        >
          <Text style={styles.fabText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, location..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate("LostFoundDetail", { id: item._id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  fab: {
    backgroundColor: "#0ea5e9", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrap: { padding: 12, paddingBottom: 6 },
  searchInput: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#0f172a",
  },
  tabs: {
    flexDirection: "row", paddingHorizontal: 12, paddingBottom: 8, gap: 8,
  },
  tab: {
    paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0",
  },
  tabActive: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  tabText: { fontSize: 13, fontWeight: "500", color: "#64748b" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: "#94a3b8", fontSize: 15 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 0.5, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#f1f5f9" },
  iconBox: {
    width: 80, height: 80, borderRadius: 10, backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 3 },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  cardMeta: { fontSize: 12, color: "#64748b" },
  cardPoster: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
});
