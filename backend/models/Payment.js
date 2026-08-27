const mongoose = require("mongoose");

const PAYMENT_TYPES = ["One-Time", "Installments"];
const INSTALLMENT_STATUSES = ["Pending", "Paid", "Overdue"];

// One-time payments are modeled as a single installment too - this keeps the
// due-date/notification logic in one place (the cron job in jobs/paymentReminder.js)
// instead of having two separate code paths for "one-time due date" vs "installment due date".
const installmentSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true }, // e.g. "Installment 1" or "Full Payment"
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: INSTALLMENT_STATUSES, default: "Pending" },
    paidDate: { type: Date, default: null },
    paidAmount: { type: Number, default: 0 },
    // Prevents the reminder cron from sending the same "7 days left" or
    // "1 day left" notification more than once for the same installment.
    notified7Day: { type: Boolean, default: false },
    notified1Day: { type: Boolean, default: false },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: PAYMENT_TYPES, required: true },
    installments: [installmentSchema],
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
module.exports.PAYMENT_TYPES = PAYMENT_TYPES;
module.exports.INSTALLMENT_STATUSES = INSTALLMENT_STATUSES;
