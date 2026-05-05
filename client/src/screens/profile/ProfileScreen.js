import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth";

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [saving, setSaving] = useState(false);

  // Change-password fields
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Name fields cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await authAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await refreshUser();
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }
    if (newPw.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setChangingPw(true);
    try {
      await authAPI.changePassword(currentPw, newPw);
      Alert.alert("Success", "Password changed");
      setShowPwSection(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not change password",
      );
    } finally {
      setChangingPw(false);
    }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    setUploadingPhoto(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("photo", {
        uri: asset.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
      await authAPI.uploadProfilePhoto(formData);
      await refreshUser();
    } catch (err) {
      Alert.alert("Error", "Could not upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = () => {
    Alert.alert("Remove Photo", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI.deleteProfilePhoto();
            await refreshUser();
          } catch {
            Alert.alert("Error", "Could not remove photo");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action is permanent. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI.deleteProfile();
            await logout();
          } catch {
            Alert.alert("Error", "Could not delete account");
          }
        },
      },
    ]);
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const roleLabel = (user?.role || ["STUDENT"]).join(", ");

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f9ff" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: "#e2e8f0",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>
          My Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={handlePickPhoto}
              activeOpacity={0.8}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#fff",
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              {user?.profilePictureUrl ? (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "#f1f5f9",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "#dbeafe",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: "#122a4f",
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
              {uploadingPhoto && (
                <View
                  style={{
                    position: "absolute",
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="#fff" size="large" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickPhoto}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#1a3c6e",
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#fff",
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              }}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              gap: 16,
            }}
          >
            {user?.profilePictureUrl && (
              <TouchableOpacity
                onPress={handleDeletePhoto}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  gap: 4,
                }}
              >
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
                <Text
                  style={{ fontSize: 13, color: "#ef4444", fontWeight: "500" }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Role badge */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: "#dbeafe",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#122a4f" }}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 20,
            borderWidth: 0.5,
            borderColor: "#e2e8f0",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a" }}>
              Personal Info
            </Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text
                  style={{ fontSize: 13, color: "#1a3c6e", fontWeight: "600" }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setFirstName(user?.firstName || "");
                  setLastName(user?.lastName || "");
                }}
              >
                <Text
                  style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            First Name
          </Text>
          {editing ? (
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={{
                borderWidth: 0.5,
                borderColor: "#cbd5e1",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 14,
                color: "#0f172a",
                marginBottom: 14,
                backgroundColor: "#f0f9ff",
              }}
            />
          ) : (
            <Text style={{ fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
              {user?.firstName}
            </Text>
          )}

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            Last Name
          </Text>
          {editing ? (
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={{
                borderWidth: 0.5,
                borderColor: "#cbd5e1",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 14,
                color: "#0f172a",
                marginBottom: 14,
                backgroundColor: "#f0f9ff",
              }}
            />
          ) : (
            <Text style={{ fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
              {user?.lastName}
            </Text>
          )}

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            Email
          </Text>
          <Text style={{ fontSize: 15, color: "#0f172a" }}>{user?.email}</Text>

          {editing && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: "#1a3c6e",
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Change Password */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 20,
            borderWidth: 0.5,
            borderColor: "#e2e8f0",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPwSection(!showPwSection)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a" }}>
              Change Password
            </Text>
            <Text style={{ fontSize: 18, color: "#94a3b8" }}>
              {showPwSection ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showPwSection && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Current Password
              </Text>
              <TextInput
                value={currentPw}
                onChangeText={setCurrentPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5,
                  borderColor: "#cbd5e1",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#0f172a",
                  marginBottom: 14,
                  backgroundColor: "#f0f9ff",
                }}
              />
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                New Password
              </Text>
              <TextInput
                value={newPw}
                onChangeText={setNewPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5,
                  borderColor: "#cbd5e1",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#0f172a",
                  marginBottom: 14,
                  backgroundColor: "#f0f9ff",
                }}
              />
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Confirm New Password
              </Text>
              <TextInput
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5,
                  borderColor: "#cbd5e1",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#0f172a",
                  marginBottom: 14,
                  backgroundColor: "#f0f9ff",
                }}
              />
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPw}
                style={{
                  backgroundColor: "#1a3c6e",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                {changingPw ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                  >
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout + Delete */}
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 16,
            borderWidth: 0.5,
            borderColor: "#e2e8f0",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a3c6e" }}>
            Log Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 16,
            borderWidth: 0.5,
            borderColor: "#fecaca",
            marginBottom: 40,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444" }}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
