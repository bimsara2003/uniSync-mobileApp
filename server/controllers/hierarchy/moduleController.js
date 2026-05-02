const Department = require("../../models/departmentModel");
const Module = require("../../models/moduleModel");

const createModule = async (req, res) => {
  try {
    const { name, code, department, yearOfStudy, semester, description } =
      req.body;

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" });
    }

    const module = await Module.create({
      name,
      code,
      department,
      yearOfStudy,
      semester,
      description,
    });
    res.status(201).json(module);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Module code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getModules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.yearOfStudy) filter.yearOfStudy = req.query.yearOfStudy;
    if (req.query.semester) filter.semester = req.query.semester;

    const modules = await Module.find(filter)
      .populate("department", "name")
      .sort({ code: 1 });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getModuleById = async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id).populate(
      "department",
      "name",
    );
    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.status(200).json(mod);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const { name, code, department, yearOfStudy, semester, description } =
      req.body;

    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: "Department not found" });
      }
    }

    const mod = await Module.findByIdAndUpdate(
      req.params.id,
      { name, code, department, yearOfStudy, semester, description },
      { new: true, runValidators: true },
    );
    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.status(200).json(mod);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Module code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) {
      return res.status(404).json({ message: "Module not found" });
    }
    await mod.deleteOne();
    res.status(200).json({ message: "Module deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
};
