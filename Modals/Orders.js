const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  kid_id: {
    type: String,
  },
  car_id: {
    type: String,
  },
  guardian_id: {
    type: String,
  },
  order_type: {
    type: String,
  },
  carrier_id: {
    type: String,
    default: "",
  },
  order_status: {
    type: String,
    default: "ACTIVE",
  },
  order_tracking: {
    type: String,
    default: "REQUEST",
  },
  lat: {
    type: String,
  },
  lng: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create an OTP model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
