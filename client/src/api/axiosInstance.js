import axios from "axios";
import { getStorageItem, setStorageItem, deleteStorageItem } from "../utils/storage";

import { Platform } from "react-native";

// Change this to your computer's local IP when testing on a phone
const LOCAL_IP = "192.168.8.214";
const BASE_URL = Platform.OS === "web" 
  ? "http://localhost:5000/api" 
  : `http://${LOCAL_IP}:5000/api`;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
    const token = await getStorageItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = await getStorageItem("refreshToken");
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });
                const newToken = res.data.accessToken;
                await setStorageItem("accessToken", newToken);
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch {
                await deleteStorageItem("accessToken");
                await deleteStorageItem("refreshToken");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
