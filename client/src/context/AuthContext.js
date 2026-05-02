import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api/axiosInstance";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          const res = await api.get("/auth/profile");
          setUser(res.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("accessToken",  res.data.accessToken);
    await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);
    setUser(res.data);
  };

  const logout = async () => {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    await api.post("/auth/logout", { refreshToken }).catch(() => {});
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
  };

  const isStaffOrAdmin =
    user?.role?.includes("STAFF") || user?.role?.includes("ADMIN");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isStaffOrAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
