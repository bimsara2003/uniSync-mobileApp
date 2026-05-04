import api from "./axiosInstance";

export const eventsAPI = {
  // GET /api/events?status=UPCOMING&category=ACADEMIC
  getAll: (params = {}) => api.get("/events", { params }),

  // GET /api/events/:id
  getById: (id) => api.get(`/events/${id}`),

  // POST /api/events  (REP / ADMIN)
  create: (data) => api.post("/events", data),

  // PUT /api/events/:id  (REP / ADMIN)
  update: (id, data) => api.put(`/events/${id}`, data),

  // DELETE /api/events/:id  (REP / ADMIN)
  remove: (id) => api.delete(`/events/${id}`),

  // PATCH /api/events/:id/status  (REP / ADMIN)
  updateStatus: (id, status) =>
    api.patch(`/events/${id}/status`, { status }),

  // ── Registrations ──────────────────────────────────────────
  // GET  /api/events/:id/registrations/me  → { status: "CONFIRMED" | "CANCELED" | null }
  getMyStatus: (id) => api.get(`/events/${id}/registrations/me`),

  // POST /api/events/:id/registrations
  register: (id) => api.post(`/events/${id}/registrations`),

  // DELETE /api/events/:id/registrations
  cancelRegistration: (id) => api.delete(`/events/${id}/registrations`),

  // GET /api/events/:id/registrations  (REP / ADMIN)
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
};
