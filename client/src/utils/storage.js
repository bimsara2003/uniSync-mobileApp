import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const getStorageItem = async (key) => {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

export const setStorageItem = async (key, value) => {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch {}
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  }
};

export const deleteStorageItem = async (key) => {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch {}
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }
};
