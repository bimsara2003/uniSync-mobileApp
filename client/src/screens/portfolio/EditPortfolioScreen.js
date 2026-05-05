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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 0.5,
  borderColor: "#e2e8f0",
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: "#0f172a",
};

const predefinedSkills = [
  { name: "React Native", icon: "react" },
  { name: "Node.js", icon: "nodejs" },
  { name: "MongoDB", icon: "leaf" },
  { name: "Express", icon: "server-network" },
  { name: "Python", icon: "language-python" },
  { name: "Java", icon: "language-java" },
  { name: "C++", icon: "language-cpp" },
  { name: "C#", icon: "language-csharp" },
  { name: "JavaScript", icon: "language-javascript" },
  { name: "TypeScript", icon: "language-typescript" },
  { name: "HTML", icon: "language-html5" },
  { name: "CSS", icon: "language-css3" },
  { name: "SQL", icon: "database" },
  { name: "Git", icon: "git" },
  { name: "Docker", icon: "docker" },
  { name: "AWS", icon: "aws" },
  { name: "Firebase", icon: "firebase" },
];

export default function EditPortfolioScreen({ route, navigation }) {
  const { portfolio } = route.params;

  const [headline, setHeadline] = useState(portfolio?.headline ?? "");
  const [bio, setBio] = useState(portfolio?.bio ?? "");
  const [skills, setSkills] = useState(portfolio?.skills ?? []);
  const [customSkill, setCustomSkill] = useState("");
  const [linkedIn, setLinkedIn] = useState(portfolio?.linkedIn ?? "");
  const [gitHub, setGitHub] = useState(portfolio?.gitHub ?? "");
  const [website, setWebsite] = useState(portfolio?.website ?? "");
  const [isPublic, setIsPublic] = useState(portfolio?.isPublic ?? true);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill("");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("headline", headline.trim());
      formData.append("bio", bio.trim());
      formData.append("skills", JSON.stringify(skills));
      formData.append("linkedIn", linkedIn.trim());
      formData.append("gitHub", gitHub.trim());
      formData.append("website", website.trim());
      formData.append("isPublic", isPublic);

      if (image) {
        const uri = image.uri;
        const name = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri, name, type });
      }

      await portfolioAPI.updateMyPortfolio(formData);
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
            Edit Portfolio Profile
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : portfolio?.userId?.profilePictureUrl ? (
              <Image
                source={{ uri: portfolio.userId.profilePictureUrl }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#e2e8f0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#0ea5e9",
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>+</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Tap to change profile photo
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

        <Field label="Skills">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {predefinedSkills.map((skillItem) => {
              const isSelected = skills.includes(skillItem.name);
              return (
                <TouchableOpacity
                  key={skillItem.name}
                  onPress={() => toggleSkill(skillItem.name)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: isSelected ? "#1a3c6e" : "#e2e8f0",
                    borderWidth: 1,
                    borderColor: isSelected ? "#1a3c6e" : "#cbd5e1",
                  }}
                >
                  <MaterialCommunityIcons
                    name={skillItem.icon}
                    size={16}
                    color={isSelected ? "#fff" : "#475569"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: isSelected ? "#fff" : "#475569",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {skillItem.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {skills
              .filter((s) => !predefinedSkills.some((ps) => ps.name === s))
              .map((skill) => (
                <TouchableOpacity
                  key={skill}
                  onPress={() => toggleSkill(skill)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: "#1a3c6e",
                    borderWidth: 1,
                    borderColor: "#1a3c6e",
                  }}
                >
                  <MaterialCommunityIcons
                    name="code-tags"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "500",
                      marginRight: 4,
                    }}
                  >
                    {skill}
                  </Text>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={customSkill}
              onChangeText={setCustomSkill}
              placeholder="Add other skill..."
              style={[inputStyle, { flex: 1 }]}
              onSubmitEditing={addCustomSkill}
            />
            <TouchableOpacity
              onPress={addCustomSkill}
              style={{
                backgroundColor: "#0ea5e9",
                justifyContent: "center",
                paddingHorizontal: 16,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
            </TouchableOpacity>
          </View>
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
