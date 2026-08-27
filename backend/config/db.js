const mongoose = require("mongoose");

// Connects to MongoDB using the URI from .env. If this fails, the most common
// cause is that MongoDB isn't running locally yet - see README for setup steps.
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Make sure MongoDB is running and MONGO_URI in .env is correct.");
    process.exit(1);
  }
}

module.exports = connectDB;
