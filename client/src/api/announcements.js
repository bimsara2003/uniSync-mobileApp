import api from "./axiosInstance";

export const announcementsAPI = {
  // Get all announcements (optional params: { category, limit, sort })
  getAll: (params) => api.get("/announcements", { params }),

  // Get single announcement by ID
  getById: (id) => api.get(`/announcements/${id}`),

  // Create new announcement (multipart/form-data)
  create: (formData) =>
    api.post("/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update announcement (multipart/form-data)
  update: (id, formData) =>
    api.put(`/announcements/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Delete announcement
  remove: (id) => api.delete(`/announcements/${id}`),

  // Toggle pinned status
  togglePin: (id) => api.patch(`/announcements/${id}/pin`),

  // Delete a single attachment from an announcement
  deleteAttachment: (id, attachmentId) =>
    api.delete(`/announcements/${id}/attachments/${attachmentId}`),
};
