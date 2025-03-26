const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const reviewSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  tour: String,
  rating:Number,
  comments:String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("review", reviewSchema);
