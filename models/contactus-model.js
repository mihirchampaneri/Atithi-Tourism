const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travel");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);