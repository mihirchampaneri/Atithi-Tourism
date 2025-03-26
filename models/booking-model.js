const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const bookingSchema = new mongoose.Schema({
  image: Buffer,
  name: String,
  price: Number,
  age: Number,
  person: Number,
  contact: Number,
  dob: Date,
  checkoutDate: Date,
  checkinDate: Date,
  tour: String,
  hotels: String,
  upi: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("booking", bookingSchema);
