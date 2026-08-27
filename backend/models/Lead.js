const mongoose = require("mongoose");

// Every channel leads can come in from. Kept as an enum (rather than free
// text) so the frontend can show consistent filter buttons/badges.
const LEAD_SOURCES = [
  "Offline",
  "Instagram",
  "Facebook",
  "Twitter",
  "YouTube",
  "WhatsApp",
  "Call",
  "Other",
];

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    interestedIn: { type: String, trim: true }, // e.g. "Website + Google Ads"
    status: { type: String, enum: LEAD_STATUSES, default: "New" },
    notes: { type: String, trim: true },
    // Set once this lead is converted into an actual Customer record
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", phone: "text", email: "text" });

module.exports = mongoose.model("Lead", leadSchema);
module.exports.LEAD_SOURCES = LEAD_SOURCES;
module.exports.LEAD_STATUSES = LEAD_STATUSES;
