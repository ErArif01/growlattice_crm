const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const Payment = require("../models/Payment");

// GET /api/dashboard - the handful of numbers shown as cards on the homepage,
// plus a short list of upcoming payment due dates (next 7 days) so staff see
// what needs attention today without digging through every customer.
async function getDashboardSummary(req, res) {
  try {
    const [totalLeads, newLeads, totalCustomers, projectsInProcess, projectsCompleted] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "New" }),
      Customer.countDocuments(),
      Project.countDocuments({ status: "In Process" }),
      Project.countDocuments({ status: "Completed" }),
    ]);

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    const paymentsWithUpcomingDue = await Payment.find({
      "installments.status": "Pending",
      "installments.dueDate": { $gte: today, $lte: in7Days },
    })
      .populate("customer", "name phone")
      .sort({ "installments.dueDate": 1 })
      .limit(10);

    // Flatten to just the pending installments that actually fall in the
    // next 7 days (a Payment doc can have several installments; we only want the relevant ones)
    const upcomingDues = [];
    paymentsWithUpcomingDue.forEach((payment) => {
      payment.installments.forEach((inst) => {
        if (inst.status === "Pending" && inst.dueDate >= today && inst.dueDate <= in7Days) {
          upcomingDues.push({
            paymentId: payment._id,
            customer: payment.customer,
            label: inst.label,
            amount: inst.amount,
            dueDate: inst.dueDate,
          });
        }
      });
    });
    upcomingDues.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      totalLeads,
      newLeads,
      totalCustomers,
      projectsInProcess,
      projectsCompleted,
      upcomingDues: upcomingDues.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: error.message });
  }
}

module.exports = { getDashboardSummary };
