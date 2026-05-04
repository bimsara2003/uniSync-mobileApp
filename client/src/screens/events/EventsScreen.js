import { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#1a3c6e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {item.bannerImageUrl ? (
        <Image
          source={{ uri: item.bannerImageUrl }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 120,
            backgroundColor: "#f8fafc",
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#f1f5f9",
          }}
        >
          <Ionicons name="calendar-outline" size={40} color="#94a3b8" />
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
            fontSize: 18,
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: 10,
          }}
        >
          {item.title}
        </Text>

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="time-outline" size={16} color="#64748b" />
            <Text style={{ fontSize: 13, color: "#475569" }}>
              {new Date(item.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })} • {item.startTime} – {item.endTime}
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#64748b" />
            <Text style={{ fontSize: 13, color: "#475569" }} numberOfLines={1}>
              {item.venue}
            </Text>
          </View>

          {item.capacity && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="people-outline" size={16} color="#94a3b8" />
              <Text style={{ fontSize: 13, color: "#64748b" }}>
                {item.registrationCount ?? 0} / {item.capacity} registered
              </Text>
            </View>
          )}
        </View>
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

  const fetchEvents = async () => {
    try {
      const params = {};
      if (activeCategory !== "ALL") params.category = activeCategory;
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Fetch when filters change
  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [activeCategory]);

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

      {/* Category filter */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {CATEGORIES.map((item) => {
            const active = item === activeCategory;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={{
                  marginRight: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 24,
                  backgroundColor: active ? "#1a3c6e" : "#e2e8f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? "700" : "600",
                    color: active ? "#ffffff" : "#475569",
                  }}
                >
                  {item === "ALL" ? "All Events" : item.charAt(0) + item.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
