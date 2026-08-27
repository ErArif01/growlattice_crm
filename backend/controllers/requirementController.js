const RequirementOption = require("../models/RequirementOption");

// GET /api/requirements - list all options currently in the dropdown
async function getRequirementOptions(req, res) {
  try {
    const options = await RequirementOption.find().sort({ name: 1 });
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requirement options", error: error.message });
  }
}

// POST /api/requirements - "add to dropdown if it's not already there".
// If the name already exists (case-insensitive), just return the existing
// one instead of erroring, so the frontend can call this freely without
// first checking for duplicates itself.
async function createRequirementOption(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await RequirementOption.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) return res.status(200).json(existing);

    const option = await RequirementOption.create({ name: name.trim() });
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ message: "Failed to add requirement option", error: error.message });
  }
}

// DELETE /api/requirements/:id
async function deleteRequirementOption(req, res) {
  try {
    const option = await RequirementOption.findByIdAndDelete(req.params.id);
    if (!option) return res.status(404).json({ message: "Requirement option not found" });
    res.json({ message: "Requirement option deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete requirement option", error: error.message });
  }
}

module.exports = { getRequirementOptions, createRequirementOption, deleteRequirementOption };
