const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owners-model"); // Add owner model

module.exports = async function (req, res, next) {
  if (!req.cookies.token) {
    req.flash("error", "You need to log in first.");
    return res.redirect("/");
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    //  Try finding the user in both collections
    let user = await userModel.findById(decoded.id).select("-password");
    let owner = await ownerModel.findById(decoded.id).select("-password");

    if (!user && !owner) {
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/");
    }

    req.user = user || owner;
    req.session.userId = (user || owner)._id; 
    req.session.userRole = user ? "user" : "owner"; 

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    req.flash("error", "Authentication failed. Please log in again.");
    res.redirect("/");
  }
};
