import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";

const CATEGORY_STYLE = {
  GENERAL: { bg: "#f1f5f9", text: "#475569" },
  EXAM:    { bg: "#fef3c7", text: "#92400e" },
  EVENT:   { bg: "#dbeafe", text: "#1a3c6e" },
  URGENT:  { bg: "#fee2e2", text: "#991b1b" },
};

const ROLE_STYLE = {
  admin:   { bg: "#fee2e2", text: "#991b1b", label: "Admin" },
  staff:   { bg: "#dbeafe", text: "#1a3c6e", label: "Staff" },
  student: { bg: "#dcfce7", text: "#166534", label: "Student" },
};

function StatCard({ iconName, count, label, color }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f1f5f9",
      }}
    >
      <View style={{ backgroundColor: color + "15", padding: 10, borderRadius: 12, marginBottom: 8 }}>
        <Ionicons name={iconName} size={24} color={color} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a" }}>
        {count}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748b", textAlign: "center", marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({ iconName, label, subtitle, onPress, accent }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f0f9ff",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: accent + "15",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <Ionicons name={iconName} size={24} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 13, color: "#64748b" }}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

function RecentAnnouncementCard({ item, onPress }) {
  const cat = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.GENERAL;
  const initials = `${item.postedBy?.firstName?.[0] || ""}${item.postedBy?.lastName?.[0] || ""}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: item.isPinned ? "#1a3c6e" : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#f1f5f9",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569" }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "500", color: "#64748b", flex: 1 }}>
          {item.postedBy?.firstName} {item.postedBy?.lastName}
        </Text>
        {item.isPinned && <Ionicons name="pin" size={14} color="#1a3c6e" style={{ marginRight: 6 }} />}
        <View
          style={{
            backgroundColor: cat.bg,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: cat.text }}>
            {item.category}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 6 }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 20 }} numberOfLines={2}>
        {item.body}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, isStaffOrAdmin } = useAuth();

  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [stats, setStats]                             = useState({ announcements: 0, resources: 0, lostFound: 0 });
  const [loading, setLoading]                         = useState(true);
  const [refreshing, setRefreshing]                   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [annRes, resRes, lfRes] = await Promise.allSettled([
        api.get("/announcements?limit=3&sort=-createdAt"),
        api.get("/resources?status=APPROVED&limit=1"),
        api.get("/lost-found?status=ACTIVE&limit=1"),
      ]);

      if (annRes.status === "fulfilled") {
        const data = annRes.value.data;
        setRecentAnnouncements(Array.isArray(data) ? data.slice(0, 3) : (data.announcements || data.data || []).slice(0, 3));
        setStats((prev) => ({
          ...prev,
          announcements: data.total ?? (Array.isArray(data) ? data.length : 0),
        }));
      }
      if (resRes.status === "fulfilled") {
        const data = resRes.value.data;
        setStats((prev) => ({
          ...prev,
          resources: data.total ?? (Array.isArray(data) ? data.length : 0),
        }));
      }
      if (lfRes.status === "fulfilled") {
        const data = lfRes.value.data;
        setStats((prev) => ({
          ...prev,
          lostFound: data.total ?? (Array.isArray(data) ? data.length : 0),
        }));
      }
    } catch {
      // silently fail — individual settled results handled above
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  let currentRole = "student";
  if (user?.role?.includes("ADMIN")) currentRole = "admin";
  else if (user?.role?.includes("STAFF")) currentRole = "staff";
  else if (user?.role?.includes("REP")) currentRole = "rep";
  const roleInfo = ROLE_STYLE[currentRole] || ROLE_STYLE.student;
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f9ff", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a3c6e" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: "#1a3c6e",
            paddingTop: 60,
            paddingBottom: 32,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            shadowColor: "#1a3c6e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginRight: 14,
                borderWidth: 2,
                borderColor: "#93c5fd",
              }}
            >
              {user?.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a3c6e" }}>
                  {initials}
                </Text>
              )}
            </TouchableOpacity>

            {/* Greeting */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: "#93c5fd" }}>{greeting()},</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }} numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>

            {/* Role badge */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#1a3c6e" }}>
                {roleInfo.label}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: "#dbeafe", marginTop: 10 }}>
            Welcome back to UniSync
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

          {/* ── Stats Row ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Overview
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
            <StatCard iconName="megaphone" count={stats.announcements} label="Announcement" color="#1a3c6e" />
            <StatCard iconName="book" count={stats.resources}     label="Resources"     color="#8b5cf6" />
            <StatCard iconName="search" count={stats.lostFound}     label="Lost & Found"  color="#f97316" />
          </View>

          {/* ── Quick Actions ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Quick Access
          </Text>

          <QuickAction
            iconName="megaphone"
            label="Announcements"
            subtitle="Campus news and updates"
            accent="#1a3c6e"
            onPress={() => navigation.navigate("Announcements")}
          />
          <QuickAction
            iconName="book"
            label="Resources"
            subtitle="Lecture notes, past papers & more"
            accent="#8b5cf6"
            onPress={() => navigation.navigate("Resources")}
          />
          <QuickAction
            iconName="search"
            label="Lost & Found"
            subtitle="Report or find lost items on campus"
            accent="#f97316"
            onPress={() => navigation.navigate("LostFound")}
          />
          <QuickAction
            iconName="person"
            label="My Profile"
            subtitle="View and edit your profile"
            accent="#10b981"
            onPress={() => navigation.navigate("Profile")}
          />

          {/* ── Recent Announcements ── */}
          {recentAnnouncements.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Recent Announcements
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
                  <Text style={{ fontSize: 12, color: "#1a3c6e", fontWeight: "600" }}>See all →</Text>
                </TouchableOpacity>
              </View>

              {recentAnnouncements.map((item) => (
                <RecentAnnouncementCard
                  key={item._id}
                  item={item}
                  onPress={() =>
                    navigation.navigate("Announcements", {
                      screen: "AnnouncementDetail",
                      params: { id: item._id },
                    })
                  }
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
