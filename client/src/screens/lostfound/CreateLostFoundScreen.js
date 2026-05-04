import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StyleSheet, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { lostFoundAPI } from "../../api/lostFound";

const TYPES = ["LOST", "FOUND"];
const CATEGORIES = ["ELECTRONICS", "DOCUMENTS", "CLOTHING", "KEYS", "BOOKS", "OTHER"];

const CATEGORY_ICONS = {
  ELECTRONICS: "📱", DOCUMENTS: "📄", CLOTHING: "👕",
  KEYS: "🔑", BOOKS: "📚", OTHER: "📦",
};

export default function CreateLostFoundScreen({ navigation }) {
  const [type, setType]               = useState("LOST");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("OTHER");
  const [location, setLocation]       = useState("");
  const [date, setDate]               = useState(
    new Date().toISOString().split("T")[0]   // YYYY-MM-DD
  );
  const [photo, setPhoto]   = useState(null);   // { uri, type, name }
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Gallery access is needed to attach a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim())    return Alert.alert("Validation", "Title is required.");
    if (!location.trim()) return Alert.alert("Validation", "Location is required.");
    if (!date.trim())     return Alert.alert("Validation", "Date is required.");

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return Alert.alert("Validation", "Date must be in YYYY-MM-DD format.");
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("location", location.trim());
      formData.append("dateLostFound", date);
      if (photo) {
        formData.append("photo", {
          uri: photo.uri,
          type: photo.type,
          name: photo.name,
        });
      }
      await lostFoundAPI.createItem(formData);
      Alert.alert("Posted!", "Your listing has been published.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to post item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Item</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="#1a3c6e" />
          ) : (
            <Text style={styles.submitText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Type toggle */}
      <Text style={styles.label}>I am reporting a...</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeBtn,
              type === t && (t === "LOST" ? styles.typeBtnLost : styles.typeBtnFound),
            ]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
              {t === "LOST" ? "😢 Lost Item" : "😊 Found Item"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Black Samsung phone, Blue ID card"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      {/* Category */}
      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={styles.catChipText}>
              {CATEGORY_ICONS[cat]} {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.label}>{type === "LOST" ? "Last Seen Location" : "Found Location"} *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Library 2nd floor, Canteen"
        placeholderTextColor="#9ca3af"
        value={location}
        onChangeText={setLocation}
      />

      {/* Date */}
      <Text style={styles.label}>{type === "LOST" ? "Date Lost" : "Date Found"} * (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2026-05-03"
        placeholderTextColor="#9ca3af"
        value={date}
        onChangeText={setDate}
        keyboardType="numeric"
        maxLength={10}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any identifying details, colour, brand, etc."
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Photo */}
      <Text style={styles.label}>Photo (optional)</Text>
      <TouchableOpacity style={styles.photoPickerBtn} onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
        ) : (
          <Text style={styles.photoPickerText}>📷 Tap to attach a photo</Text>
        )}
      </TouchableOpacity>
      {photo && (
        <TouchableOpacity onPress={() => setPhoto(null)}>
          <Text style={styles.removePhoto}>Remove photo</Text>
        </TouchableOpacity>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Post Listing</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  cancelText: { color: "#64748b", fontSize: 15 },
  submitText: { color: "#1a3c6e", fontSize: 15, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginHorizontal: 16, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 10,
    borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#0f172a",
  },
  textArea: { minHeight: 90 },
  typeRow: { flexDirection: "row", marginHorizontal: 16, gap: 10 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0",
  },
  typeBtnLost:  { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  typeBtnFound: { backgroundColor: "#d1fae5", borderColor: "#6ee7b7" },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  typeBtnTextActive: { color: "#0f172a" },
  categoryGrid: {
    flexDirection: "row", flexWrap: "wrap", marginHorizontal: 16, gap: 8,
  },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0",
  },
  catChipActive: { backgroundColor: "#1a3c6e", borderColor: "#1a3c6e" },
  catChipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  photoPickerBtn: {
    marginHorizontal: 16, height: 140, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "#e2e8f0", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  photoPickerText: { color: "#94a3b8", fontSize: 14 },
  photoPreview: { width: "100%", height: "100%" },
  removePhoto: { color: "#ef4444", textAlign: "center", marginTop: 8, fontSize: 13 },
  submitBtn: {
    marginHorizontal: 16, marginTop: 24, backgroundColor: "#1a3c6e",
    borderRadius: 12, padding: 16, alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
