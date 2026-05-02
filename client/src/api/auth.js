import api from "./axiosInstance";

export const authAPI = {
  // Public auth
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),

  // Password (public)
  forgotPassword: (email) => api.post("/auth/forgotpassword", { email }),
  resetPassword: (otp, password) =>
    api.put("/auth/resetpassword", { otp, password }),

  // Profile (protected)
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  deleteProfile: () => api.delete("/auth/profile"),

  // Profile photo
  uploadProfilePhoto: (formData) =>
    api.post("/auth/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProfilePhoto: () => api.delete("/auth/profile/photo"),

  // Password (protected)
  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};
