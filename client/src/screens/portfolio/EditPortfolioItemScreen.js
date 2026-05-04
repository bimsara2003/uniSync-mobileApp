import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { portfolioAPI } from "../../api/portfolio";
import { Ionicons } from '@expo/vector-icons';

const TYPES = [
  "PROJECT",
  "ACHIEVEMENT",
  "CERTIFICATION",
  "EXPERIENCE",
  "EXTRACURRICULAR",
];

export default function EditPortfolioItemScreen({ route, navigation }) {
  const { itemId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("PROJECT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [tags, setTags] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  useEffect(() => {
    portfolioAPI
      .getItemById(itemId)
      .then(({ data }) => {
        setType(data.type ?? "PROJECT");
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setOrganization(data.organization ?? "");
        setStartDate(
          data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 10)
            : "",
        );
        setEndDate(
          data.endDate ? new Date(data.endDate).toISOString().slice(0, 10) : "",
        );
        setIsOngoing(data.isOngoing ?? false);
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setGithubLink(data.githubLink ?? "");
        setLiveLink(data.liveLink ?? "");
        setIsVisible(data.isVisible ?? true);
        setCurrentImageUrl(data.imageUrl ?? null);
      })
      .catch(() => {
        Alert.alert("Error", "Could not load item.");
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("organization", organization.trim());
      if (startDate) formData.append("startDate", startDate);
      if (!isOngoing && endDate) formData.append("endDate", endDate);
      formData.append("isOngoing", isOngoing);
      formData.append("tags", JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean)));
      formData.append("githubLink", githubLink.trim());
      formData.append("liveLink", liveLink.trim());
      formData.append("isVisible", isVisible);

      if (image) {
        const uri = image.uri;
        const name = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri, name, type });
      }

      await portfolioAPI.updateItem(itemId, formData);
      Alert.alert("Saved!", "Item updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not update item.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1a3c6e" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>
            Edit Portfolio Item
          </Text>
        </View>

        <Field label="Type *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: type === t ? "#1a3c6e" : "#fff",
                    borderWidth: 1,
                    borderColor: type === t ? "#1a3c6e" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: type === t ? "#fff" : "#64748b",
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="Title *">
          <TextInput value={title} onChangeText={setTitle} style={inputStyle} />
        </Field>

        <Field label="Organization / Institution">
          <TextInput
            value={organization}
            onChangeText={setOrganization}
            style={inputStyle}
          />
        </Field>

        <Field label="Item Image">
          <TouchableOpacity
            onPress={pickImage}
            style={{
              height: 150,
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderStyle: "dashed",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : currentImageUrl ? (
              <Image
                source={{ uri: currentImageUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📸</Text>
                <Text style={{ color: "#64748b", fontSize: 13 }}>
                  Tap to change image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Field>

        <Field label="Description">
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[inputStyle, { height: 90, textAlignVertical: "top" }]}
          />
        </Field>

        <Field label="Start Date (YYYY-MM-DD)">
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2025-09-01"
            style={inputStyle}
          />
        </Field>

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
          <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "500" }}>
            Currently Ongoing
          </Text>
          <Switch
            value={isOngoing}
            onValueChange={setIsOngoing}
            trackColor={{ true: "#1a3c6e" }}
          />
        </View>

        {!isOngoing && (
          <Field label="End Date (YYYY-MM-DD)">
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-05-01"
              style={inputStyle}
            />
          </Field>
        )}

        <Field label="Tags (comma-separated)">
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="React Native, Node.js"
            style={inputStyle}
          />
        </Field>

        <Field label="GitHub Link">
          <TextInput
            value={githubLink}
            onChangeText={setGithubLink}
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Live / Demo Link">
          <TextInput
            value={liveLink}
            onChangeText={setLiveLink}
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

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
          <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "500" }}>
            Visible on public portfolio
          </Text>
          <Switch
            value={isVisible}
            onValueChange={setIsVisible}
            trackColor={{ true: "#1a3c6e" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#1a3c6e",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
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
