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
  contact: Number,
  picture: String,
  otp: String,
  otpExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
});

module.exports = mongoose.model("user", userSchema);
