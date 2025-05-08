const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isLoggedIn, authorizeRole } = require("../middlewares/authMiddleware");
const isLoggedin = require('../middlewares/isLoggedin');
const tripModel = require('../models/trip-model'); 
const hotelModel = require('../models/hotels-model'); 
const reviewModel = require('../models/review-model'); 
const contactusModel = require('../models/contactus-model'); 
const userModel = require('../models/user-model');

router.get('/',async function(req, res){
    let success = req.flash('success');
    let reviews= await reviewModel.find()
    let error = req.flash('error');
    res.render('home', { error, showSignup: false, loggedin: false ,success, reviews});
});

router.get('/login', function(req, res){
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

router.get('/shop/:tripId?/:hotelId?', isLoggedin,  authorizeRole("user"), async (req, res) => {
  const { tripId, hotelId } = req.params;
  const searchQuery = req.query.q || '';
  const searchRegex = new RegExp(searchQuery, 'i');
  let error= req.flash('error');

  try {
    if (!tripId) {
      const [success, trips] = await Promise.all([
        req.flash('success'),
        tripModel.find(searchQuery ? { name: searchRegex } : {}) 
      ]);

      return res.render('shop', {
        trips,error,
        user: req.user,
        searchQuery,
        success
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).send('Invalid trip ID');
    }

    const trip = await tripModel.findById(tripId).lean();
    if (!trip) return res.status(404).send('Trip not found');

    if (!hotelId) {
      const hotels = await hotelModel.find(
        { city: trip.name, name: searchRegex }
      ).lean();

      return res.render('hotel', { hotels, trip, searchQuery });
    }


    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).send('Invalid hotel ID');
    }

    const hotel = await hotelModel.findById(hotelId).lean();
    if (!hotel) return res.status(404).send('Hotel not found');

    return res.render('cart', { trip, hotel });

  } catch (error) {
    console.error('Error in /shop route:', error);
    res.status(500).send('Internal Server Error');
  }
});


// router.get('/shop/:tripId?/:hotelId?', isLoggedin, async (req, res) => {
//   const { tripId, hotelId } = req.params;
//   const searchQuery = req.query.q || '';

//   try {
//     if (!tripId) {
//       const success = req.flash('success');
//       const trips = await tripModel.find(
//         searchQuery
//           ? { name: { $regex: searchQuery, $options: 'i' } }
//           : {}
//       );

//       return res.render('shop', {
//         trips,
//         user: req.user,
//         searchQuery,
//         success
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(tripId)) {
//       return res.status(400).send('Invalid trip ID');
//     }

//     const trip = await tripModel.findById(tripId);
//     if (!trip) return res.status(404).send('Trip not found');

//     if (!hotelId) {
//       const hotels = await hotelModel.find({
//         city: trip.name,
//         name: { $regex: searchQuery, $options: 'i' }
//       });

//       return res.render('hotel', { hotels, trip, searchQuery });
//     }

//     if (!mongoose.Types.ObjectId.isValid(hotelId)) {
//       return res.status(400).send('Invalid hotel ID');
//     }

//     const hotel = await hotelModel.findById(hotelId);
//     if (!hotel) return res.status(404).send('Hotel not found');

//     return res.render('cart', { trip, hotel });

//   } catch (error) {
//     console.error('Error in /shop route:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.post('/contactus',authorizeRole("user"), async (req, res) => {
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

module.exports = router;