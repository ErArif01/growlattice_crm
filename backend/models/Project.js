const mongoose = require("mongoose");

const PROJECT_STATUSES = ["In Process", "Completed", "On Hold"];

const projectSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    title: { type: String, required: true, trim: true }, // e.g. "GermanPurje Website Redesign"
    // Selected from RequirementOption (existing or newly-added) - what this
    // project actually consists of, e.g. ["Website", "Google Ads", "Instagram Ads"]
    requirements: [{ type: String, trim: true }],
    status: { type: String, enum: PROJECT_STATUSES, default: "In Process" },
    notes: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    completedDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Automatically stamp completedDate the moment status flips to Completed,
// and clear it if it's ever moved back out of Completed - keeps the two
// fields from silently drifting out of sync no matter which API call changed status.
projectSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "Completed" && !this.completedDate) {
      this.completedDate = new Date();
    } else if (this.status !== "Completed") {
      this.completedDate = null;
    }
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
module.exports.PROJECT_STATUSES = PROJECT_STATUSES;
