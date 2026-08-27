// Run this once with: npm run seed
// Creates the first admin account (so you have something to log in with) and
// pre-fills the project-requirement dropdown with GrowLattice's common
// service types. Staff can still add more from the CRM itself later.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const RequirementOption = require("./models/RequirementOption");

const DEFAULT_REQUIREMENTS = [
  "Website Development",
  "Google Business Profile Setup",
  "Google Ads",
  "Instagram Ads",
  "Facebook Ads",
  "YouTube Ads",
  "Social Media Management",
  "Shopify Product Listing",
  "Amazon Product Listing",
  "Flipkart Product Listing",
  "SEO",
  "Logo & Branding",
];

async function seed() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@growlattice.com").toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`Admin account already exists (${adminEmail}) - skipping user creation.`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "ChangeThisPassword123!",
      role: "admin",
    });
    console.log(`Admin account created:`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || "ChangeThisPassword123!"}`);
  }

  let addedCount = 0;
  for (const name of DEFAULT_REQUIREMENTS) {
    const exists = await RequirementOption.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (!exists) {
      await RequirementOption.create({ name });
      addedCount += 1;
    }
  }
  console.log(`Requirement dropdown ready (${addedCount} new option(s) added).`);

  await mongoose.connection.close();
  console.log("Seed complete. You can now run: npm run dev");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
