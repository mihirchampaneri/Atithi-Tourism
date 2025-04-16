const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isLoggedin = require('../middlewares/isLoggedin');
const tripModel = require('../models/trip-model'); 
const hotelModel = require('../models/hotels-model'); 
const reviewModel = require('../models/review-model'); 
const contactusModel = require('../models/contactus-model'); 
const userModel = require('../models/user-model');

router.get('/login', function(req, res){
    let success = req.flash('success');
    let error = req.flash('error');
    res.render('index', { error, showSignup: false, loggedin: false ,success});
});

router.get('/',async function(req, res){
    let success = req.flash('success');
    let reviews= await reviewModel.find()
    let error = req.flash('error');
    res.render('home', { error, showSignup: false, loggedin: false ,success, reviews});
});

router.get('/signup', (req, res) => {
    let success = req.flash('success');
    let error = req.flash('error');
    res.render('index', { showSignup: true, loggedin:false , success,error });
  });

router.get('/owners', function (req, res){
    let error = req.flash('error');
    res.render('owner-login', { error , loggedin: false });
});

router.get('/shop', isLoggedin, async function (req, res) {
    try {
        let success = req.flash('success');
        let user=await userModel.find();
        let trip = await tripModel.find();
        res.render('shop', { trips : trip, success: success, user:req.user });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/trip/:id',isLoggedin, async (req, res) => {
    try {
        const tripId = req.params.id;
        const trip = await tripModel.findById(tripId);
        let hotel = await hotelModel.find({city: trip.name});
        
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        res.render('hotel', { hotels : hotel, trip });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/trip/:idd/hotel/:id',isLoggedin, async (req, res) => {
    try {
        const tripId = req.params.idd;
        const tripObjectId = new mongoose.Types.ObjectId(tripId);  

        const trip = await tripModel.findById(tripObjectId);  
        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        const hotelId = req.params.id;
        const hotel = await hotelModel.findById(hotelId);
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        res.render('cart', { trip, hotel });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/contactus', async (req, res) => {
    const { name, email, message } = req.body;
    let success = req.flash('success');
    let error= req.flash('error');
    try {
        const newContact = new contactusModel({ name, email, message });
        await newContact.save();
        req.flash('success',"Message Sent Successfully !");
        res.render('home',{ success,error })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/logout', isLoggedin, function (req, res){
    res.render('shop');
});

module.exports = router;