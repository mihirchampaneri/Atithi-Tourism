const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: String,
  password: String,
  cart: { type: Array, default: [] },
  orders: { type: Array, default: [] },
  contact: Number,
  picture: String,
});

module.exports = mongoose.model("user", userSchema);
