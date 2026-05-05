import api from "./axiosInstance";

export const resourcesAPI = {
  // Hierarchy
  getFaculties: () => api.get("/faculties"),
  getDepartments: (facultyId) =>
    api.get(`/departments${facultyId ? `?faculty=${facultyId}` : ""}`),
  getModules: (departmentId) =>
    api.get(`/modules${departmentId ? `?department=${departmentId}` : ""}`),

  // Resources CRUD
  getResources: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/resources${params ? `?${params}` : ""}`);
  },
  getResourceById: (id) => api.get(`/resources/${id}`),
  getDownloadUrl: (id) => api.get(`/resources/${id}/download`),
  createResource: (formData) =>
    api.post("/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),

  // Approval workflow
  getPendingResources: () => api.get("/resources/pending"),
  approveResource: (id) => api.put(`/resources/${id}/approve`),
  rejectResource: (id, rejectionReason) =>
    api.put(`/resources/${id}/reject`, { reason: rejectionReason }),

  // Bookmarks
  getBookmarks: () => api.get("/resources/bookmarks"),
  toggleBookmark: (id) => api.post(`/resources/${id}/bookmark`),
};
