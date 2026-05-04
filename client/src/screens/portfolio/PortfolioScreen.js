import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { portfolioAPI } from "../../api/portfolio";
import { useAuth } from "../../context/AuthContext";

const ITEM_TYPES = [
  "ALL",
  "PROJECT",
  "ACHIEVEMENT",
  "CERTIFICATION",
  "EXPERIENCE",
  "EXTRACURRICULAR",
];

const TYPE_COLORS = {
  PROJECT: { bg: "#eff6ff", text: "#2563eb" },
  ACHIEVEMENT: { bg: "#fefce8", text: "#b45309" },
  CERTIFICATION: { bg: "#f0fdf4", text: "#16a34a" },
  EXPERIENCE: { bg: "#fdf4ff", text: "#9333ea" },
  EXTRACURRICULAR: { bg: "#fff1f2", text: "#e11d48" },
};

export default function PortfolioScreen({ navigation }) {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await portfolioAPI.getMyPortfolio();
      setPortfolio(data.portfolio);
      setItems(data.items);
    } catch {
      Alert.alert("Error", "Could not load portfolio.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const filteredItems =
    filter === "ALL" ? items : items.filter((i) => i.type === filter);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        {/* ── Profile card ── */}
        <View
          style={{
            backgroundColor: "#1a3c6e",
            paddingTop: 40,
            paddingBottom: 24,
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          {portfolio?.userId?.profilePictureUrl ? (
            <Image
              source={{ uri: portfolio.userId.profilePictureUrl }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 12,
                borderWidth: 3,
                borderColor: "#fff",
              }}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.3)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
          )}
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
            {portfolio?.userId?.firstName} {portfolio?.userId?.lastName}
          </Text>
          {portfolio?.headline ? (
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {portfolio.headline}
            </Text>
          ) : null}

          {/* Visibility toggle */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              gap: 8,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>
              Public profile
            </Text>
            <Switch
              value={portfolio?.isPublic ?? true}
              onValueChange={async (val) => {
                try {
                  await portfolioAPI.updateMyPortfolio({ isPublic: val });
                  setPortfolio((p) => ({ ...p, isPublic: val }));
                } catch {
                  Alert.alert("Error", "Could not update visibility.");
                }
              }}
              trackColor={{ true: "#38bdf8" }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("EditPortfolio", { portfolio })}
            style={{
              marginTop: 14,
              paddingHorizontal: 20,
              paddingVertical: 7,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#fff",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Skills ── */}
        {portfolio?.skills?.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              SKILLS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {portfolio.skills.map((s, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "#dbeafe",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#0c1d36",
                      fontWeight: "500",
                    }}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Links ── */}
        {(portfolio?.linkedIn || portfolio?.gitHub || portfolio?.website) && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              flexDirection: "row",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {portfolio.linkedIn && (
              <LinkBadge
                label="LinkedIn"
                icon="💼"
                url={portfolio.linkedIn}
              />
            )}
            {portfolio.gitHub && (
              <LinkBadge
                label="GitHub"
                icon="🐙"
                url={portfolio.gitHub}
              />
            )}
            {portfolio.website && (
              <LinkBadge
                label="Website"
                icon="🌐"
                url={portfolio.website}
              />
            )}
          </View>
        )}

        {/* ── Items section ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>
              Portfolio Items
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreatePortfolioItem")}
              style={{
                backgroundColor: "#1a3c6e",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>

          {/* Type filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {ITEM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setFilter(t)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: filter === t ? "#1a3c6e" : "#fff",
                    borderWidth: 1,
                    borderColor: filter === t ? "#1a3c6e" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: filter === t ? "#fff" : "#64748b",
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Items list */}
          {filteredItems.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>📁</Text>
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                No items yet. Tap + Add to get started.
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() =>
                  navigation.navigate("PortfolioItemDetail", {
                    itemId: item._id,
                  })
                }
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 12,
                  borderWidth: 0.5,
                  borderColor: "#e2e8f0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 52, height: 52, borderRadius: 8 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 8,
                        backgroundColor: "#f1f5f9",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>
                        {typeEmoji(item.type)}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 2,
                      }}
                    >
                      <TypeBadge type={item.type} />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#0f172a",
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.organization ? (
                      <Text
                        style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                      >
                        {item.organization}
                      </Text>
                    ) : null}
                    {item.description ? (
                      <Text
                        style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TypeBadge({ type }) {
  const colors = TYPE_COLORS[type] || { bg: "#f1f5f9", text: "#64748b" };
  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "700", color: colors.text }}>
        {type}
      </Text>
    </View>
  );
}

function LinkBadge({ label, icon, url }) {
  const handlePress = async () => {
    if (!url) return;
    try {
      // Add http:// if missing
      let fullUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        fullUrl = "https://" + url;
      }
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert("Error", "Cannot open this link.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#e2e8f0",
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 12 }}>{icon}</Text>
      <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function typeEmoji(type) {
  const map = {
    PROJECT: "💻",
    ACHIEVEMENT: "🏆",
    CERTIFICATION: "📜",
    EXPERIENCE: "🏢",
    EXTRACURRICULAR: "🎯",
  };
  return map[type] || "📁";
}
