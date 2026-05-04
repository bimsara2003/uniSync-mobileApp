import { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Alert, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["ALL", "GENERAL", "EXAM", "EVENT", "URGENT"];

const CATEGORY_STYLE = {
  GENERAL: { bg: "#f1f5f9", text: "#475569" },
  EXAM:    { bg: "#fef3c7", text: "#92400e" },
  EVENT:   { bg: "#dbeafe", text: "#1e40af" },
  URGENT:  { bg: "#fee2e2", text: "#991b1b" },
};

function CountdownBadge({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(eventDate) - new Date();
      if (diff <= 0) { setTimeLeft("Now"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  return (
    <View style={{
      backgroundColor: "#fef3c7", borderRadius: 6,
      paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: "flex-start",
    }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: "#92400e" }}>
        ⏱ {timeLeft}
      </Text>
    </View>
  );
}

function AnnouncementCard({ item, onPress, isStaff, onPin }) {
  const cat = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.GENERAL;
  const initials = `${item.postedBy?.firstName?.[0] || ""}${item.postedBy?.lastName?.[0] || ""}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: item.isPinned ? "#bae6fd" : "#e2e8f0",
        borderLeftWidth: item.isPinned ? 3 : 0.5,
        borderLeftColor: item.isPinned ? "#0ea5e9" : "#e2e8f0",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View style={{
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center", marginRight: 10,
        }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#0284c7" }}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}>
            {item.postedBy?.firstName} {item.postedBy?.lastName}
          </Text>
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            {new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {item.isPinned && (
            <Text style={{ fontSize: 14 }}>📌</Text>
          )}
          <View style={{
            backgroundColor: cat.bg, borderRadius: 6,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: cat.text }}>
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Cover Image */}
      {item.coverImageUrl && (
        <Image
          source={{ uri: item.coverImageUrl }}
          style={{ width: "100%", height: 160, borderRadius: 10, marginBottom: 12, backgroundColor: '#f1f5f9' }}
          resizeMode="cover"
        />
      )}

      {/* Title */}
      <Text style={{ fontSize: 15, fontWeight: "600", color: "#0f172a", marginBottom: 6 }}>
        {item.title}
      </Text>

      {/* Body preview */}
      <Text
        numberOfLines={2}
        style={{ fontSize: 13, color: "#64748b", lineHeight: 20 }}
      >
        {item.body}
      </Text>

      {/* Countdown if event */}
      {item.eventDate && <CountdownBadge eventDate={item.eventDate} />}

      {/* Footer */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <Text style={{ fontSize: 12, color: "#0ea5e9", fontWeight: "500" }}>
          Read more →
        </Text>
        {item.attachments?.length > 0 && (
          <Text style={{ fontSize: 11, color: "#94a3b8", marginLeft: 12 }}>
            📎 {item.attachments.length} attachment{item.attachments.length > 1 ? "s" : ""}
          </Text>
        )}
        {isStaff && (
          <TouchableOpacity onPress={() => onPin(item)} style={{ marginLeft: "auto" }}>
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>
              {item.isPinned ? "Unpin" : "Pin"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AnnouncementsScreen({ navigation }) {
  const { isStaffOrAdmin, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [activeTab,     setActiveTab]     = useState("ALL");
  const [search,        setSearch]        = useState("");

  const fetchAnnouncements = async () => {
    try {
      const params = {};
      if (activeTab !== "ALL") params.category = activeTab;
      const res = await api.get("/announcements", { params });
      setAnnouncements(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load announcements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAnnouncements(); }, [activeTab]));

  const handlePin = async (item) => {
    try {
      await api.patch(`/announcements/${item._id}/pin`);
      fetchAnnouncements();
    } catch {
      Alert.alert("Error", "Could not update pin");
    }
  };

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinned   = filtered.filter((a) => a.isPinned);
  const unpinned = filtered.filter((a) => !a.isPinned);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>

      {/* Top bar */}
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>
            Announcements
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {isStaffOrAdmin && (
              <TouchableOpacity
                onPress={() => navigation.navigate("CreateAnnouncement")}
                style={{
                  backgroundColor: "#0ea5e9", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>+ New</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: "#f1f5f9", borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 8,
                borderWidth: 0.5, borderColor: "#e2e8f0",
              }}
            >
              <Text style={{ color: "#64748b", fontWeight: "600", fontSize: 13 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search announcements..."
          style={{
            backgroundColor: "#f1f5f9", borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 10,
            fontSize: 14, color: "#0f172a", marginBottom: 12,
          }}
        />

        {/* Category tabs */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item)}
              style={{
                paddingHorizontal: 14, paddingVertical: 6,
                borderRadius: 20, marginRight: 8,
                backgroundColor: activeTab === item ? "#0ea5e9" : "#f1f5f9",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "500",
                color: activeTab === item ? "#fff" : "#64748b",
              }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={[...pinned, ...unpinned]}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAnnouncements(); }}
            tintColor="#0ea5e9"
          />
        }
        ListHeaderComponent={
          pinned.length > 0 ? (
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8", marginBottom: 8 }}>
              📌 PINNED
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>No announcements yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AnnouncementCard
            item={item}
            isStaff={isStaffOrAdmin}
            onPin={handlePin}
            onPress={() => navigation.navigate("AnnouncementDetail", { id: item._id })}
          />
        )}
      />
    </View>
  );
}
