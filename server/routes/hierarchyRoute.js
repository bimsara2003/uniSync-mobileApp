const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/hierarchy/facultyController");
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/hierarchy/departmentController");
const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../controllers/hierarchy/moduleController");

// ─── FACULTY ROUTES (/api/faculties) ────────────────────
const facultyRouter = express.Router();
facultyRouter.get("/", getFaculties);
facultyRouter.get("/:id", getFacultyById);
facultyRouter.post("/", protect, admin, createFaculty);
facultyRouter.put("/:id", protect, admin, updateFaculty);
facultyRouter.delete("/:id", protect, admin, deleteFaculty);

// ─── DEPARTMENT ROUTES (/api/departments) ───────────────
const departmentRouter = express.Router();
departmentRouter.get("/", protect, getDepartments);
departmentRouter.get("/:id", protect, getDepartmentById);
departmentRouter.post("/", protect, admin, createDepartment);
departmentRouter.put("/:id", protect, admin, updateDepartment);
departmentRouter.delete("/:id", protect, admin, deleteDepartment);

// ─── MODULE ROUTES (/api/modules) ───────────────────────
const moduleRouter = express.Router();
moduleRouter.get("/", protect, getModules);
moduleRouter.get("/:id", protect, getModuleById);
moduleRouter.post("/", protect, admin, createModule);
moduleRouter.put("/:id", protect, admin, updateModule);
moduleRouter.delete("/:id", protect, admin, deleteModule);

module.exports = { facultyRouter, departmentRouter, moduleRouter };
