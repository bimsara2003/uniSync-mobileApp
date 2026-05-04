import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { portfolioAPI } from "../../api/portfolio";

const TYPE_COLORS = {
  PROJECT: { bg: "#eff6ff", text: "#2563eb" },
  ACHIEVEMENT: { bg: "#fefce8", text: "#b45309" },
  CERTIFICATION: { bg: "#f0fdf4", text: "#16a34a" },
  EXPERIENCE: { bg: "#fdf4ff", text: "#9333ea" },
  EXTRACURRICULAR: { bg: "#fff1f2", text: "#e11d48" },
};

export default function PortfolioItemDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      portfolioAPI
        .getItemById(itemId)
        .then(({ data }) => setItem(data))
        .catch(() => {
          Alert.alert("Error", "Could not load item.");
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    }, [itemId]),
  );

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await portfolioAPI.deleteItem(itemId);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!item) return null;

  const colors = TYPE_COLORS[item.type] || { bg: "#f1f5f9", text: "#64748b" };

  const dateRange = () => {
    if (!item.startDate) return null;
    const from = new Date(item.startDate).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
    if (item.isOngoing) return `${from} – Present`;
    if (item.endDate) {
      const to = new Date(item.endDate).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      });
      return `${from} – ${to}`;
    }
    return from;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#0f172a",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>

        {/* Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 14,
              marginBottom: 16,
            }}
            resizeMode="cover"
          />
        )}

        {/* Type badge */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 10,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
            >
              {item.type}
            </Text>
          </View>
        </View>

        {/* Info rows */}
        {item.organization ? (
          <InfoRow label="Organization" value={item.organization} />
        ) : null}
        {dateRange() ? <InfoRow label="Duration" value={dateRange()} /> : null}

        {/* Description */}
        {item.description ? (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              DESCRIPTION
            </Text>
            <Text style={{ fontSize: 14, color: "#0f172a", lineHeight: 22 }}>
              {item.description}
            </Text>
          </View>
        ) : null}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              TAGS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {item.tags.map((t, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "#e0f2fe",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#0369a1",
                      fontWeight: "500",
                    }}
                  >
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Links */}
        {item.githubLink ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              borderWidth: 0.5,
              borderColor: "#e2e8f0",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              GitHub
            </Text>
            <Text style={{ fontSize: 13, color: "#0ea5e9" }}>
              {item.githubLink}
            </Text>
          </View>
        ) : null}

        {item.liveLink ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              borderWidth: 0.5,
              borderColor: "#e2e8f0",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              Live Link
            </Text>
            <Text style={{ fontSize: 13, color: "#0ea5e9" }}>
              {item.liveLink}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditPortfolioItem", { itemId: item._id })
            }
            style={{
              flex: 1,
              backgroundColor: "#0ea5e9",
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#fca5a5",
            }}
          >
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 10, gap: 6 }}>
      <Text
        style={{
          fontSize: 13,
          color: "#64748b",
          width: 100,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 13, color: "#0f172a", flex: 1 }}>{value}</Text>
    </View>
  );
}
