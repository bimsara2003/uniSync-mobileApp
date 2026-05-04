import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { portfolioAPI } from "../../api/portfolio";

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
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        organization: organization.trim(),
        startDate: startDate || undefined,
        endDate: isOngoing ? undefined : endDate || undefined,
        isOngoing,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        githubLink: githubLink.trim(),
        liveLink: liveLink.trim(),
      };
      await portfolioAPI.createItem(payload);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
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
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
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
                    backgroundColor: type === t ? "#0ea5e9" : "#fff",
                    borderWidth: 1,
                    borderColor: type === t ? "#0ea5e9" : "#e2e8f0",
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
            trackColor={{ true: "#0ea5e9" }}
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
            backgroundColor: "#0ea5e9",
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
