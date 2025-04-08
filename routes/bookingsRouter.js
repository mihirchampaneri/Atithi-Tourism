require("dotenv").config();

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const bookingModel = require("../models/booking-model");
const userModel = require("../models/user-model");
const isLoggedin = require("../middlewares/isLoggedin");
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/create",
  upload.single("image"),
  isLoggedin,
  async function (req, res) {
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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: req.user.email,
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
  }
);

router.get("/complete", async (req, res) => {
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  console.log(JSON.stringify(await result));
});

// router.get("/payment-success", function (req, res) {
//   let error = req.flash("error");
//   let success = req.flash('success');
//   req.flash("success", "Your Booking has been completed successfully.")
//   res.render("payment-success", { error, success });
// });

router.get("/payment-success", async function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");

  // Optional: Retrieve session or user if needed
  const user = await userModel.findById(req.user); // or use req.user

  // You can also fetch last booking if needed
  const booking = await bookingModel.findOne({}).sort({ _id: -1 }); // Latest booking

  try {
    let phone = booking.contact;
    let phoneno = `+91${phone}`;

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    const checkin = formatDate(booking.checkinDate);
    const checkout = formatDate(booking.checkoutDate);


    await client.messages.create({
      body: `Hi ${booking.name},<br> your booking for ${booking.tour} from ${checkin} to ${checkout} has been confirmed! At ${booking.hotels}.<br> Thank you for booking with us.`,
      from: process.env.TWILIO_PHONE,
      to: phoneno,
    });
    

    // const message = await client.messages.create({
    //   body: `Hi ${booking.name}, your booking for ${booking.tour} from ${booking.checkinDate} to ${booking.checkoutDate} has been confirmed! At ${booking.hotels} Thank you for booking with us.`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phoneno, // Make sure this is in +91... or international format
    // });

    console.log("SMS sent: ", message.sid);
  } catch (err) {
    console.error("Twilio SMS error:", err.message);
  }

  req.flash("success", "Your Booking has been completed successfully.");
  res.render("payment-success", { error, success });
});

router.get("/payment-cancel", function (req, res) {
  let error = req.flash("error");
  res.render("payment-cancel", { error });
});

module.exports = router;
