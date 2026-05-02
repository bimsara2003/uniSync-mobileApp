const Faculty = require("../../models/facultyModel");
const Department = require("../../models/departmentModel");
const Module = require("../../models/moduleModel");

const createDepartment = async (req, res) => {
  try {
    const { name, faculty, description } = req.body;

    const facultyExists = await Faculty.findById(faculty);
    if (!facultyExists) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const department = await Department.create({ name, faculty, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.faculty) {
      filter.faculty = req.query.faculty;
    }
    const departments = await Department.find(filter)
      .populate("faculty", "name")
      .sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "faculty",
      "name",
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, faculty, description } = req.body;

    if (faculty) {
      const facultyExists = await Faculty.findById(faculty);
      if (!facultyExists) {
        return res.status(404).json({ message: "Faculty not found" });
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, faculty, description },
      { new: true, runValidators: true },
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const moduleCount = await Module.countDocuments({
      department: req.params.id,
    });
    if (moduleCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete department with existing modules. Delete modules first.",
      });
    }

    await department.deleteOne();
    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
