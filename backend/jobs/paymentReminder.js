const cron = require("node-cron");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// Zeroes out the time portion so date-math ("is this exactly 7 days away")
// isn't thrown off by the hour/minute the due date happens to be stored at.
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from, to) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

// The actual check: runs through every Payment with at least one Pending
// installment, and for each installment works out how many days remain.
//   - exactly 7 days left  -> create a "7 days left" notification (once)
//   - exactly 1 day left   -> create a "1 day left" notification (once)
//   - due date has passed  -> flip the installment's status to Overdue
// notified7Day/notified1Day flags stop the same reminder firing twice if the
// job runs more than once on the same day, or the server restarts.
async function checkPaymentReminders() {
  const today = new Date();
  const payments = await Payment.find({ "installments.status": "Pending" }).populate(
    "customer",
    "name phone"
  );

  let createdCount = 0;

  for (const payment of payments) {
    let paymentChanged = false;

    for (const installment of payment.installments) {
      if (installment.status !== "Pending") continue;

      const daysLeft = daysBetween(today, installment.dueDate);

      if (daysLeft < 0) {
        installment.status = "Overdue";
        paymentChanged = true;
        continue;
      }

      if (daysLeft === 7 && !installment.notified7Day) {
        await Notification.create({
          type: "PAYMENT_DUE_7_DAYS",
          message: `${payment.customer?.name || "A customer"}'s payment of ₹${installment.amount} (${
            installment.label
          }) is due in 7 days.`,
          customer: payment.customer?._id,
          payment: payment._id,
          installmentId: installment._id,
        });
        installment.notified7Day = true;
        paymentChanged = true;
        createdCount += 1;
      }

      if (daysLeft === 1 && !installment.notified1Day) {
        await Notification.create({
          type: "PAYMENT_DUE_1_DAY",
          message: `${payment.customer?.name || "A customer"}'s payment of ₹${installment.amount} (${
            installment.label
          }) is due tomorrow.`,
          customer: payment.customer?._id,
          payment: payment._id,
          installmentId: installment._id,
        });
        installment.notified1Day = true;
        paymentChanged = true;
        createdCount += 1;
      }
    }

    if (paymentChanged) await payment.save();
  }

  if (createdCount > 0) {
    console.log(`[payment-reminder] Created ${createdCount} new notification(s)`);
  }
  return createdCount;
}

// Runs automatically every day at 8:00 AM server time. Change the cron
// expression below if you want a different time - e.g. "0 9 * * *" for 9 AM.
function startPaymentReminderJob() {
  cron.schedule("0 8 * * *", () => {
    checkPaymentReminders().catch((err) =>
      console.error("[payment-reminder] Failed:", err.message)
    );
  });
  console.log("Payment reminder job scheduled (daily at 8:00 AM)");
}

module.exports = { startPaymentReminderJob, checkPaymentReminders };
