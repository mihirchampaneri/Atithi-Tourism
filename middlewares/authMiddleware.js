const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owners-model");

// Middleware to check if user is logged in and load user data
const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "You need to log in first.");
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    let user = null;

    // Check role and fetch from the correct model
    if (decoded.role === "user") {
      user = await userModel.findById(decoded.id).select("-password");
    } else if (decoded.role === "admin") {
      user = await ownerModel.findById(decoded.id).select("-password");
    }

    if (!user) {
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/");
    }

    // Attach user to request and session
    req.user = user;
    req.user.role = decoded.role;
    req.session.userId = user._id;
    req.session.userRole = decoded.role;
    res.locals.user = user;
    res.locals.userRole = decoded.role;

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    req.flash("error", "Authentication failed. Please log in again.");
    res.redirect("/");
  }
};

// Middleware to restrict access by role
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      req.flash("error", "Access denied.");
      res.cookie("token", "");
      return res.redirect("/");
    }
    next();
  };
};

module.exports = {
  isLoggedIn,
  authorizeRole,
};
