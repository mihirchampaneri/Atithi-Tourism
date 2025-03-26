const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isLoggedin = require('../middlewares/isLoggedin');
const tripModel = require('../models/trip-model'); 
const hotelModel = require('../models/hotels-model'); 

router.get('/', function(req, res){
    let success = req.flash('success');
    let error = req.flash('error');
    res.render('index', { error, showSignup: false, loggedin: false ,success});
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
        let trip = await tripModel.find();
        res.render('shop', { trips : trip, success: success });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/trip/:id', async (req, res) => {
    try {
        const tripId = req.params.id;
        const trip = await tripModel.findById(tripId);
        let hotel = await hotelModel.find();
        
        if (!trip) {
            return res.status(404).send('Trip not found');
        }
        res.render('hotel', { hotels : hotel, trip });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/trip/:idd/hotel/:id', async (req, res) => {
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

router.get('/logout', isLoggedin, function (req, res){
    res.render('shop');
});

module.exports = router;