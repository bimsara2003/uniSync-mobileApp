import api from "./axiosInstance";

export const lostFoundAPI = {
  // Get items — optional filters: type (LOST|FOUND), category, status
  getItems: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/lost-found${params ? `?${params}` : ""}`);
  },

  getItemById: (id) => api.get(`/lost-found/${id}`),

  createItem: (formData) =>
    api.post("/lost-found", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateItem: (id, formData) =>
    api.put(`/lost-found/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  resolveItem: (id) => api.patch(`/lost-found/${id}/resolve`),

  deleteItem: (id) => api.delete(`/lost-found/${id}`),
};
