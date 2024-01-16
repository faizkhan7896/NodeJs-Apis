const mongoose = require("mongoose");

const kidsSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String },
  age: { type: String },
  school: { type: String },
  class_no: { type: String },
  kid_Id: { type: String },
  // image_: { filename: String, contentType: String, image: Buffer },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create an OTP model
const KIDS = mongoose.model("KIDS", kidsSchema);

module.exports = KIDS;
