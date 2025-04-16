require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const isLoggedin = require('../middlewares/isLoggedin');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const tripModel = require("../models/trip-model");
const userModel = require("../models/user-model");
const{
    registerUser, 
    loginUser,
    changePassword,
    logout
} = require('../controllers/authController');


router.get('/', function (req, res){
    res.send("Its working");
});

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post("/changePassword", changePassword);

router.get('/logout', logout);

router.get("/myaccount", isLoggedin, (req, res) => {
    let error = req.flash('error');
    res.render("myaccount", { user: req.user, error });
  });

router.get("/review", isLoggedin, async(req, res) => {
    const trips = await tripModel.find({}, "name");
    let success = req.flash('success');
    let error = req.flash('error');
    res.render("review", { user: req.user, error,success, trips });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  router.get('/forgot-password', (req, res) => {
    res.render('forgot',{ loggedin: false });
  });
  
  router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
  
    if (!user) return res.send('User not found.');
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();
  
    await transporter.sendMail({
      to: email,
      subject: 'Your OTP for Password Reset',
      text: ` Hi [User],<br>
      We received a request to reset your password.<br>
      Please use the following One-Time Password (OTP) to proceed:<br>
      🔐Your OTP is: ${otp}<br>
      🕒 Valid for: 10 minutes<br>
      Do not share this OTP with anyone for security reasons.<br>
      Thanks,<br>
      अतिथि Tourism`
    });
  
    res.render('otp', { email });
  });
  
  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email, otp });
  
    if (!user || user.otpExpires < Date.now()) {
      return res.send('Invalid or expired OTP.');
    }
  
    res.render('reset', { email });
  });
  
  router.post('/reset-password', async (req, res) => {
    const { email, password, confirm } = req.body;
    if (password !== confirm) return res.send('Passwords do not match.');
  
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.findOneAndUpdate({ email }, { password: hashedPassword, otp: null, otpExpires: null });
    req.flash("success", "Password reset successful!");
    res.redirect("/login");
  });
  
  // Add to wishlist
  router.post('/wishlist/:tripId', isLoggedin, async (req, res) => {
    try {
      const userId = req.user._id;
      const tripId = req.params.tripId;
  
      const user = await userModel.findById(userId);
  
      const index = user.wishlist.indexOf(tripId);
  
      if (index === -1) {
        // Not in wishlist, add it
        user.wishlist.push(tripId);
        req.flash('success', 'Trip added to your wishlist!');
      } else {
        // Already in wishlist, remove it
        user.wishlist.splice(index, 1);
        req.flash('success', 'Trip removed from your wishlist.');
      }
  
      await user.save();
      res.redirect('/shop');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Something went wrong.');
      res.redirect('/shop');
    }
  });  

  router.get('/wishlist', isLoggedin, async (req, res) => {
    try {
      // Get trip IDs from the logged-in user's wishlist
      const user = await userModel.findById(req.user._id).populate('wishlist');
  
      res.render('wishlist', {
        user: req.user,
        wishlistTrips: user.wishlist,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong while loading wishlist");
      res.redirect('/');
    }
  });  

module.exports = router;