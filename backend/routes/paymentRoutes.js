const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  markInstallmentPaid,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getPayments).post(createPayment);
router.route("/:id").get(getPaymentById).put(updatePayment).delete(deletePayment);
router.patch("/:paymentId/installments/:installmentId/mark-paid", markInstallmentPaid);

module.exports = router;
