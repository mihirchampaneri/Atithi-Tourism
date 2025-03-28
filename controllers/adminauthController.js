const ownersModel = require("../models/owners-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.loginOwner = async function (req, res) {
  let { email, password } = req.body;

  try {
    let owner = await ownersModel.findOne({ email: email });
    if (!owner) {
      req.flash("error", "No account found with that email.");
      return res.redirect("/owners");
    }
    bcrypt.compare(password, owner.password, function (err, result) {
      if (err) {
        req.flash("error", "An error occurred during authentication.");
        return res.redirect("/");
      }

      if (result) {
        let token = generateToken(owner);
        res.cookie("token", token);
        req.flash("success", "Welcome Admin! " +owner.fullname);
        res.redirect("admin");
      } else {
        req.flash("error", "Invalid Email or Password");
        res.redirect("/owners");
      }
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred. Please try again later.");
    res.redirect("/");
  }
};
