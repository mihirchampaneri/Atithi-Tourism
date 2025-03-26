require('dotenv').config();

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const bookingModel = require("../models/booking-model");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    let {
      image, // Path or URL of the image
      name,
      price,
      age,
      person,
      contact,
      dob,
      checkinDate,
      checkoutDate,
      tour,
      hotels,
      upi,
    } = req.body;

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: price * 100, // Amount in cents
    //   currency: "inr",
    //   payment_method_types: ["card"],
    //   metadata: { name, tour, hotels },
    // });

    let booking = await bookingModel.create({
      image: req.file.buffer,
      name,
      price,
      age,
      person,
      contact,
      dob,
      checkinDate,
      checkoutDate,
      tour, 
      hotels,
      upi,
    });
    // res.json({ success: true, clientSecret: paymentIntent.client_secret });
    req.flash("success", "Your Booking has been completed successfully.");
    res.redirect("/shop");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
