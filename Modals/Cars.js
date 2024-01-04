const mongoose = require("mongoose");

const carsSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  plate_number: {
    type: String,
    required: true,
  },
  car_color: {
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
const Cars = mongoose.model("Cars", carsSchema);

module.exports = Cars;
