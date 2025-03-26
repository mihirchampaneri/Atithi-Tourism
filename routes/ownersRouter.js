const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owners-model');
const userModel = require('../models/user-model'); 
const tripModel = require('../models/trip-model'); 
const hotelModel = require('../models/hotels-model'); 
const bookingModel = require('../models/booking-model'); 
const reviewModel = require('../models/review-model'); 
const isLoggedin = require('../middlewares/isLoggedin');
const {loginOwner} = require('../controllers/adminauthController');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

if(process.env.NODE_ENV === "development"){
    router.post('/create', async function (req, res){
        let owners = await ownerModel.find();
        if(owners.length > 0) {
            return res
            .status(504)
            .send("You don't have permission to create a new owner");
        }  
        
        let { fullname, email, password } = req.body;
        
        let createdOwner = await ownerModel.create({
            fullname,
            email,
            password,
        });
        res.status(201).send(createdOwner);
    });
}
router.post('/login', loginOwner);

router.get('/admin',isLoggedin,async function (req, res){
    let success = req.flash('success');
    const usercount = await userModel.countDocuments();
    const tripcount = await tripModel.countDocuments();
    const hotelcount = await hotelModel.countDocuments();
    const bookingcount = await bookingModel.countDocuments();
    const reviewcount = await reviewModel.countDocuments();
    res.render("admindashboard", {success: success, usercount, tripcount, hotelcount, bookingcount, reviewcount});
});

router.get('/admin/users',isLoggedin, async function (req, res){
    try {
        let success = req.flash('success');
        let user = await userModel.find();
        res.render('adminusers', { user, success });
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).send('Server Error');
        }
});

router.post('/admin/users/:id',isLoggedin, async (req, res) => {
    try {
        const result = await userModel.findByIdAndDelete(req.params.id);
        if (result) {
            req.flash("success", "User deleted successfully");
            res.redirect("/owners/admin/users");
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/tours',isLoggedin, async function (req, res){
    try {
        let success = req.flash('success');
        let trip = await tripModel.find();
        res.render('admintrips', { trip, success });
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).send('Server Error');
        }
});

router.post('/admin/tours/:id',isLoggedin, async (req, res) => {
    try {
        const result = await tripModel.findByIdAndDelete(req.params.id);
        if (result) {
            req.flash("success", "Trip deleted successfully");
            res.redirect("/owners/admin/tours");
        } else {
            res.status(404).send('Tour not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/tours/:id/edit', isLoggedin, async (req, res) => {
    try {
        const trip = await tripModel.findById(req.params.id);
        if (!trip) {
            return res.status(404).send('Tour not found');
        }
        res.render('editTour', { trip });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/admin/tours/:id', isLoggedin, async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount,
            popularity: req.body.popularity,
            bgcolor: req.body.bgcolor,
            panelcolor: req.body.panelcolor,
            textcolor: req.body.textcolor
            // Add other fields as needed
        };

        const trip = await tripModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!trip) {
            return res.status(404).send('Tour not found');
        }

        req.flash("success", "Tour updated successfully");
        res.redirect('/owners/admin/tours');
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/hotels',isLoggedin, async function (req, res){
    try {
        let success = req.flash('success');
        let hotel = await hotelModel.find();
        res.render('adminhotels', { hotel, success });
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).send('Server Error');
        }
});

router.post('/admin/hotels/:id',isLoggedin, async (req, res) => {
    try {
        const result = await hotelModel.findByIdAndDelete(req.params.id);
        if (result) {
            req.flash("success", "Hotel deleted successfully");
            res.redirect("/owners/admin/hotels");
        } else {
            res.status(404).send('Hotel not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/hotels/:id/edit', isLoggedin, async (req, res) => {
    try {
        const hotel = await hotelModel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }
        res.render('edithotels', { hotel });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/admin/hotels/:id', isLoggedin, async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount,
            facility1: req.body.facility1,
            facility2: req.body.facility2,
            facility3: req.body.facility3,
            rating: req.body.rating,
            bgcolor: req.body.bgcolor,
            panelcolor: req.body.panelcolor,
            textcolor: req.body.textcolor
            // Add other fields as needed
        };

        const hotel = await hotelModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        req.flash("success", "Hotel updated successfully");
        res.redirect('/owners/admin/hotels');
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/bookings',isLoggedin, async function (req, res){
    try {
        let success = req.flash('success');
        let booking = await bookingModel.find();
        res.render('adminbookings', { booking, success });
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).send('Server Error');
        }
});

router.post('/admin/bookings/:id',isLoggedin, async (req, res) => {
    try {
        const result = await bookingModel.findByIdAndDelete(req.params.id);
        if (result) {
            req.flash("success", "Booking deleted successfully");
            res.redirect("/owners/admin/bookings");
        } else {
            res.status(404).send('Booking not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/admin/trip',isLoggedin, function (req, res){
    let success = req.flash('success');
    res.render("createtrips", {success: success});
});

router.get('/admin/hotel',isLoggedin, function (req, res){
    let success = req.flash('success');
    res.render("createhotels", {success: success});
});

router.get('/admin/reviews',isLoggedin, async function (req, res){
    try {
        let success = req.flash('success');
        let review = await reviewModel.find();
        res.render('adminreview', { review, success });
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).send('Server Error');
        }
});

router.post('/admin/reviews/:id',isLoggedin, async (req, res) => {
    try {
        const result = await reviewModel.findByIdAndDelete(req.params.id);
        if (result) {
            req.flash("success", "Review deleted successfully");
            res.redirect("/owners/admin/reviews");
        } else {
            res.status(404).send('Review not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;