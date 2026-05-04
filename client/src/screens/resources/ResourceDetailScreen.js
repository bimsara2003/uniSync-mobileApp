import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking,
} from "react-native";
import { resourcesAPI } from "../../api/resources";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLE = {
  APPROVED: { bg: "#dcfce7", text: "#166534", label: "Approved" },
  PENDING:  { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
};

const CATEGORY_LABELS = {
  LECTURE_NOTE: "Lecture Note",
  PAST_PAPER: "Past Paper",
  PROJECT: "Project",
  TEMPLATE: "Template",
  SUMMARY: "Summary",
  OTHER: "Other",
};

export default function ResourceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, isStaffOrAdmin } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchResource = async () => {
    try {
      const { data } = await resourcesAPI.getResourceById(id);
      setResource(data);
    } catch {
      Alert.alert("Error", "Could not load resource");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResource(); }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await resourcesAPI.getDownloadUrl(id);
      const url = data.url || data.downloadUrl;
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Download URL not available");
      }
    } catch {
      Alert.alert("Error", "Could not download resource");
    } finally {
      setDownloading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      await resourcesAPI.toggleBookmark(id);
      fetchResource();
    } catch {
      Alert.alert("Error", "Could not update bookmark");
    }
  };

  const handleApprove = async () => {
    try {
      await resourcesAPI.approveResource(id);
      fetchResource();
      Alert.alert("Success", "Resource approved");
    } catch {
      Alert.alert("Error", "Could not approve resource");
    }
  };

  const handleReject = () => {
    Alert.prompt
      ? Alert.prompt("Reject Resource", "Enter a reason:", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: async (reason) => {
              try {
                await resourcesAPI.rejectResource(id, reason);
                fetchResource();
              } catch {
                Alert.alert("Error", "Could not reject resource");
              }
            },
          },
        ])
      : (async () => {
          try {
            await resourcesAPI.rejectResource(id, "Rejected by reviewer");
            fetchResource();
            Alert.alert("Done", "Resource rejected");
          } catch {
            Alert.alert("Error", "Could not reject resource");
          }
        })();
  };

  const handleDelete = () => {
    Alert.alert("Delete Resource", "This action is permanent.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await resourcesAPI.deleteResource(id);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Could not delete resource");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f9ff" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  if (!resource) return null;

  const statusStyle = STATUS_STYLE[resource.status] || STATUS_STYLE.PENDING;
  const isBookmarked = resource.bookmarkedBy?.includes(user?._id);
  const isOwner = resource.uploadedBy?._id === user?._id || resource.uploadedBy === user?._id;
  const uploaderName = resource.uploadedBy?.firstName
    ? `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}`
    : "Unknown";

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
        flexDirection: "row", alignItems: "center",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color="#1a3c6e" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a", flex: 1 }} numberOfLines={1}>
          {resource.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Status + Category row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <View style={{
            backgroundColor: statusStyle.bg, borderRadius: 6,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: statusStyle.text }}>
              {statusStyle.label}
            </Text>
          </View>
          <View style={{
            backgroundColor: "#f1f5f9", borderRadius: 6,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#475569" }}>
              {CATEGORY_LABELS[resource.category] || resource.category}
            </Text>
          </View>
          <View style={{
            backgroundColor: "#f1f5f9", borderRadius: 6,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#475569" }}>
              {resource.resourceType === "OFFICIAL" ? "Official" : "Student Contribution"}
            </Text>
          </View>
        </View>

        {/* Rejection reason */}
        {resource.status === "REJECTED" && resource.rejectionReason && (
          <View style={{
            backgroundColor: "#fee2e2", borderRadius: 10,
            padding: 14, marginBottom: 16,
          }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#991b1b", marginBottom: 4 }}>
              Rejection Reason
            </Text>
            <Text style={{ fontSize: 13, color: "#991b1b" }}>{resource.rejectionReason}</Text>
          </View>
        )}

        {/* Info Card */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 14, padding: 20,
          borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
        }}>
          {resource.description && (
            <>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 6 }}>
                Description
              </Text>
              <Text style={{ fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 18 }}>
                {resource.description}
              </Text>
            </>
          )}

          <InfoRow label="Faculty" value={resource.faculty?.name} />
          <InfoRow label="Department" value={resource.department?.name} />
          <InfoRow label="Module" value={resource.module ? `${resource.module.code} – ${resource.module.name}` : "—"} />
          <InfoRow label="Uploaded by" value={uploaderName} />
          <InfoRow label="File type" value={resource.fileType || "—"} />
          <InfoRow label="File size" value={resource.fileSize ? formatSize(resource.fileSize) : "—"} />
          <InfoRow label="Downloads" value={String(resource.downloadCount || 0)} />
          <InfoRow
            label="Uploaded"
            value={new Date(resource.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
            last
          />
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 10, marginBottom: 20 }}>
          {/* Download */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            style={{
              backgroundColor: "#1a3c6e", borderRadius: 12,
              paddingVertical: 14, alignItems: "center",
              flexDirection: "row", justifyContent: "center", gap: 8,
            }}
          >
            {downloading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={{ fontSize: 16 }}>⬇️</Text>
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Download</Text>
                </>
            }
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity
            onPress={handleBookmark}
            style={{
              backgroundColor: isBookmarked ? "#dbeafe" : "#fff",
              borderRadius: 12, paddingVertical: 14, alignItems: "center",
              borderWidth: 0.5, borderColor: isBookmarked ? "#7dd3fc" : "#e2e8f0",
              flexDirection: "row", justifyContent: "center", gap: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>{isBookmarked ? "🔖" : "🏷️"}</Text>
            <Text style={{
              color: isBookmarked ? "#122a4f" : "#475569",
              fontWeight: "600", fontSize: 15,
            }}>
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Staff approval actions */}
        {isStaffOrAdmin && resource.status === "PENDING" && (
          <View style={{
            backgroundColor: "#fff", borderRadius: 14, padding: 20,
            borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
          }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 14 }}>
              Review Actions
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={handleApprove}
                style={{
                  flex: 1, backgroundColor: "#dcfce7", borderRadius: 10,
                  paddingVertical: 12, alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#166534" }}>✓ Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                style={{
                  flex: 1, backgroundColor: "#fee2e2", borderRadius: 10,
                  paddingVertical: 12, alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#991b1b" }}>✗ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delete button (owner or staff) */}
        {(isOwner || isStaffOrAdmin) && (
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              backgroundColor: "#fff", borderRadius: 12,
              paddingVertical: 14, alignItems: "center",
              borderWidth: 0.5, borderColor: "#fecaca", marginBottom: 40,
            }}
          >
            <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 15 }}>Delete Resource</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: last ? 0 : 0.5, borderBottomColor: "#f1f5f9",
    }}>
      <Text style={{ fontSize: 13, color: "#94a3b8" }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "500", maxWidth: "60%", textAlign: "right" }}>
        {value || "—"}
      </Text>
    </View>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
