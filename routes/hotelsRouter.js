const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const hotelModel = require("../models/hotels-model");

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    let {
      image,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      rating,
      facility1,
      facility2,
      facility3,
    } = req.body;

    let hotel = await hotelModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      rating,
      facility1,
      facility2,
      facility3,
    });
    req.flash("success", "Hotel created Successfully");
    res.redirect("/owners/admin/hotel");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
