import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app start
    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          const { data } = await authAPI.getProfile();
          setUser(data);
        }
      } catch {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    setUser(data);
  };

  const register = async (firstName, lastName, email, password) => {
    const { data } = await authAPI.register({
      firstName,
      lastName,
      email,
      password,
    });
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    setUser(data);
  };

  const logout = async () => {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    await authAPI.logout(refreshToken).catch(() => {});
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
    } catch {}
  };

  // Helper to check if user has staff or admin role
  const isStaffOrAdmin =
    user?.role?.includes("STAFF") ||
    user?.role?.includes("ADMIN") ||
    user?.role?.includes("REP") ||
    false;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, isStaffOrAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
