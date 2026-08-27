const mongoose = require("mongoose");

// This is the "add to dropdown if it's not already there" list the user asked
// for. It starts pre-seeded with GrowLattice's common service types (see
// seed.js) but staff can add new ones from the frontend at any time, and
// every new one becomes available immediately for every future project.
const requirementOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RequirementOption", requirementOptionSchema);
