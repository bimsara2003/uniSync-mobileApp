import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, StyleSheet, Linking,
} from "react-native";
import { lostFoundAPI } from "../../api/lostFound";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_ICONS = {
  ELECTRONICS: "📱", DOCUMENTS: "📄", CLOTHING: "👕",
  KEYS: "🔑", BOOKS: "📚", OTHER: "📦",
};

const TYPE_STYLE = {
  LOST:  { bg: "#fee2e2", text: "#991b1b" },
  FOUND: { bg: "#d1fae5", text: "#065f46" },
};

export default function LostFoundDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [item, setItem]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lostFoundAPI.getItemById(id)
      .then(({ data }) => setItem(data))
      .catch(() => Alert.alert("Error", "Could not load item"))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = item && item.postedBy?._id === user?._id;
  const isAdmin = user?.role?.includes("ADMIN");
  const canModify = isOwner || isAdmin;

  const handleResolve = () => {
    Alert.alert(
      "Mark as Resolved",
      "This will archive the listing. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          style: "destructive",
          onPress: async () => {
            try {
              await lostFoundAPI.resolveItem(id);
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed");
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await lostFoundAPI.deleteItem(id);
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Item not found</Text>
      </View>
    );
  }

  const typeStyle = TYPE_STYLE[item.type];
  const icon = CATEGORY_ICONS[item.category] || "📦";
  const date = new Date(item.dateLostFound).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const postedDate = new Date(item.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const initials = `${item.postedBy?.firstName?.[0] || ""}${item.postedBy?.lastName?.[0] || ""}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1a3c6e" />
      </TouchableOpacity>

      {/* Photo */}
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={{ fontSize: 60 }}>{icon}</Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: typeStyle.text }]}>{item.type}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: "#f1f5f9" }]}>
          <Text style={[styles.badgeText, { color: "#475569" }]}>
            {icon} {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
          </Text>
        </View>
        {item.status === "RESOLVED" && (
          <View style={[styles.badge, { backgroundColor: "#dbeafe" }]}>
            <Text style={[styles.badgeText, { color: "#0c1d36" }]}>✓ Resolved</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Details */}
      <View style={styles.detailCard}>
        <DetailRow icon="📍" label="Location" value={item.location} />
        <DetailRow icon="🗓" label="Date" value={date} />
        {item.description ? (
          <DetailRow icon="📝" label="Description" value={item.description} />
        ) : null}
      </View>

      {/* Posted by */}
      <View style={styles.posterCard}>
        <View style={styles.avatar}>
          {item.postedBy?.profilePictureUrl ? (
            <Image source={{ uri: item.postedBy.profilePictureUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.posterName}>
            {item.postedBy?.firstName} {item.postedBy?.lastName}
          </Text>
          <Text style={styles.posterDate}>Posted {postedDate}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${item.postedBy?.email}`)}
          style={styles.contactBtn}
        >
          <Text style={styles.contactBtnText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      {canModify && item.status === "ACTIVE" && (
        <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
          <Text style={styles.resolveBtnText}>✓ Mark as Resolved</Text>
        </TouchableOpacity>
      )}

      {canModify && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑 Delete Listing</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 15 },
  backBtn: { padding: 16, paddingTop: 56 },
  backText: { color: "#1a3c6e", fontSize: 15, fontWeight: "600" },
  photo: { width: "100%", height: 240, backgroundColor: "#e2e8f0" },
  photoPlaceholder: {
    width: "100%", height: 200, backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },
  badgeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", paddingHorizontal: 16, marginTop: 10, marginBottom: 14 },
  detailCard: {
    marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 14, padding: 16,
    borderWidth: 0.5, borderColor: "#e2e8f0", gap: 12, marginBottom: 14,
  },
  detailRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  detailIcon: { fontSize: 16, marginTop: 2 },
  detailLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: 2 },
  detailValue: { fontSize: 14, color: "#0f172a" },
  posterCard: {
    marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#dbeafe",
    alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { fontSize: 15, fontWeight: "700", color: "#122a4f" },
  posterName: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  posterDate: { fontSize: 11, color: "#94a3b8" },
  contactBtn: {
    backgroundColor: "#1a3c6e", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  contactBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  resolveBtn: {
    marginHorizontal: 16, backgroundColor: "#059669", borderRadius: 12, padding: 14,
    alignItems: "center", marginBottom: 10,
  },
  resolveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  deleteBtn: {
    marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: "#fca5a5",
  },
  deleteBtnText: { color: "#dc2626", fontWeight: "600", fontSize: 14 },
});
