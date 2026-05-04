import axiosInstance from "./axiosInstance";

export const adminAPI = {
  getAllUsers: () => axiosInstance.get("/admin/users"),
  deactivateUser: (id) => axiosInstance.put(`/admin/users/${id}/deactivate`),
  reactivateUser: (id) => axiosInstance.put(`/admin/users/${id}/reactivate`),
  updateUserRole: (id, role) =>
    axiosInstance.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
};
