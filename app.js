const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const ownersRouter = require('./routes/ownersRouter');
const tripsRouter = require('./routes/tripsRouter');
const usersRouter = require('./routes/usersRouter');
const hotelsRouter = require('./routes/hotelsRouter');
const bookingsRouter = require('./routes/bookingsRouter');
const reviewsRouter = require('./routes/reviewsRouter');
const indexRouter = require('./routes/index');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

require('dotenv').config();

const db = require("./config/mongoose-connection");

const expressSession = require('express-session');
const flash = require('connect-flash');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', indexRouter);  // Correct usage of indexRouter
app.use('/owners', ownersRouter);  // Correct usage of ownersRouter
app.use('/users', usersRouter);  // Correct usage of usersRouter
app.use('/trips', tripsRouter);  // Correct usage of tripsRouter
app.use('/hotels', hotelsRouter); // Correct usage of hotelRouter
app.use('/bookings', bookingsRouter); // Correct usage of bookingRouter
app.use('/reviews', reviewsRouter); // Correct usage of reviewRouter

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
