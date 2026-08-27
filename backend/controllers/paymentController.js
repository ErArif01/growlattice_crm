const Payment = require("../models/Payment");

// GET /api/payments?customer=<id>
async function getPayments(req, res) {
  try {
    const { customer } = req.query;
    const query = {};
    if (customer) query.customer = customer;
    const payments = await Payment.find(query).populate("customer", "name phone").sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
}

// GET /api/payments/:id
async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id).populate("customer", "name phone email");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment", error: error.message });
  }
}

// POST /api/payments
// Body: { customer, project, totalAmount, paymentType: "One-Time" | "Installments",
//         installments: [{ label, amount, dueDate }, ...] }
// For "One-Time" payments the frontend still sends a single-item installments
// array (one due date) - this keeps the reminder-notification logic identical
// for both payment types instead of needing two separate code paths.
async function createPayment(req, res) {
  try {
    const { customer, project, totalAmount, paymentType, installments, notes } = req.body;

    if (!customer || !totalAmount || !paymentType) {
      return res.status(400).json({ message: "customer, totalAmount and paymentType are required" });
    }
    if (!Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({ message: "At least one installment/due date is required" });
    }

    const installmentSum = installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
    if (Math.abs(installmentSum - Number(totalAmount)) > 0.01) {
      return res
        .status(400)
        .json({ message: `Installment amounts (${installmentSum}) must add up to totalAmount (${totalAmount})` });
    }

    const payment = await Payment.create({
      customer,
      project: project || null,
      totalAmount,
      paymentType,
      installments,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: "Failed to create payment", error: error.message });
  }
}

// PUT /api/payments/:id - edit top-level payment details (notes, totalAmount, etc.)
async function updatePayment(req, res) {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: "Failed to update payment", error: error.message });
  }
}

// DELETE /api/payments/:id
async function deletePayment(req, res) {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error: error.message });
  }
}

// PATCH /api/payments/:paymentId/installments/:installmentId/mark-paid
// Body: { paidAmount, paidDate } - marks one specific installment as paid.
// This is the action the frontend calls when staff record that a customer's
// monthly/one-time payment actually came in.
async function markInstallmentPaid(req, res) {
  try {
    const { paymentId, installmentId } = req.params;
    const { paidAmount, paidDate } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const installment = payment.installments.id(installmentId);
    if (!installment) return res.status(404).json({ message: "Installment not found" });

    installment.status = "Paid";
    installment.paidDate = paidDate ? new Date(paidDate) : new Date();
    installment.paidAmount = paidAmount != null ? paidAmount : installment.amount;

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: "Failed to mark installment as paid", error: error.message });
  }
}

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  markInstallmentPaid,
};
