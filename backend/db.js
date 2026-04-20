/**
 * db.js — MongoDB connection utility using Mongoose.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState >= 1) {
    return; // Already connected — skip reconnection
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure code — app cannot run without DB
  }
};

module.exports = connectDB;
