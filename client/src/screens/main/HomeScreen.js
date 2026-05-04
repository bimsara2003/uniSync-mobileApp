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

const CATEGORY_STYLE = {
  GENERAL: { bg: "#f1f5f9", text: "#475569" },
  EXAM:    { bg: "#fef3c7", text: "#92400e" },
  EVENT:   { bg: "#dbeafe", text: "#1e40af" },
  URGENT:  { bg: "#fee2e2", text: "#991b1b" },
};

const ROLE_STYLE = {
  admin:   { bg: "#fee2e2", text: "#991b1b", label: "Admin" },
  staff:   { bg: "#dbeafe", text: "#1e40af", label: "Staff" },
  student: { bg: "#dcfce7", text: "#166534", label: "Student" },
};

function StatCard({ icon, count, label, color }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
      }}
    >
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: color, marginTop: 4 }}>
        {count}
      </Text>
      <Text style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({ icon, label, subtitle, onPress, accent }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: accent + "1a",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#0f172a" }}>{label}</Text>
        <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Text style={{ fontSize: 18, color: "#cbd5e1" }}>›</Text>
    </TouchableOpacity>
  );
}

function RecentAnnouncementCard({ item, onPress }) {
  const cat = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.GENERAL;
  const initials = `${item.postedBy?.firstName?.[0] || ""}${item.postedBy?.lastName?.[0] || ""}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: item.isPinned ? "#bae6fd" : "#e2e8f0",
        borderLeftWidth: item.isPinned ? 3 : 0.5,
        borderLeftColor: item.isPinned ? "#0ea5e9" : "#e2e8f0",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "#e0f2fe",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#0284c7" }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748b", flex: 1 }}>
          {item.postedBy?.firstName} {item.postedBy?.lastName}
        </Text>
        <View
          style={{
            backgroundColor: cat.bg,
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "600", color: cat.text }}>
            {item.category}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 12, color: "#64748b", marginTop: 3 }} numberOfLines={2}>
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

  const roleInfo = ROLE_STYLE[user?.role] || ROLE_STYLE.student;
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: "#0ea5e9",
            paddingTop: 56,
            paddingBottom: 28,
            paddingHorizontal: 20,
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
                borderColor: "#bae6fd",
              }}
            >
              {user?.profilePhotoUrl ? (
                <Image
                  source={{ uri: user.profilePhotoUrl }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0ea5e9" }}>
                  {initials}
                </Text>
              )}
            </TouchableOpacity>

            {/* Greeting */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: "#bae6fd" }}>{greeting()},</Text>
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
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#0ea5e9" }}>
                {roleInfo.label}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: "#e0f2fe", marginTop: 10 }}>
            Welcome back to UniSync
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

          {/* ── Stats Row ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Overview
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <StatCard icon="📢" count={stats.announcements} label="Announcements" color="#0ea5e9" />
            <StatCard icon="📚" count={stats.resources}     label="Resources"     color="#7c3aed" />
            <StatCard icon="🔍" count={stats.lostFound}     label="Lost & Found"  color="#ea580c" />
          </View>

          {/* ── Quick Actions ── */}
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Quick Access
          </Text>

          <QuickAction
            icon="📢"
            label="Announcements"
            subtitle="Campus news and updates"
            accent="#0ea5e9"
            onPress={() => navigation.navigate("Announcements")}
          />
          <QuickAction
            icon="📚"
            label="Resources"
            subtitle="Lecture notes, past papers & more"
            accent="#7c3aed"
            onPress={() => navigation.navigate("Resources")}
          />
          <QuickAction
            icon="🔍"
            label="Lost & Found"
            subtitle="Report or find lost items on campus"
            accent="#ea580c"
            onPress={() => navigation.navigate("LostFound")}
          />
          <QuickAction
            icon="👤"
            label="My Profile"
            subtitle="View and edit your profile"
            accent="#0ea5e9"
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
                  <Text style={{ fontSize: 12, color: "#0ea5e9", fontWeight: "600" }}>See all →</Text>
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
