import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { eventsAPI } from "../../api/events";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const CAT_STYLE = {
  ACADEMIC: { bg: "#dbeafe", text: "#1a3c6e" },
  SPORTS: { bg: "#dcfce7", text: "#166534" },
  SOCIETY: { bg: "#f3e8ff", text: "#6b21a8" },
  CULTURAL: { bg: "#fef9c3", text: "#854d0e" },
  CAREER: { bg: "#ffedd5", text: "#9a3412" },
};

const STATUS_STYLE = {
  UPCOMING: { bg: "#dbeafe", text: "#1a3c6e" },
  ONGOING: { bg: "#dcfce7", text: "#166534" },
  COMPLETED: { bg: "#f1f5f9", text: "#475569" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
};

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const isRep = user?.role?.includes("REP") || user?.role?.includes("ADMIN");

  const [event, setEvent] = useState(null);
  const [myStatus, setMyStatus] = useState(null); // "CONFIRMED" | "CANCELED" | null
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [evRes, regRes] = await Promise.all([
        eventsAPI.getById(eventId),
        eventsAPI.getMyStatus(eventId).catch(() => null),
      ]);
      setEvent(evRes.data);
      setMyStatus(regRes?.data?.status ?? null);
    } catch {
      Alert.alert("Error", "Could not load event.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [eventId]),
  );

  const handleRegister = async () => {
    setRegLoading(true);
    try {
      await eventsAPI.register(eventId);
      setMyStatus("CONFIRMED");
      Alert.alert("Registered!", "You have been registered for this event.");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Could not register.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Registration",
      "Are you sure you want to cancel your registration?",
      [
        { text: "No" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setRegLoading(true);
            try {
              await eventsAPI.cancelRegistration(eventId);
              setMyStatus("CANCELED");
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.message || "Could not cancel.",
              );
            } finally {
              setRegLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Event", "This will permanently delete the event.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await eventsAPI.remove(eventId);
            navigation.goBack();
          } catch (e) {
            Alert.alert(
              "Error",
              e.response?.data?.message || "Could not delete.",
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a3c6e" />
      </View>
    );
  }

  if (!event) return null;

  const cat = CAT_STYLE[event.category] || { bg: "#f1f5f9", text: "#475569" };
  const status = STATUS_STYLE[event.status] || STATUS_STYLE.UPCOMING;
  const isUpcoming = event.status === "UPCOMING";
  const canRegister = event.requiresRegistration && isUpcoming;
  const isConfirmed = myStatus === "CONFIRMED";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      <ScrollView>
        {/* Banner */}
        {event.bannerImageUrl ? (
          <Image
            source={{ uri: event.bannerImageUrl }}
            style={{ width: "100%", height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 160,
              backgroundColor: "#dbeafe",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 60 }}>🎉</Text>
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 20,
            padding: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ padding: 20 }}>
          {/* Badges */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                backgroundColor: cat.bg,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: cat.text }}
              >
                {event.category}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: status.bg,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: status.text }}
              >
                {event.status}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            {event.title}
          </Text>

          {/* Info rows */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 0.5,
              borderColor: "#e2e8f0",
              gap: 10,
            }}
          >
            <InfoRow
              icon="📅"
              label="Date"
              value={new Date(event.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <InfoRow
              icon="⏰"
              label="Time"
              value={`${event.startTime} – ${event.endTime}`}
            />
            <InfoRow icon="📍" label="Venue" value={event.venue} />
            {event.capacity && (
              <InfoRow
                icon="👥"
                label="Capacity"
                value={`${event.registrationCount ?? 0} / ${event.capacity} registered`}
              />
            )}
            <InfoRow
              icon="👤"
              label="Organized by"
              value={`${event.createdBy?.firstName} ${event.createdBy?.lastName}`}
            />
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 15,
              color: "#374151",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            {event.description}
          </Text>

          {/* Registration button */}
          {canRegister && (
            <TouchableOpacity
              onPress={isConfirmed ? handleCancel : handleRegister}
              disabled={regLoading}
              style={{
                backgroundColor: isConfirmed ? "#fee2e2" : "#1a3c6e",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {regLoading ? (
                <ActivityIndicator color={isConfirmed ? "#991b1b" : "#fff"} />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: isConfirmed ? "#991b1b" : "#fff",
                  }}
                >
                  {isConfirmed ? "Cancel Registration" : "Register for Event"}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {!event.requiresRegistration && isUpcoming && (
            <View
              style={{
                backgroundColor: "#dcfce7",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#166534", fontWeight: "600" }}
              >
                ✅ No registration required — just show up!
              </Text>
            </View>
          )}

          {/* REP / Admin actions */}
          {isRep && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditEvent", { eventId: event._id })
                }
                style={{
                  flex: 1,
                  backgroundColor: "#f1f5f9",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#0f172a" }}>
                  ✏️ Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  flex: 1,
                  backgroundColor: "#fee2e2",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#991b1b" }}>
                  🗑 Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <Text style={{ fontSize: 16, width: 22 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "500" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
