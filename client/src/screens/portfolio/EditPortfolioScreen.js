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

export default function EditPortfolioScreen({ route, navigation }) {
  const { portfolio } = route.params;

  const [headline, setHeadline] = useState(portfolio?.headline ?? "");
  const [bio, setBio] = useState(portfolio?.bio ?? "");
  const [skills, setSkills] = useState((portfolio?.skills ?? []).join(", "));
  const [linkedIn, setLinkedIn] = useState(portfolio?.linkedIn ?? "");
  const [gitHub, setGitHub] = useState(portfolio?.gitHub ?? "");
  const [website, setWebsite] = useState(portfolio?.website ?? "");
  const [isPublic, setIsPublic] = useState(portfolio?.isPublic ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        headline: headline.trim(),
        bio: bio.trim(),
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        linkedIn: linkedIn.trim(),
        gitHub: gitHub.trim(),
        website: website.trim(),
        isPublic,
      };
      await portfolioAPI.updateMyPortfolio(payload);
      Alert.alert("Saved!", "Portfolio profile updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not save profile.",
      );
    } finally {
      setSaving(false);
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
            Edit Portfolio Profile
          </Text>
        </View>

        <Field label="Headline">
          <TextInput
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. Software Engineering Student | React Native Dev"
            style={inputStyle}
          />
        </Field>

        <Field label="Bio">
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="A short paragraph about yourself..."
            multiline
            numberOfLines={4}
            style={[inputStyle, { height: 90, textAlignVertical: "top" }]}
          />
        </Field>

        <Field label="Skills (comma-separated)">
          <TextInput
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g. React Native, Node.js, MongoDB"
            style={inputStyle}
          />
        </Field>

        <Field label="LinkedIn URL">
          <TextInput
            value={linkedIn}
            onChangeText={setLinkedIn}
            placeholder="https://linkedin.com/in/..."
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="GitHub URL">
          <TextInput
            value={gitHub}
            onChangeText={setGitHub}
            placeholder="https://github.com/..."
            style={inputStyle}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Personal Website">
          <TextInput
            value={website}
            onChangeText={setWebsite}
            placeholder="https://..."
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
            Public profile
          </Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: "#0ea5e9" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#0ea5e9",
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
              Save Profile
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
