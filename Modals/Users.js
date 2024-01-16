const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: "999999", // Set the default value to '999999'
  },
  guardianName: {
    type: String,
    default: "", // Set the default value to '999999'
  },
  alternatePhone: {
    type: String,
    default: "", // Set the default value to '999999'
  },
  IdNumber: {
    type: String,
    default: "", // Set the default value to '999999'
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create an OTP model
const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
