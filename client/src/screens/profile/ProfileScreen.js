import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
      await authAPI.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refreshUser();
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not update profile");
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
      Alert.alert("Error", err.response?.data?.message || "Could not change password");
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
    Alert.alert(
      "Delete Account",
      "This action is permanent. Are you sure?",
      [
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
      ],
    );
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const roleLabel = (user?.role || ["STUDENT"]).join(", ");

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#fff", paddingTop: 56, paddingHorizontal: 20,
        paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
      }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#0f172a" }}>
          My Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.7}>
            {user?.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                style={{
                  width: 90, height: 90, borderRadius: 45,
                  backgroundColor: "#f1f5f9",
                }}
              />
            ) : (
              <View style={{
                width: 90, height: 90, borderRadius: 45,
                backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 30, fontWeight: "700", color: "#0284c7" }}>
                  {initials}
                </Text>
              </View>
            )}
            {uploadingPhoto && (
              <View style={{
                position: "absolute", width: 90, height: 90, borderRadius: 45,
                backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
              }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            Tap to change photo
          </Text>
          {user?.profilePictureUrl && (
            <TouchableOpacity onPress={handleDeletePhoto}>
              <Text style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Remove photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Role badge */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View style={{
            backgroundColor: "#e0f2fe", borderRadius: 20,
            paddingHorizontal: 14, paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#0284c7" }}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 14, padding: 20,
          borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#0f172a" }}>
              Personal Info
            </Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={{ fontSize: 13, color: "#0ea5e9", fontWeight: "600" }}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setEditing(false); setFirstName(user?.firstName || ""); setLastName(user?.lastName || ""); }}>
                <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>First Name</Text>
          {editing ? (
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={{
                borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 10,
                fontSize: 14, color: "#0f172a", marginBottom: 14,
                backgroundColor: "#f8fafc",
              }}
            />
          ) : (
            <Text style={{ fontSize: 15, color: "#0f172a", marginBottom: 14 }}>{user?.firstName}</Text>
          )}

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Last Name</Text>
          {editing ? (
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={{
                borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 10,
                fontSize: 14, color: "#0f172a", marginBottom: 14,
                backgroundColor: "#f8fafc",
              }}
            />
          ) : (
            <Text style={{ fontSize: 15, color: "#0f172a", marginBottom: 14 }}>{user?.lastName}</Text>
          )}

          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Email</Text>
          <Text style={{ fontSize: 15, color: "#0f172a" }}>{user?.email}</Text>

          {editing && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: "#0ea5e9", borderRadius: 10,
                paddingVertical: 12, alignItems: "center", marginTop: 20,
              }}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Save Changes</Text>
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Change Password */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 14, padding: 20,
          borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 16,
        }}>
          <TouchableOpacity
            onPress={() => setShowPwSection(!showPwSection)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
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
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Current Password</Text>
              <TextInput
                value={currentPw}
                onChangeText={setCurrentPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10,
                  fontSize: 14, color: "#0f172a", marginBottom: 14, backgroundColor: "#f8fafc",
                }}
              />
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>New Password</Text>
              <TextInput
                value={newPw}
                onChangeText={setNewPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10,
                  fontSize: 14, color: "#0f172a", marginBottom: 14, backgroundColor: "#f8fafc",
                }}
              />
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Confirm New Password</Text>
              <TextInput
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry
                style={{
                  borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10,
                  fontSize: 14, color: "#0f172a", marginBottom: 14, backgroundColor: "#f8fafc",
                }}
              />
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPw}
                style={{
                  backgroundColor: "#0ea5e9", borderRadius: 10,
                  paddingVertical: 12, alignItems: "center",
                }}
              >
                {changingPw
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Update Password</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout + Delete */}
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: "#fff", borderRadius: 14, padding: 16,
            borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#0ea5e9" }}>
            Log Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            backgroundColor: "#fff", borderRadius: 14, padding: 16,
            borderWidth: 0.5, borderColor: "#fecaca", marginBottom: 40,
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
