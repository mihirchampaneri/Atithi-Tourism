require("dotenv").config();

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const bookingModel = require("../models/booking-model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: tour,
            },
            unit_amount: parseInt(price) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/bookings/payment-success",
      cancel_url: "http://localhost:3000/bookings/payment-cancel",
    });
    res.redirect(session.url);

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
    // req.flash("success", "Your Booking has been completed successfully.");
    // res.redirect("/shop");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/complete', async (req, res) => {
  const result = Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
      stripe.checkout.sessions.listLineItems(req.query.session_id)
  ])

  console.log(JSON.stringify(await result))

  res.send('Your payment was successful')
})

router.get("/payment-success", function (req, res) {
  let error = req.flash("error");
  res.render("payment-success", { error });
});

router.get("/payment-cancel", function (req, res) {
  let error = req.flash("error");
  res.render("payment-cancel", { error });
});

module.exports = router;
