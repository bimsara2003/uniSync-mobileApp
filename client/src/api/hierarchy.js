import api from "./axiosInstance";

export const hierarchyAPI = {
  getFaculties: () => api.get("/faculties"),
  getDepartments: (facultyId) =>
    api.get(facultyId ? `/departments?faculty=${facultyId}` : "/departments"),
  getModules: (departmentId) =>
    api.get(departmentId ? `/modules?department=${departmentId}` : "/modules"),
};
