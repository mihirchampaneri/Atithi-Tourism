const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const isLoggedin = require('../middlewares/isLoggedin');
const tripModel = require("../models/trip-model");
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
  
module.exports = router;