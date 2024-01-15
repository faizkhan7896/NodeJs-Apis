const mongoose = require("mongoose");

const kidsSchema = new mongoose.Schema({
    userId: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  class_no: {
    type: String,
    required: true,
  },
  kid_Id: {
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
const KIDS = mongoose.model("KIDS", kidsSchema);

module.exports = KIDS;
