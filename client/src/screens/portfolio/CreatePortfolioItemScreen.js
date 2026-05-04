import { useState } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, Alert, SafeAreaView, Platform, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { portfolioAPI } from "../../api/portfolio";

const TYPES = ["PROJECT", "ACHIEVEMENT", "CERTIFICATION", "EXPERIENCE", "EXTRACURRICULAR"];

export default function CreatePortfolioItemScreen({ navigation }) {
  const [type, setType]               = useState("PROJECT");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate]     = useState("");   // YYYY-MM-DD
  const [endDate, setEndDate]         = useState("");
  const [isOngoing, setIsOngoing]     = useState(false);
  const [tags, setTags]               = useState("");   // comma-separated
  const [githubLink, setGithubLink]   = useState("");
  const [liveLink, setLiveLink]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [image, setImage]             = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert("Validation", "Please check the highlighted fields.");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("organization", organization.trim());
      if (startDate) formData.append("startDate", startDate);
      if (!isOngoing && endDate) formData.append("endDate", endDate);
      formData.append("isOngoing", String(isOngoing));
      
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));
      
      formData.append("githubLink", githubLink.trim());
      formData.append("liveLink", liveLink.trim());

      if (image) {
        if (Platform.OS === "web") {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append("image", blob, "item.jpg");
        } else {
          formData.append("image", {
            uri: image.uri,
            name: "item.jpg",
            type: "image/jpeg",
          });
        }
      }

      await portfolioAPI.createItem(formData);
      const successMsg = "✅ Item added successfully!";
      if (Platform.OS === "web") {
        window.alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert("Success", successMsg, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Could not create item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>Add Portfolio Item</Text>
        </View>

        {/* Type picker */}
        <Field label="Type *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t} onPress={() => setType(t)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: type === t ? "#0ea5e9" : "#fff",
                    borderWidth: 1, borderColor: type === t ? "#0ea5e9" : "#e2e8f0",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: type === t ? "#fff" : "#64748b" }}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="Title *" error={errors.title}>
          <TextInput 
            value={title} onChangeText={setTitle} 
            placeholder="e.g. UniSync Mobile App" 
            style={[inputStyle, errors.title && { borderColor: "#ef4444", borderWidth: 1.5 }]} 
          />
        </Field>

        {/* Image Upload */}
        <Field label="Item Image">
          <TouchableOpacity 
            onPress={pickImage}
            style={{
              backgroundColor: "#fff", height: 150, borderRadius: 12,
              borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "dashed",
              justifyContent: "center", alignItems: "center", overflow: "hidden"
            }}
          >
            {image ? (
              <Image source={{ uri: image.uri }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>🖼️</Text>
                <Text style={{ fontSize: 12, color: "#64748b" }}>Tap to upload an image</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onPress={() => setImage(null)} style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: "#ef4444", textAlign: "right" }}>Remove Image</Text>
            </TouchableOpacity>
          )}
        </Field>

        <Field label="Organization / Institution">
          <TextInput value={organization} onChangeText={setOrganization} placeholder="e.g. University of Kelaniya" style={inputStyle} />
        </Field>

        <Field label="Description *" error={errors.description}>
          <TextInput
            value={description} onChangeText={setDescription}
            placeholder="Describe this achievement or project..."
            multiline numberOfLines={4}
            maxLength={2000}
            style={[inputStyle, { height: 120, textAlignVertical: "top" }, errors.description && { borderColor: "#ef4444", borderWidth: 1.5 }]}
          />
          <Text style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>
            {description.length} / 2000 characters
          </Text>
        </Field>

        <Field label="Start Date (YYYY-MM-DD)">
          <TextInput value={startDate} onChangeText={setStartDate} placeholder="2025-09-01" style={inputStyle} />
        </Field>

        {/* Ongoing toggle */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "#fff", borderRadius: 10, padding: 14,
          borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
        }}>
          <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "500" }}>Currently Ongoing</Text>
          <Switch value={isOngoing} onValueChange={setIsOngoing} trackColor={{ true: "#0ea5e9" }} />
        </View>

        {!isOngoing && (
          <Field label="End Date (YYYY-MM-DD)">
            <TextInput value={endDate} onChangeText={setEndDate} placeholder="2026-05-01" style={inputStyle} />
          </Field>
        )}

        <Field label="Tags (comma-separated)">
          <TextInput
            value={tags} onChangeText={setTags}
            placeholder="e.g. React Native, Node.js, MongoDB"
            style={inputStyle}
          />
        </Field>

        <Field label="GitHub Link">
          <TextInput value={githubLink} onChangeText={setGithubLink} placeholder="https://github.com/..." style={inputStyle} autoCapitalize="none" />
        </Field>

        <Field label="Live / Demo Link">
          <TextInput value={liveLink} onChangeText={setLiveLink} placeholder="https://..." style={inputStyle} autoCapitalize="none" />
        </Field>

        <TouchableOpacity
          onPress={handleCreate} disabled={loading}
          style={{
            backgroundColor: "#0ea5e9", borderRadius: 12,
            paddingVertical: 14, alignItems: "center", marginTop: 8,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Add Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children, error }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>{label}</Text>
      {children}
      {error ? (
        <Text style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: "500" }}>{error}</Text>
      ) : null}
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
