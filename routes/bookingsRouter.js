require("dotenv").config();

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const bookingModel = require("../models/booking-model");
const userModel = require("../models/user-model");
const isLoggedin = require("../middlewares/isLoggedin");
const PDFDocument = require("pdfkit");
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create", upload.single("image"), isLoggedin, async function (req, res) {
  try {
    let {
      image,
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
  } catch (err) {
    res.status(500).send(err.message);
  }
}
);

router.get("/complete", isLoggedin, async (req, res) => {
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  console.log(JSON.stringify(await result));
});

router.get("/payment-success", isLoggedin, async function (req, res) {
  const user = await userModel.findById(req.user);
  const booking = await bookingModel
    .findOne({ userId: req.user._id })
    .sort({ _id: -1 });

  let error = req.flash("error");
  let success = req.flash("success");

  try {
    const phoneno = `+91${booking.contact}`;

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
  } catch (err) {
    console.error("SMS Error:", err.message);
    req.flash("error", "Message not sent");
  }
  error = req.flash("error");
  success = req.flash("success");
  res.render("payment-success", { booking, error, success });
});

router.get("/download-ticket/:id", isLoggedin, async (req, res) => {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings/mybooking");
    }

    const doc = new PDFDocument();
    res.setHeader("Content-disposition", "attachment; filename=Ticket.pdf");
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;
    };

    const checkin = formatDate(booking.checkinDate);
    const checkout = formatDate(booking.checkoutDate);

    const startX = 60;
    let y = 150;
    const labelWidth = 100;
    const valueWidth = 350;
    const rowHeight = 20;

    const drawRow = (label, value) => {
      doc
        .fontSize(12)
        .fillColor("black")
        .text(label, startX + 10, y + 8, {
          width: labelWidth,
          continued: false,
        })
        .text(value, startX + labelWidth + 20, y + 8, { width: valueWidth });
      y += rowHeight;
    };

    doc
      .fontSize(22)
      .fillColor("#2196F3")
      .text("Atithi Tourism - Booking Ticket", { align: "center" })
      .moveDown(2);

    doc.fillColor("#444444").fontSize(20).text("Invoice:", 50, 120);
    doc
      .moveTo(50, 100)
      .lineTo(550, 100)
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .stroke();

    drawRow("Name :", booking.name);
    drawRow("Contact :", booking.contact);
    drawRow("Age :", booking.age);

    y += 10;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .stroke();
    y += 10;

    doc.fillColor("#444444").fontSize(20).text("Details:", 50, y);
    y += 30;

    const detailLabels = [
      "Trip",
      "Hotel",
      "Check-in",
      "Check-out",
      "Persons",
      "Price",
    ];
    const detailValues = [
      booking.tour,
      booking.hotels,
      checkin,
      checkout,
      booking.person,
      booking.price,
    ];

    const columnWidth = 80;
    const cellHeight = 25;

    detailLabels.forEach((label, i) => {
      const x = startX + i * columnWidth;
      doc
        .strokeColor("#2196F3")
        .fillColor("#2196F3")
        .lineWidth(1)
        .rect(x, y, columnWidth, cellHeight)
        .fillAndStroke();

      doc
        .fillColor("white")
        .fontSize(12)
        .text(label, x + 5, y + 7, {
          width: columnWidth - 10,
          align: "center",
        });
    });

    y += cellHeight;
    detailValues.forEach((value, i) => {
      const x = startX + i * columnWidth;

      doc
        .rect(x, y, columnWidth, cellHeight)
        .strokeColor("#2196F3")
        .lineWidth(0.5)
        .stroke();

      doc
        .fillColor("black")
        .fontSize(10)
        .text(value, x + 5, y + 7, {
          width: columnWidth - 10,
          align: "center",
        });
    });

    y += cellHeight + 10;

    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor("gray")
      .text("Thank you for booking with Atithi Tourism.", 50, 700, {
        align: "center",
        width: 500,
      });

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err.message);
    req.flash("error", "Failed to generate ticket.");
  }
});

router.get("/payment-cancel", isLoggedin, function (req, res) {
  let error = req.flash("error");
  res.render("payment-cancel", { error });
});

router.get("/mybooking", isLoggedin, async (req, res) => {
  try {
    let error = req.flash("error");
    let success = req.flash("success");
    const bookings = await bookingModel.find({ userId: req.user._id });
    res.render("mybookings", { bookings, success, error });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

router.delete("/mybooking/:id", isLoggedin, async (req, res) => {
  try {
    const result = await bookingModel.findByIdAndDelete(req.params.id);
    if (result) {
      req.flash("success", "Booking deleted successfully");
      res.redirect("/bookings/mybooking");
    } else {
      res.status(404).send("Booking not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;