import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Change this to your computer's local IP when testing on a phone
// Keep localhost for emulator
const BASE_URL = "http://192.168.8.214:5000/api";
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
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
                const refreshToken = await SecureStore.getItemAsync("refreshToken");
                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });
                const newToken = res.data.accessToken;
                await SecureStore.setItemAsync("accessToken", newToken);
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch {
                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("refreshToken");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
