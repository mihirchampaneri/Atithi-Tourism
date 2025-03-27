const express = require("express");
const router = express.Router();
const reviewModel = require("../models/review-model");


router.post("/create", async function (req, res) {
    try {
      let { 
        fullname,
        email,
        tour,
        rating,
        comments,
      } = req.body;

      let review = await reviewModel.create({
        fullname,
        email,
        tour,
        rating,
        comments,
      });
      req.flash("success", "Your review submitted successfully.");
      res.redirect("/shop");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  module.exports = router;