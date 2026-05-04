import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image, SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { lostFoundAPI } from "../../api/lostFound";

const TYPES      = ["LOST", "FOUND"];
const CATEGORIES = ["ELECTRONICS", "DOCUMENTS", "CLOTHING", "KEYS", "BOOKS", "OTHER"];

const CATEGORY_ICONS = {
  ELECTRONICS: "📱", DOCUMENTS: "📄", CLOTHING: "👕",
  KEYS: "🔑", BOOKS: "📚", OTHER: "📦",
};

export default function EditLostFoundScreen({ route, navigation }) {
  const { itemId } = route.params;

  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  const [type, setType]               = useState("LOST");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("OTHER");
  const [location, setLocation]       = useState("");
  const [date, setDate]               = useState("");
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [newPhoto, setNewPhoto]       = useState(null);   // { uri, type, name }

  useEffect(() => {
    lostFoundAPI.getItemById(itemId)
      .then(({ data }) => {
        setType(data.type ?? "LOST");
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setCategory(data.category ?? "OTHER");
        setLocation(data.location ?? "");
        setDate(data.dateLostFound ? new Date(data.dateLostFound).toISOString().slice(0, 10) : "");
        setExistingPhoto(data.imageUrl ?? null);
      })
      .catch(() => { Alert.alert("Error", "Could not load item."); navigation.goBack(); })
      .finally(() => setLoading(false));
  }, [itemId]);

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
      setNewPhoto({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim())    return Alert.alert("Validation", "Title is required.");
    if (!location.trim()) return Alert.alert("Validation", "Location is required.");
    if (!date.trim())     return Alert.alert("Validation", "Date is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return Alert.alert("Validation", "Date must be YYYY-MM-DD.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("location", location.trim());
      formData.append("dateLostFound", date);
      if (newPhoto) {
        formData.append("photo", {
          uri: newPhoto.uri,
          type: newPhoto.type,
          name: newPhoto.name,
        });
      }
      await lostFoundAPI.updateItem(itemId, formData);
      Alert.alert("Updated!", "Your listing has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Could not update listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const displayPhoto = newPhoto?.uri ?? existingPhoto;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>Edit Listing</Text>
        </View>

        {/* Type toggle */}
        <Field label="Type *">
          <View style={{ flexDirection: "row", gap: 10 }}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t} onPress={() => setType(t)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                  backgroundColor: type === t
                    ? (t === "LOST" ? "#fee2e2" : "#dcfce7")
                    : "#fff",
                  borderWidth: 1,
                  borderColor: type === t
                    ? (t === "LOST" ? "#ef4444" : "#22c55e")
                    : "#e2e8f0",
                }}
              >
                <Text style={{
                  fontWeight: "700", fontSize: 14,
                  color: type === t
                    ? (t === "LOST" ? "#ef4444" : "#22c55e")
                    : "#94a3b8",
                }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {/* Title */}
        <Field label="Title *">
          <TextInput value={title} onChangeText={setTitle} style={inputStyle} />
        </Field>

        {/* Category */}
        <Field label="Category *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c} onPress={() => setCategory(c)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: category === c ? "#0ea5e9" : "#fff",
                    borderWidth: 1, borderColor: category === c ? "#0ea5e9" : "#e2e8f0",
                    flexDirection: "row", alignItems: "center", gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{CATEGORY_ICONS[c]}</Text>
                  <Text style={{
                    fontSize: 12, fontWeight: "600",
                    color: category === c ? "#fff" : "#64748b",
                  }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        {/* Description */}
        <Field label="Description">
          <TextInput
            value={description} onChangeText={setDescription}
            multiline numberOfLines={4}
            style={[inputStyle, { height: 90, textAlignVertical: "top" }]}
          />
        </Field>

        {/* Location */}
        <Field label="Location *">
          <TextInput value={location} onChangeText={setLocation} style={inputStyle} />
        </Field>

        {/* Date */}
        <Field label="Date Lost/Found * (YYYY-MM-DD)">
          <TextInput value={date} onChangeText={setDate} style={inputStyle} />
        </Field>

        {/* Photo */}
        <Field label="Photo">
          {displayPhoto ? (
            <View style={{ marginBottom: 8 }}>
              <Image
                source={{ uri: displayPhoto }}
                style={{ width: "100%", height: 180, borderRadius: 12 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={pickImage}
                style={{ marginTop: 8, alignSelf: "flex-start" }}
              >
                <Text style={{ color: "#0ea5e9", fontSize: 13, fontWeight: "600" }}>Change photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              style={{
                borderWidth: 1.5, borderColor: "#cbd5e1", borderStyle: "dashed",
                borderRadius: 12, paddingVertical: 28, alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>📷</Text>
              <Text style={{ color: "#94a3b8", fontSize: 13 }}>Tap to add a photo</Text>
            </TouchableOpacity>
          )}
        </Field>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSave} disabled={submitting}
          style={{
            backgroundColor: "#0ea5e9", borderRadius: 12,
            paddingVertical: 14, alignItems: "center", marginTop: 8,
          }}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#fff",
  borderWidth: 0.5,
  borderColor: "#e2e8f0",
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 14,
  color: "#0f172a",
};
