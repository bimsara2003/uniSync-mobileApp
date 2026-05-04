import { useEffect, useState } from "react";
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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventsAPI } from "../../api/events";
import { Ionicons } from '@expo/vector-icons';
import api from "../../api/axiosInstance";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

const CATEGORIES = ["ACADEMIC", "SPORTS", "SOCIETY", "CULTURAL", "CAREER"];
const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

export default function EditEventScreen({ route, navigation }) {
  const { eventId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [requiresRegistration, setRequiresReg] = useState(false);
  const [capacity, setCapacity] = useState("");
  const [registrationDeadline, setRegDeadline] = useState("");
  const [status, setStatus] = useState("UPCOMING");
  const [bannerUri, setBannerUri] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBannerUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    eventsAPI
      .getById(eventId)
      .then(({ data }) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setCategory(data.category ?? "ACADEMIC");
        setDate(data.date ? data.date.slice(0, 10) : "");
        setStartTime(data.startTime ?? "");
        setEndTime(data.endTime ?? "");
        setVenue(data.venue ?? "");
        setRequiresReg(data.requiresRegistration ?? false);
        setCapacity(data.capacity ? String(data.capacity) : "");
        setRegDeadline(
          data.registrationDeadline
            ? new Date(data.registrationDeadline).toISOString().slice(0, 10)
            : "",
        );
        setStatus(data.status ?? "UPCOMING");
        setBannerUri(data.bannerImageUrl ?? null);
      })
      .catch(() => {
        Alert.alert("Error", "Could not load event.");
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSave = async () => {
    if (!title.trim() || !date.trim() || !venue.trim()) {
      Alert.alert("Validation", "Title, date, and venue are required.");
      return;
    }
    setSaving(true);
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
        status,
      };
      await eventsAPI.update(eventId, payload);

      // Handle banner upload if changed
      if (bannerUri && !bannerUri.startsWith("http")) {
        console.log("Uploading new banner for event:", eventId);
        const formData = new FormData();
        const filename = bannerUri.split("/").pop();
        const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("photo", {
          uri: Platform.OS === "android" ? bannerUri : bannerUri.replace("file://", ""),
          name: filename,
          type,
        });

        try {
          const token = await SecureStore.getItemAsync("accessToken");
          const uploadUrl = `${api.defaults.baseURL}/events/${eventId}/banner`;
          
          await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          console.log("Banner updated successfully");
        } catch (uploadError) {
          console.error("Banner upload failed:", uploadError.message);
          Alert.alert("Warning", "Event updated, but banner upload failed.");
        }
      }

      Alert.alert("Saved!", "Event updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not update event.",
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
            Edit Event
          </Text>
        </View>

        {/* Banner Upload */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            height: 320,
            width: 240,
            alignSelf: "center",
            backgroundColor: "#e2e8f0",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: "#64748b", fontWeight: "600" }}>
              + Add Event Banner
            </Text>
          )}
        </TouchableOpacity>

        <Field label="Title *">
          <TextInput value={title} onChangeText={setTitle} style={inputStyle} />
        </Field>

        <Field label="Description *">
          <TextInput
            value={description}
            onChangeText={setDescription}
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

        <Field label="Status">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: status === s ? "#0f172a" : "#fff",
                    borderWidth: 1,
                    borderColor: status === s ? "#0f172a" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: status === s ? "#fff" : "#64748b",
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="Date (YYYY-MM-DD)">
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-06-15"
            style={inputStyle}
          />
        </Field>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Start Time (HH:MM)">
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                style={inputStyle}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="End Time (HH:MM)">
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="17:00"
                style={inputStyle}
              />
            </Field>
          </View>
        </View>

        <Field label="Venue">
          <TextInput value={venue} onChangeText={setVenue} style={inputStyle} />
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
            <Field label="Capacity">
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
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
