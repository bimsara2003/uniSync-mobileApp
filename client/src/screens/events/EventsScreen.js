import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { eventsAPI } from "../../api/events";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "ALL",
  "ACADEMIC",
  "SPORTS",
  "SOCIETY",
  "CULTURAL",
  "CAREER",
];
const STATUSES = ["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const CAT_STYLE = {
  ACADEMIC: { bg: "#dbeafe", text: "#1a3c6e" },
  SPORTS: { bg: "#dcfce7", text: "#166534" },
  SOCIETY: { bg: "#f3e8ff", text: "#6b21a8" },
  CULTURAL: { bg: "#fef9c3", text: "#854d0e" },
  CAREER: { bg: "#ffedd5", text: "#9a3412" },
};

const STATUS_STYLE = {
  UPCOMING: { bg: "#dbeafe", text: "#1a3c6e" },
  ONGOING: { bg: "#dcfce7", text: "#166534" },
  COMPLETED: { bg: "#f1f5f9", text: "#475569" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
};

function EventCard({ item, onPress }) {
  const cat = CAT_STYLE[item.category] || { bg: "#f1f5f9", text: "#475569" };
  const status = STATUS_STYLE[item.status] || STATUS_STYLE.UPCOMING;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
      }}
    >
      {item.bannerImageUrl ? (
        <Image
          source={{ uri: item.bannerImageUrl }}
          style={{ width: "100%", height: 140 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 100,
            backgroundColor: "#dbeafe",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 36 }}>🎉</Text>
        </View>
      )}

      <View style={{ padding: 14 }}>
        {/* Category + Status badges */}
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <View
            style={{
              backgroundColor: cat.bg,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: cat.text }}>
              {item.category}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: status.bg,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: "600", color: status.text }}
            >
              {item.status}
            </Text>
          </View>
          {item.requiresRegistration && (
            <View
              style={{
                backgroundColor: "#fef3c7",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: "#92400e" }}
              >
                Registration Required
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <Text style={{ fontSize: 12, color: "#64748b" }}>
            📅{" "}
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b" }}>
            ⏰ {item.startTime} – {item.endTime}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          📍 {item.venue}
        </Text>
        {item.capacity && (
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            👥 {item.registrationCount ?? 0} / {item.capacity} registered
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen({ navigation }) {
  const { user } = useAuth();
  const isRep = user?.role?.includes("REP") || user?.role?.includes("ADMIN");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setCategory] = useState("ALL");
  const [activeStatus, setStatus] = useState("UPCOMING");

  const fetchEvents = async () => {
    try {
      const params = {};
      if (activeCategory !== "ALL") params.category = activeCategory;
      if (activeStatus !== "ALL") params.status = activeStatus;
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvents();
    }, [activeCategory, activeStatus]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>
          Events
        </Text>
        {isRep && (
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateEvent")}
            style={{
              backgroundColor: "#1a3c6e",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              + Create
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status filter */}
      <FlatList
        data={STATUSES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        renderItem={({ item }) => {
          const active = item === activeStatus;
          return (
            <TouchableOpacity
              onPress={() => setStatus(item)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                backgroundColor: active ? "#1a3c6e" : "#fff",
                borderColor: active ? "#1a3c6e" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Category filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => {
          const active = item === activeCategory;
          return (
            <TouchableOpacity
              onPress={() => setCategory(item)}
              style={{
                marginRight: 8,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 16,
                borderWidth: 1,
                backgroundColor: active ? "#0f172a" : "#fff",
                borderColor: active ? "#0f172a" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1a3c6e"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
              <Text style={{ fontSize: 15, color: "#94a3b8" }}>
                No events found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={() =>
                navigation.navigate("EventDetail", { eventId: item._id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
