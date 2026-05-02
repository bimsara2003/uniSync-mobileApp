const Faculty = require("../../models/facultyModel");
const Department = require("../../models/departmentModel");

const createFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const faculty = await Faculty.create({ name, description });
    res.status(201).json(faculty);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Faculty already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ name: 1 });
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true },
    );
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const deptCount = await Department.countDocuments({
      faculty: req.params.id,
    });
    if (deptCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete faculty with existing departments. Delete departments first.",
      });
    }

    await faculty.deleteOne();
    res.status(200).json({ message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};
