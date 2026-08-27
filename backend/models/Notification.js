const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["PAYMENT_DUE_7_DAYS", "PAYMENT_DUE_1_DAY", "PAYMENT_OVERDUE"], required: true },
    message: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    installmentId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
