import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image, Linking, Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import api from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_STYLE = {
  GENERAL: { bg: "#f1f5f9", text: "#475569" },
  EXAM:    { bg: "#fef3c7", text: "#92400e" },
  EVENT:   { bg: "#dbeafe", text: "#1a3c6e" },
  URGENT:  { bg: "#fee2e2", text: "#991b1b" },
};

function LiveCountdown({ eventDate }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(eventDate) - new Date();
      if (diff <= 0) { setT({ expired: true }); return; }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  if (t.expired) return null;

  const Block = ({ val, label }) => (
    <View style={{ alignItems: "center", minWidth: 54 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#0f172a" }}>
        {String(val).padStart(2, "0")}
      </Text>
      <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{label}</Text>
    </View>
  );

  return (
    <View style={{
      backgroundColor: "#f0f9ff", borderRadius: 14, padding: 20,
      marginBottom: 20, borderWidth: 0.5, borderColor: "#93c5fd",
    }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#122a4f", marginBottom: 14 }}>
        ⏱ EVENT COUNTDOWN
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, alignItems: "center" }}>
        <Block val={t.d} label="days" />
        <Text style={{ fontSize: 22, color: "#94a3b8", marginBottom: 14 }}>:</Text>
        <Block val={t.h} label="hrs" />
        <Text style={{ fontSize: 22, color: "#94a3b8", marginBottom: 14 }}>:</Text>
        <Block val={t.m} label="min" />
        <Text style={{ fontSize: 22, color: "#94a3b8", marginBottom: 14 }}>:</Text>
        <Block val={t.s} label="sec" />
      </View>
    </View>
  );
}

export default function AnnouncementDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isStaffOrAdmin } = useAuth();
  const [ann,     setAnn]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get(`/announcements/${id}`)
      .then((r) => setAnn(r.data))
      .catch(() => Alert.alert("Error", "Could not load announcement"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    Alert.alert("Delete", "Are you sure you want to delete this announcement?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await api.delete(`/announcements/${id}`);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDownload = async (att) => {
    try {
      setDownloading(att._id);
      // Ensure the file extension is preserved in the local path
      const fileUri = `${FileSystem.cacheDirectory}${att.fileName}`;
      const downloadRes = await FileSystem.downloadAsync(att.fileUrl, fileUri);
      
      if (downloadRes.status !== 200) {
        throw new Error("Download failed");
      }

      if (Platform.OS === "android") {
        // On Android, use IntentLauncher to open directly with a PDF/Doc app
        const cUri = await FileSystem.getContentUriAsync(downloadRes.uri);
        IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: cUri,
          flags: 1,
          type: att.fileType || "application/pdf",
        });
      } else {
        // On iOS, Sharing.shareAsync triggers the built-in "Quick Look" viewer
        await Sharing.shareAsync(downloadRes.uri, { UTI: att.fileType });
      }
    } catch (err) {
      Alert.alert("Error", "Could not open the file. Make sure you have a PDF viewer installed.");
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  if (!ann) return null;

  const cat     = CATEGORY_STYLE[ann.category] || CATEGORY_STYLE.GENERAL;
  const initials = `${ann.postedBy?.firstName?.[0] || ""}${ann.postedBy?.lastName?.[0] || ""}`;

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 14, flexDirection: "row", alignItems: "center",
        borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color="#1a3c6e" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a", flex: 1 }} numberOfLines={1}>
          {ann.title}
        </Text>
        {isStaffOrAdmin && (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.navigate("EditAnnouncement", { id })}>
              <Text style={{ fontSize: 13, color: "#1a3c6e", fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ fontSize: 13, color: "#ef4444" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {ann.coverImageUrl && (
          <Image
            source={{ uri: ann.coverImageUrl }}
            style={{ width: "100%", height: 350, borderRadius: 14, marginBottom: 20, backgroundColor: '#f1f5f9' }}
            resizeMode="contain"
          />
        )}

        {ann.eventDate && <LiveCountdown eventDate={ann.eventDate} />}

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 }}>
          <View style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontWeight: "700", color: "#122a4f" }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", color: "#0f172a" }}>
              {ann.postedBy?.firstName} {ann.postedBy?.lastName}
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>
              {new Date(ann.createdAt).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </Text>
          </View>
          <View style={{ backgroundColor: cat.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: cat.text }}>{ann.category}</Text>
          </View>
        </View>

        {ann.eventVenue && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "#f1f5f9", borderRadius: 10,
            padding: 12, marginBottom: 16,
          }}>
            <Text style={{ fontSize: 16 }}>📍</Text>
            <Text style={{ fontSize: 13, color: "#475569" }}>{ann.eventVenue}</Text>
          </View>
        )}

        <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 14, lineHeight: 30 }}>
          {ann.title}
        </Text>

        <Text style={{ fontSize: 15, color: "#334155", lineHeight: 26 }}>
          {ann.body}
        </Text>

        {ann.attachments?.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginBottom: 10 }}>
              ATTACHMENTS
            </Text>
            {ann.attachments.map((att) => (
              <TouchableOpacity
                key={att._id}
                onPress={() => handleDownload(att)}
                disabled={downloading === att._id}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: "#fff", borderRadius: 12, padding: 14,
                  borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 22 }}>📎</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: "#0f172a" }} numberOfLines={1}>
                    {att.fileName}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                    {downloading === att._id ? "Downloading..." : `${(att.fileSize / 1024).toFixed(0)} KB · Tap to view`}
                  </Text>
                </View>
                {downloading === att._id ? (
                  <ActivityIndicator size="small" color="#1a3c6e" />
                ) : (
                  <Text style={{ color: "#1a3c6e", fontSize: 18 }}>↗</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
