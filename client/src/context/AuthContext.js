import React, { createContext, useContext, useEffect, useState } from "react";
import { getStorageItem, setStorageItem, deleteStorageItem } from "../utils/storage";
import { authAPI } from "../api/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app start
    const bootstrap = async () => {
      try {
        const token = await getStorageItem("accessToken");
        if (token) {
          const { data } = await authAPI.getProfile();
          setUser(data);
        }
      } catch {
        await deleteStorageItem("accessToken");
        await deleteStorageItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    await setStorageItem("accessToken", data.accessToken);
    await setStorageItem("refreshToken", data.refreshToken);
    setUser(data);
  };

  const register = async (firstName, lastName, email, password) => {
    const { data } = await authAPI.register({
      firstName,
      lastName,
      email,
      password,
    });
    await setStorageItem("accessToken", data.accessToken);
    await setStorageItem("refreshToken", data.refreshToken);
    setUser(data);
  };

  const logout = async () => {
    const refreshToken = await getStorageItem("refreshToken");
    await authAPI.logout(refreshToken).catch(() => {});
    await deleteStorageItem("accessToken");
    await deleteStorageItem("refreshToken");
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
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isStaffOrAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
