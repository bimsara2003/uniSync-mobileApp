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
import { eventsAPI } from "../../api/events";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = ["ACADEMIC", "SPORTS", "SOCIETY", "CULTURAL", "CAREER"];

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(""); // HH:MM
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [requiresRegistration, setRequiresReg] = useState(false);
  const [capacity, setCapacity] = useState("");
  const [registrationDeadline, setRegDeadline] = useState(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!date.trim()) return "Date is required (YYYY-MM-DD)";
    if (!startTime.trim()) return "Start time is required (HH:MM)";
    if (!endTime.trim()) return "End time is required (HH:MM)";
    if (!venue.trim()) return "Venue is required";
    return null;
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Validation", err);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        requiresRegistration,
        capacity: capacity ? Number(capacity) : null,
        registrationDeadline: registrationDeadline || undefined,
      };
      await eventsAPI.create(payload);
      Alert.alert("Created!", "Event created successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not create event.",
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
            Create Event
          </Text>
        </View>

        <Field label="Title *">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Annual Sports Fest 2026"
            style={inputStyle}
          />
        </Field>

        <Field label="Description *">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the event..."
            multiline
            numberOfLines={4}
            style={[inputStyle, { height: 100, textAlignVertical: "top" }]}
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
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: category === c ? "#1a3c6e" : "#fff",
                    borderWidth: 1,
                    borderColor: category === c ? "#1a3c6e" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: category === c ? "#fff" : "#64748b",
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="Date * (YYYY-MM-DD)">
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-06-15"
            style={inputStyle}
          />
        </Field>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Start Time * (HH:MM)">
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                style={inputStyle}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="End Time * (HH:MM)">
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                style={inputStyle}
              />
            </Field>
          </View>
        </View>

        <Field label="Venue *">
          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="e.g. Main Hall, Block A"
            style={inputStyle}
          />
        </Field>

        {/* Registration toggle */}
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
            Requires Registration
          </Text>
          <Switch
            value={requiresRegistration}
            onValueChange={setRequiresReg}
            trackColor={{ true: "#1a3c6e" }}
          />
        </View>

        {requiresRegistration && (
          <>
            <Field label="Capacity (number of seats)">
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
                placeholder="e.g. 200"
                keyboardType="numeric"
                style={inputStyle}
              />
            </Field>

            <Field label="Registration Deadline (YYYY-MM-DD)">
              <TextInput
                value={registrationDeadline}
                onChangeText={setRegDeadline}
                placeholder="2026-06-10"
                style={inputStyle}
              />
            </Field>
          </>
        )}

        {/* Submit */}
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
              Create Event
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
