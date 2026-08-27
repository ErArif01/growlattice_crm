const Project = require("../models/Project");

// GET /api/projects?customer=<id>&status=
async function getProjects(req, res) {
  try {
    const { customer, status } = req.query;
    const query = {};
    if (customer) query.customer = customer;
    if (status) query.status = status;
    const projects = await Project.find(query).populate("customer", "name phone").sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
}

// GET /api/projects/:id
async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.id).populate("customer", "name phone email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
}

// POST /api/projects
async function createProject(req, res) {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: "Failed to create project", error: error.message });
  }
}

// PUT /api/projects/:id
async function updateProject(req, res) {
  try {
    // findById + save (not findByIdAndUpdate) so the pre("save") hook that
    // auto-stamps completedDate when status flips to "Completed" actually runs.
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    Object.assign(project, req.body);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: "Failed to update project", error: error.message });
  }
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
