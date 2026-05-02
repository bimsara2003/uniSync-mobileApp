import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch, Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../../api/axiosInstance";

const CATEGORIES = ["GENERAL", "EXAM", "EVENT", "URGENT"];

export default function EditAnnouncementScreen({ route, navigation }) {
  const { id } = route.params;
  const [form, setForm] = useState({
    title: "", body: "", category: "GENERAL",
    isPinned: false, eventDate: "", eventVenue: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const res = await api.get(`/announcements/${id}`);
      const ann = res.data;
      setForm({
        title: ann.title,
        body: ann.body,
        category: ann.category,
        isPinned: ann.isPinned,
        eventDate: ann.eventDate || "",
        eventVenue: ann.eventVenue || "",
      });
      // We don't load existing images/files into the picker state 
      // but they remain on the server unless replaced.
    } catch (err) {
      Alert.alert("Error", "Could not load announcement details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to add a cover image");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) setCoverImage(result.assets[0]);
  };

  const pickDocument = async () => {
    if (attachments.length >= 5) {
      Alert.alert("Limit reached", "You can attach up to 5 files");
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAttachments((prev) => [...prev, result.assets[0]]);
    }
  };

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert("Required", "Title and body are required");
      return;
    }
    setUpdating(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("body", form.body.trim());
      data.append("category", form.category);
      data.append("isPinned", String(form.isPinned));
      if (form.eventDate) data.append("eventDate", form.eventDate);
      if (form.eventVenue) data.append("eventVenue", form.eventVenue);

      if (coverImage) {
        data.append("coverImage", {
          uri: coverImage.uri,
          name: coverImage.fileName || "cover.jpg",
          type: coverImage.mimeType || "image/jpeg",
        });
      }

      for (const file of attachments) {
        data.append("attachments", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
      }

      await api.put(`/announcements/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Announcement updated!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not update announcement");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 14, flexDirection: "row", alignItems: "center",
        borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#0f172a" }}>Edit Announcement</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Title *</Text>
        <TextInput
          value={form.title}
          onChangeText={set("title")}
          style={{
            backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5,
            borderColor: "#cbd5e1", paddingHorizontal: 14, paddingVertical: 12,
            fontSize: 14, color: "#0f172a", marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Body *</Text>
        <TextInput
          value={form.body}
          onChangeText={set("body")}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5,
            borderColor: "#cbd5e1", paddingHorizontal: 14, paddingVertical: 12,
            fontSize: 14, color: "#0f172a", marginBottom: 16, minHeight: 130,
          }}
        />

        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => set("category")(c)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: form.category === c ? "#0ea5e9" : "#f1f5f9",
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: "500",
                color: form.category === c ? "#fff" : "#64748b",
              }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "#fff", borderRadius: 10, padding: 14,
          borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
        }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#0f172a" }}>📌 Pin this announcement</Text>
          </View>
          <Switch
            value={form.isPinned}
            onValueChange={set("isPinned")}
            trackColor={{ false: "#e2e8f0", true: "#bae6fd" }}
            thumbColor={form.isPinned ? "#0ea5e9" : "#f1f5f9"}
          />
        </View>

        {form.category === "EVENT" && (
          <>
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Event date (ISO format)</Text>
            <TextInput
              value={form.eventDate}
              onChangeText={set("eventDate")}
              style={{
                backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5,
                borderColor: "#cbd5e1", paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 14, color: "#0f172a", marginBottom: 16,
              }}
            />
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Venue</Text>
            <TextInput
              value={form.eventVenue}
              onChangeText={set("eventVenue")}
              style={{
                backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5,
                borderColor: "#cbd5e1", paddingHorizontal: 14, paddingVertical: 12,
                fontSize: 14, color: "#0f172a", marginBottom: 16,
              }}
            />
          </>
        )}

        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Update cover image (optional)</Text>
        <TouchableOpacity
          onPress={pickImage}
          style={{
            backgroundColor: coverImage ? "#f0f9ff" : "#fff",
            borderRadius: 10, borderWidth: 0.5,
            borderColor: coverImage ? "#bae6fd" : "#cbd5e1",
            padding: 16, alignItems: "center", marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: coverImage ? "#0284c7" : "#94a3b8" }}>
            {coverImage ? "✓ Image selected" : "📷 Tap to replace cover image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={updating}
          style={{
            backgroundColor: "#0ea5e9", borderRadius: 12,
            paddingVertical: 16, alignItems: "center", marginBottom: 40,
          }}
        >
          {updating
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
