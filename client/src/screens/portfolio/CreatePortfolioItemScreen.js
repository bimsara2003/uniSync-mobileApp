import { useState } from "react";
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

export default function CreatePortfolioItemScreen({ navigation }) {
  const [type, setType] = useState("PROJECT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [tags, setTags] = useState(""); // comma-separated
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    setLoading(true);
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

      if (image) {
        const uri = image.uri;
        const name = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri, name, type });
      }

      await portfolioAPI.createItem(formData);
      Alert.alert("Added!", "Portfolio item added.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not create item.",
      );
    } finally {
      setLoading(false);
    }
  };

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
            Add Portfolio Item
          </Text>
        </View>

        {/* Type picker */}
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
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. UniSync Mobile App"
            style={inputStyle}
          />
        </Field>

        <Field label="Organization / Institution">
          <TextInput
            value={organization}
            onChangeText={setOrganization}
            placeholder="e.g. University of Kelaniya"
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
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📸</Text>
                <Text style={{ color: "#64748b", fontSize: 13 }}>
                  Tap to upload an image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Field>

        <Field label="Description">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this achievement or project..."
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

        {/* Ongoing toggle */}
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
            placeholder="e.g. React Native, Node.js, MongoDB"
            style={inputStyle}
          />
        </Field>

        <Field label="GitHub Link">
          <TextInput
            value={githubLink}
            onChangeText={setGithubLink}
            placeholder="https://github.com/..."
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Live / Demo Link">
          <TextInput
            value={liveLink}
            onChangeText={setLiveLink}
            placeholder="https://..."
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          style={{
            backgroundColor: "#1a3c6e",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Add Item
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
