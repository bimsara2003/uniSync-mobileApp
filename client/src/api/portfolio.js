import api from "./axiosInstance";

export const portfolioAPI = {
  // Portfolio profile
  getMyPortfolio: () => api.get("/portfolio/me"),
  updateMyPortfolio: (data) =>
    api.put("/portfolio/me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getPortfolioByUserId: (userId) => api.get(`/portfolio/user/${userId}`),

  // Portfolio items
  getMyItems: (params = {}) => api.get("/portfolio/items", { params }),
  getItemById: (id) => api.get(`/portfolio/items/${id}`),
  createItem: (data) =>
    api.post("/portfolio/items", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateItem: (id, data) =>
    api.put(`/portfolio/items/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteItem: (id) => api.delete(`/portfolio/items/${id}`),
};
