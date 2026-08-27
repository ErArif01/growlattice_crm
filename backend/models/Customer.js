const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    address: { type: String, trim: true },
    source: { type: String, trim: true }, // carried over from the Lead this came from, if any
    // If this customer started life as a Lead, this links back to it
    leadRef: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", phone: "text", email: "text", company: "text" });

module.exports = mongoose.model("Customer", customerSchema);
