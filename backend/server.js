require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { startPaymentReminderJob, checkPaymentReminders } = require("./jobs/paymentReminder");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const projectRoutes = require("./routes/projectRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// --- middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// --- routes ---
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Lets you trigger the reminder-notification check manually (useful for
// testing locally without waiting for 8 AM) - just call this endpoint once while logged in.
app.post("/api/dev/run-payment-check", require("./middleware/authMiddleware").protect, async (req, res) => {
  const count = await checkPaymentReminders();
  res.json({ message: `Reminder check complete, ${count} notification(s) created` });
});

// --- 404 + error handling ---
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`GrowLattice CRM API running on http://localhost:${PORT}`);
    startPaymentReminderJob();
  });
});
