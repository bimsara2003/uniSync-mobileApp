import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../../api/axiosInstance";
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ["GENERAL", "EXAM", "EVENT", "URGENT"];

export default function CreateAnnouncementScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "GENERAL",
    isPinned: false,
    eventDate: "",
    eventVenue: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to add a cover image",
      );
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
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAttachments((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert("Required", "Title and body are required");
      return;
    }
    setLoading(true);
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

      await api.post("/announcements", data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      Alert.alert("Success", "Announcement created!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        Alert.alert(
          "Error",
          "Upload timed out. Please try again or use smaller files.",
        );
      } else {
        Alert.alert(
          "Error",
          err.response?.data?.message || "Could not create announcement",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (

    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>

      {/* Header */}
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 14, flexDirection: "row", alignItems: "center",
        borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color="#1a3c6e" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#0f172a" }}>
          New Announcement
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Title */}
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          Title *
        </Text>
        <TextInput
          value={form.title}
          onChangeText={set("title")}
          placeholder="e.g. Semester 2 Exam Schedule"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: "#cbd5e1",
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: "#0f172a",
            marginBottom: 16,
          }}
        />

        {/* Body */}
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          Body *
        </Text>
        <TextInput
          value={form.body}
          onChangeText={set("body")}
          placeholder="Write the full announcement here..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: "#cbd5e1",
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: "#0f172a",
            marginBottom: 16,
            minHeight: 130,
          }}
        />

        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, marginBottom: 20 }}
        >
          {CATEGORIES.map((c) => {
            const isSelected = form.category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => set("category")(c)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: isSelected ? "#1a3c6e" : "#fff",
                  borderWidth: 1,
                  borderColor: isSelected ? "#1a3c6e" : "#e2e8f0",
                  shadowColor: isSelected ? "#1a3c6e" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: isSelected ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? "#fff" : "#64748b",
                  }}
                >
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pin toggle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 14,
            borderWidth: 0.5,
            borderColor: "#e2e8f0",
            marginBottom: 16,
          }}
        >
          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#0f172a" }}>
              📌 Pin this announcement
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Pinned posts appear at the top
            </Text>
          </View>
          <Switch
            value={form.isPinned}
            onValueChange={set("isPinned")}
            trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
            thumbColor={form.isPinned ? "#1a3c6e" : "#f1f5f9"}
          />
        </View>

        {/* Event date + venue — show only for EVENT category */}
        {form.category === "EVENT" && (
          <>
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Event date (ISO format)
            </Text>
            <TextInput
              value={form.eventDate}
              onChangeText={set("eventDate")}
              placeholder="2026-05-14T09:00:00.000Z"
              autoCapitalize="none"
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: "#cbd5e1",
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: "#0f172a",
                marginBottom: 16,
              }}
            />
            <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
              Venue
            </Text>
            <TextInput
              value={form.eventVenue}
              onChangeText={set("eventVenue")}
              placeholder="Main Hall, Block A"
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: "#cbd5e1",
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: "#0f172a",
                marginBottom: 16,
              }}
            />
          </>
        )}

        {/* Cover image */}
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
          Cover image (optional)
        </Text>
        <TouchableOpacity
          onPress={pickImage}
          style={{
            backgroundColor: coverImage ? "#f0f9ff" : "#fff",
            borderRadius: 10, borderWidth: 0.5,
            borderColor: coverImage ? "#93c5fd" : "#cbd5e1",

            borderStyle: coverImage ? "solid" : "dashed",
            padding: 16,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {coverImage ? (
            <Text style={{ fontSize: 13, color: "#122a4f", fontWeight: "500" }}>
              ✓ {coverImage.fileName || "Image selected"} — tap to change
            </Text>
          ) : (
            <Text style={{ fontSize: 13, color: "#94a3b8" }}>
              📷 Tap to select cover image
            </Text>
          )}
        </TouchableOpacity>

        {/* Attachments */}
        <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
          Attachments — up to 5 files (PDF, DOCX, PPTX)
        </Text>
        {attachments.map((f, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#f0f9ff", borderRadius: 10,
              padding: 12, marginBottom: 8,
              borderWidth: 0.5, borderColor: "#93c5fd",
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>📎</Text>
            <Text style={{ flex: 1, fontSize: 13, color: "#122a4f" }} numberOfLines={1}>

              {f.name}
            </Text>
            <TouchableOpacity onPress={() => removeAttachment(i)}>
              <Text style={{ fontSize: 18, color: "#94a3b8" }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={pickDocument}
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: "#cbd5e1",
            borderStyle: "dashed",
            padding: 14,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 13, color: "#94a3b8" }}>
            + Add attachment
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#1a3c6e", borderRadius: 12,
            paddingVertical: 16, alignItems: "center", marginBottom: 20,

          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Publish Announcement
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
