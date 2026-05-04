import { useState, useEffect } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView,
} from "react-native";
import { resourcesAPI } from "../../api/resources";

const CATEGORIES = [
  "LECTURE_NOTE", "PAST_PAPER", "PROJECT", "TEMPLATE", "SUMMARY", "OTHER",
];
const CATEGORY_LABELS = {
  LECTURE_NOTE: "Lecture Note", PAST_PAPER: "Past Paper", PROJECT: "Project",
  TEMPLATE: "Template", SUMMARY: "Summary", OTHER: "Other",
};

export default function EditResourceScreen({ route, navigation }) {
  const { resourceId } = route.params;

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]     = useState("LECTURE_NOTE");

  // Read-only info to display
  const [fileName, setFileName]     = useState("");
  const [moduleName, setModuleName] = useState("");

  useEffect(() => {
    resourcesAPI.getResourceById(resourceId)
      .then(({ data }) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setCategory(data.category ?? "LECTURE_NOTE");
        setFileName(data.fileUrl ? data.fileUrl.split("/").pop() : "");
        setModuleName(data.module ? `${data.module.code} — ${data.module.name}` : "");
      })
      .catch(() => { Alert.alert("Error", "Could not load resource."); navigation.goBack(); })
      .finally(() => setLoading(false));
  }, [resourceId]);

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Title is required.");

    setSaving(true);
    try {
      await resourcesAPI.updateResource(resourceId, {
        title: title.trim(),
        description: description.trim(),
        category,
      });
      Alert.alert("Updated!", "Resource updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Could not update resource.");
    } finally {
      setSaving(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 24, color: "#0ea5e9" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#0f172a" }}>Edit Resource</Text>
        </View>

        {/* Read-only file info */}
        {(fileName || moduleName) && (
          <View style={{
            backgroundColor: "#f1f5f9", borderRadius: 12, padding: 14, marginBottom: 20,
            borderWidth: 0.5, borderColor: "#e2e8f0",
          }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748b", marginBottom: 6 }}>
              ATTACHED FILE
            </Text>
            {fileName ? (
              <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "500" }} numberOfLines={1}>
                📎 {fileName}
              </Text>
            ) : null}
            {moduleName ? (
              <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                📘 {moduleName}
              </Text>
            ) : null}
            <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
              File and module cannot be changed after upload.
            </Text>
          </View>
        )}

        <Field label="Title *">
          <TextInput value={title} onChangeText={setTitle} style={inputStyle} />
        </Field>

        <Field label="Description">
          <TextInput
            value={description} onChangeText={setDescription}
            multiline numberOfLines={3}
            style={[inputStyle, { height: 80, textAlignVertical: "top" }]}
          />
        </Field>

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
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: category === c ? "#fff" : "#64748b" }}>
                    {CATEGORY_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <TouchableOpacity
          onPress={handleSave} disabled={saving}
          style={{
            backgroundColor: "#0ea5e9", borderRadius: 12,
            paddingVertical: 14, alignItems: "center", marginTop: 8,
          }}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
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
