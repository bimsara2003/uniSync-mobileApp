import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, SafeAreaView, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { portfolioAPI } from "../../api/portfolio";

const TYPE_COLORS = {
  PROJECT:        { bg: "#eff6ff", text: "#2563eb" },
  ACHIEVEMENT:    { bg: "#fefce8", text: "#b45309" },
  CERTIFICATION:  { bg: "#f0fdf4", text: "#16a34a" },
  EXPERIENCE:     { bg: "#fdf4ff", text: "#9333ea" },
  EXTRACURRICULAR:{ bg: "#fff1f2", text: "#e11d48" },
};

const ITEM_TYPES = ["ALL", "PROJECT", "ACHIEVEMENT", "CERTIFICATION", "EXPERIENCE", "EXTRACURRICULAR"];

export default function ViewUserPortfolioScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const [portfolio, setPortfolio]   = useState(null);
  const [items, setItems]           = useState([]);
  const [filter, setFilter]         = useState("ALL");
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await portfolioAPI.getPortfolioByUserId(userId);
      setPortfolio(data.portfolio);
      setItems(data.items);
    } catch (e) {
      const msg = e.response?.data?.message || "Could not load portfolio.";
      Alert.alert("Error", msg);
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const filteredItems = filter === "ALL" ? items : items.filter((i) => i.type === filter);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Back + header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 0 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
            {userName ?? "Portfolio"}
          </Text>
        </View>

        {/* Profile card */}
        <View style={{
          margin: 20, backgroundColor: "#fff", borderRadius: 16,
          padding: 20, alignItems: "center",
          borderWidth: 0.5, borderColor: "#e2e8f0",
        }}>
          {portfolio?.userId?.profilePictureUrl ? (
            <Image
              source={{ uri: portfolio.userId.profilePictureUrl }}
              style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 10 }}
            />
          ) : (
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: "#e0f2fe", justifyContent: "center", alignItems: "center", marginBottom: 10,
            }}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
          )}
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>
            {portfolio?.userId?.firstName} {portfolio?.userId?.lastName}
          </Text>
          {portfolio?.headline ? (
            <Text style={{ fontSize: 13, color: "#64748b", marginTop: 4, textAlign: "center" }}>
              {portfolio.headline}
            </Text>
          ) : null}
          {portfolio?.bio ? (
            <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>
              {portfolio.bio}
            </Text>
          ) : null}

          {/* Skills */}
          {portfolio?.skills?.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12, justifyContent: "center" }}>
              {portfolio.skills.map((s, i) => (
                <View key={i} style={{
                  backgroundColor: "#e0f2fe", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
                }}>
                  <Text style={{ fontSize: 11, color: "#0369a1", fontWeight: "500" }}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Links */}
          {(portfolio?.linkedIn || portfolio?.gitHub || portfolio?.website) && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {portfolio.linkedIn && <LinkBadge label="LinkedIn" icon="💼" />}
              {portfolio.gitHub   && <LinkBadge label="GitHub"   icon="🐙" />}
              {portfolio.website  && <LinkBadge label="Website"  icon="🌐" />}
            </View>
          )}
        </View>

        {/* Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12 }}>
            Portfolio Items ({items.length})
          </Text>

          {/* Type filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {ITEM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t} onPress={() => setFilter(t)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                    backgroundColor: filter === t ? "#0ea5e9" : "#fff",
                    borderWidth: 1, borderColor: filter === t ? "#0ea5e9" : "#e2e8f0",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: filter === t ? "#fff" : "#64748b" }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filteredItems.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📁</Text>
              <Text style={{ color: "#94a3b8", fontSize: 13 }}>No items in this category.</Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const colors = TYPE_COLORS[item.type] || { bg: "#f1f5f9", text: "#64748b" };
              return (
                <View key={item._id} style={{
                  backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12,
                  borderWidth: 0.5, borderColor: "#e2e8f0",
                }}>
                  <View style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: colors.text }}>{item.type}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a" }}>{item.title}</Text>
                  {item.organization ? (
                    <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.organization}</Text>
                  ) : null}
                  {item.description ? (
                    <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  {item.tags?.length > 0 && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {item.tags.map((t, i) => (
                        <View key={i} style={{
                          backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 10, color: "#64748b" }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkBadge({ label, icon }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: "#f8fafc", borderWidth: 0.5, borderColor: "#e2e8f0",
      borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4,
    }}>
      <Text style={{ fontSize: 12 }}>{icon}</Text>
      <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500" }}>{label}</Text>
    </View>
  );
}
