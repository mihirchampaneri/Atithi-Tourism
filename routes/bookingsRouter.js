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
        userID,
        price,
        age,
        person,
        contact,
        dob,
        checkinDate,
        checkoutDate,
        tour,
        hotels,
      } = req.body;

      let booking = await bookingModel.create({
        image: req.file.buffer,
        name,
        userId: req.user._id,
        price,
        age,
        person,
        contact,
        dob,
        checkinDate,
        checkoutDate,
        tour,
        hotels,
      });
      
      const session = await stripe.checkout.sessions.create({  
        payment_method_types: ["card"],
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Destination: ${tour}`,
                description: `Experience the magic of ${tour} while relaxing at the beautiful ${hotels}.`,
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

const PDFDocument = require("pdfkit");

router.get("/payment-success",isLoggedin, async function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");

  const user = await userModel.findById(req.user); 
  const booking = await bookingModel.findOne({ userId: req.user._id }).sort({ _id: -1 }); 

  try {
    // Send confirmation SMS
    let phoneno = `+91${booking.contact}`;

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    const checkin = formatDate(booking.checkinDate);
    const checkout = formatDate(booking.checkoutDate);

    await client.messages.create({
      body: `Hi ${booking.name}, your booking for ${booking.tour} from ${checkin} to ${checkout} has been confirmed! At ${booking.hotels}. Thank you for booking with us. -अतिथि Tourism`,
      from: process.env.TWILIO_PHONE,
      to: phoneno,
    });

    req.flash("success", "Your booking is confirmed!");
    res.render("payment-success", { booking, error, success });

  } catch (err) {
    console.error("Error:", err.message);
    req.flash("error", "Something went wrong during confirmation.");
    res.redirect("/bookings/mybooking");
  }
});

router.get("/download-ticket/:id", isLoggedin, async (req, res) => {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/mybooking");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-disposition", "attachment; filename=ticket.pdf");
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // Format dates
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
    };

    const checkin = formatDate(booking.checkinDate);
    const checkout = formatDate(booking.checkoutDate);

    // Table layout
    const startX = 50;
    let y = 150;
    const boxHeight = 30;
    const labelWidth = 150;
    const valueWidth = 350;
    const lineGap = 10;

    const drawRow = (label, value) => {
      doc
        .rect(startX, y, labelWidth, boxHeight).stroke()
        .rect(startX + labelWidth, y, valueWidth, boxHeight).stroke()
        .fontSize(12).fillColor('black')
        .text(label, startX + 10, y + 8)
        .text(value, startX + labelWidth + 10, y + 8);
      y += boxHeight + lineGap;
    };

    doc.fontSize(22).fillColor('#333').text("Atithi Tourism - Booking Ticket", { align: "center" }).moveDown(2);
    drawRow("Name", booking.name);
    drawRow("Booking ID", booking._id.toString());
    drawRow("Trip", booking.tour);
    drawRow("Hotel", booking.hotels);
    drawRow("Check-in", checkin);
    drawRow("Check-out", checkout);
    drawRow("Persons", booking.person);
    drawRow("Contact", booking.contact);
    drawRow("Price", booking.price);
    doc.moveDown(2).fontSize(10).fillColor("gray").text("Thank you for booking with Atithi Tourism.", { align: "center" });

    doc.end();

  } catch (err) {
    console.error("PDF Error:", err.message);
    req.flash("error", "Failed to generate ticket.");
  }
});


// router.get("/payment-success", async function (req, res) {
//   let error = req.flash("error");
//   let success = req.flash("success");

//   const user = await userModel.findById(req.user); 

//   // You can also fetch last booking if needed
//   const booking = await bookingModel.findOne({}).sort({ _id: -1 }); 

//   try {
//     let phone = booking.contact;
//     let phoneno = `+91${phone}`;

//     function formatDate(dateStr) {
//       const date = new Date(dateStr);
//       const day = String(date.getDate()).padStart(2, "0"); 
//       const month = String(date.getMonth() + 1).padStart(2, "0"); 
//       const year = date.getFullYear();
//       return `${day}-${month}-${year}`;
//     }

//     const checkin = formatDate(booking.checkinDate);
//     const checkout = formatDate(booking.checkoutDate);

//     const message = await client.messages.create({
//       body: `Hi ${booking.name}, your booking for ${booking.tour} from ${checkin} to ${checkout} has been confirmed! At ${booking.hotels}. Thank you for booking with us. -अतिथि Tourism`,
//       from: process.env.TWILIO_PHONE,
//       to: phoneno,
//     });   

//     console.log("SMS sent: ", message.sid);
//   } catch (err) {
//     console.error("Twilio SMS error:", err.message);
//   }

//   req.flash("success", "Your Booking has been completed successfully.");
//   res.render("payment-success", { error, success });
// });

router.get("/payment-cancel", function (req, res) {
  let error = req.flash("error");
  res.render("payment-cancel", { error });
});

router.get('/mybooking', isLoggedin, async (req, res) => {
  try {
    let error = req.flash("error");
    let success = req.flash("success");
    const bookings = await bookingModel.find({ userId: req.user._id });
    res.render('mybookings', { bookings,success,error });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

router.delete('/mybooking/:id', isLoggedin, async (req, res) => {
  try {
    const result = await bookingModel.findByIdAndDelete(req.params.id);
    if (result) {
      req.flash("success", "Booking deleted successfully");
      res.redirect("/bookings/mybooking");
    } else {
      res.status(404).send('Booking not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
