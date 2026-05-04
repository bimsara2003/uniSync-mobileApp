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
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventsAPI } from "../../api/events";
import api from "../../api/axiosInstance";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

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
  const [bannerUri, setBannerUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBannerUri(result.assets[0].uri);
    }
  };

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
      const res = await eventsAPI.create(payload);

      if (bannerUri) {
        console.log("Uploading banner for event:", res.data.event._id);
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
          const uploadUrl = `${api.defaults.baseURL}/events/${res.data.event._id}/banner`;
          
          console.log("Using fetch to upload to:", uploadUrl);
          
          const fetchResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json();
            throw new Error(errorData.message || "Upload failed");
          }

          console.log("Banner uploaded successfully via fetch");
        } catch (uploadError) {
          console.error("Banner upload failed:", uploadError.message);
          Alert.alert("Event Created", "Event was created but the banner upload failed: " + uploadError.message);
          return; 
        }
      }

      Alert.alert("Created!", "Event created successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || JSON.stringify(e.response?.data) || e.message || "Could not create event."
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
            Create Event
          </Text>
        </View>

        {/* Banner Upload */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            height: 160,
            backgroundColor: "#e2e8f0",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text style={{ color: "#64748b", fontWeight: "600" }}>+ Add Event Banner</Text>
          )}
        </TouchableOpacity>

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
                    backgroundColor: category === c ? "#0ea5e9" : "#fff",
                    borderWidth: 1,
                    borderColor: category === c ? "#0ea5e9" : "#e2e8f0",
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
            trackColor={{ true: "#0ea5e9" }}
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
