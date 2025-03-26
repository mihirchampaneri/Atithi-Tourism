const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const ownerSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: String,
  password: String,
  trips: { type: Array, default: [] },
  picture: String,
  GSTIN: Number,
});

module.exports = mongoose.model("owner", ownerSchema);
