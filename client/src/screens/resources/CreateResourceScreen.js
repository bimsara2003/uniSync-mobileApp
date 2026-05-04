import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { resourcesAPI } from "../../api/resources";

const CATEGORIES = [
  "LECTURE_NOTE",
  "PAST_PAPER",
  "PROJECT",
  "TEMPLATE",
  "SUMMARY",
  "OTHER",
];
const CATEGORY_LABELS = {
  LECTURE_NOTE: "Lecture Note",
  PAST_PAPER: "Past Paper",
  PROJECT: "Project",
  TEMPLATE: "Template",
  SUMMARY: "Summary",
  OTHER: "Other",
};

export default function CreateResourceScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("LECTURE_NOTE");

  // Hierarchy
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [file, setFile] = useState(null); // { uri, name, mimeType, size }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load faculties on mount
  useEffect(() => {
    resourcesAPI
      .getFaculties()
      .then(({ data }) => setFaculties(data))
      .catch(() => Alert.alert("Error", "Could not load faculties."))
      .finally(() => setLoading(false));
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (!facultyId) {
      setDepartments([]);
      setDepartmentId("");
      return;
    }
    resourcesAPI
      .getDepartments(facultyId)
      .then(({ data }) => setDepartments(data))
      .catch(() => Alert.alert("Error", "Could not load departments."));
    setDepartmentId("");
    setModuleId("");
    setModules([]);
  }, [facultyId]);

  // Load modules when department changes
  useEffect(() => {
    if (!departmentId) {
      setModules([]);
      setModuleId("");
      return;
    }
    resourcesAPI
      .getModules(departmentId)
      .then(({ data }) => setModules(data))
      .catch(() => Alert.alert("Error", "Could not load modules."));
    setModuleId("");
  }, [departmentId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/zip",
        "image/jpeg",
        "image/png",
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Title is required.");
    if (!facultyId)
      return Alert.alert("Validation", "Please select a faculty.");
    if (!departmentId)
      return Alert.alert("Validation", "Please select a department.");
    if (!moduleId) return Alert.alert("Validation", "Please select a module.");
    if (!file) return Alert.alert("Validation", "Please attach a file.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("faculty", facultyId);
      formData.append("department", departmentId);
      formData.append("module", moduleId);
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name,
      });
      await resourcesAPI.createResource(formData);
      Alert.alert("Uploaded!", "Resource submitted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not upload resource.",
      );
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
            Upload Resource
          </Text>
        </View>

        <Field label="Title *">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Data Structures Lecture Notes"
            style={inputStyle}
          />
        </Field>

        <Field label="Description">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the resource..."
            multiline
            numberOfLines={3}
            style={[inputStyle, { height: 80, textAlignVertical: "top" }]}
          />
        </Field>

        <Field label="Category *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: category === c ? "#0ea5e9" : "#fff",
                    borderWidth: 1,
                    borderColor: category === c ? "#0ea5e9" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: category === c ? "#fff" : "#64748b",
                    }}
                  >
                    {CATEGORY_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        {/* Faculty picker */}
        <Field label="Faculty *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {faculties.map((f) => (
                <TouchableOpacity
                  key={f._id}
                  onPress={() => setFacultyId(f._id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: facultyId === f._id ? "#0f172a" : "#fff",
                    borderWidth: 1,
                    borderColor: facultyId === f._id ? "#0f172a" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: facultyId === f._id ? "#fff" : "#64748b",
                    }}
                  >
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        {/* Department picker */}
        {departments.length > 0 && (
          <Field label="Department *">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {departments.map((d) => (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => setDepartmentId(d._id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        departmentId === d._id ? "#0f172a" : "#fff",
                      borderWidth: 1,
                      borderColor:
                        departmentId === d._id ? "#0f172a" : "#e2e8f0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: departmentId === d._id ? "#fff" : "#64748b",
                      }}
                    >
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Field>
        )}

        {/* Module picker */}
        {modules.length > 0 && (
          <Field label="Module *">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {modules.map((m) => (
                  <TouchableOpacity
                    key={m._id}
                    onPress={() => setModuleId(m._id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: moduleId === m._id ? "#0f172a" : "#fff",
                      borderWidth: 1,
                      borderColor: moduleId === m._id ? "#0f172a" : "#e2e8f0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: moduleId === m._id ? "#fff" : "#64748b",
                      }}
                    >
                      {m.code} — {m.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Field>
        )}

        {/* File picker */}
        <Field label="File * (PDF, DOC, PPT, ZIP, IMG)">
          <TouchableOpacity
            onPress={pickFile}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1.5,
              borderColor: file ? "#0ea5e9" : "#cbd5e1",
              borderStyle: file ? "solid" : "dashed",
              borderRadius: 12,
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            {file ? (
              <>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>📎</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#0ea5e9" }}
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  {(file.size / 1024).toFixed(1)} KB · Tap to change
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>📁</Text>
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                  Tap to attach a file
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Field>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: "#0ea5e9",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Upload Resource
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
