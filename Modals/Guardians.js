const mongoose = require("mongoose");

const guardianSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  full_name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  alternate_phone: {
    type: String,
    required: true,
  },
  image_: {
    filename: String,
    contentType: String,
    image: Buffer,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create an OTP model
const Guardian = mongoose.model("Guardian", guardianSchema);

module.exports = Guardian;
