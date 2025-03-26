const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const tripSchema = new mongoose.Schema({
  image: Buffer,
  name: String,
  price: Number,
  discount: {
    type: Number,
    default: 0,
  },
  bgcolor: String,
  panelcolor: String,
  textcolor: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  popularity: Number,
});

module.exports = mongoose.model("Trip", tripSchema);
