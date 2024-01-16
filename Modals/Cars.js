const mongoose = require("mongoose");

const carsSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  plate_number: {
    type: String,
  },
  car_name: {
    type: String,
  },
  car_color: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create an OTP model
const Cars = mongoose.model("Cars", carsSchema);

module.exports = Cars;
