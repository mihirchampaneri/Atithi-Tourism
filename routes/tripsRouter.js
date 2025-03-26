const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const tripModel = require("../models/trip-model");

router.post("/create", upload.single("image"), async function (req, res) {
  try{let { image, name, price, discount, bgcolor, panelcolor, textcolor, popularity } =
    req.body;

  let trip = await tripModel.create({
    image: req.file.buffer,
    name,
    price,
    discount,
    bgcolor,
    panelcolor,
    textcolor,
    popularity,
  });
  req.flash('success','Trip created Successfully');
  res.redirect('/owners/admin/trip');}
  catch(err){
    res.status(500).send(err.message);}
});

module.exports = router;
