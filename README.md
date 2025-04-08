# Travel Website

A comprehensive travel booking platform that connects travelers with hotel owners, offering a seamless experience for booking accommodations and managing trips.

## Features

### For Travelers
- **User Authentication**: Secure registration and login system
- **Hotel Search & Booking**: Browse and book hotels with detailed information
- **Trip Management**: Create and manage your travel itineraries
- **Review System**: Share your experiences by rating and reviewing hotels
- **Secure Payments**: Integrated Stripe payment gateway for safe transactions
- **Booking History**: Track your past and upcoming bookings

### For Hotel Owners
- **Owner Dashboard**: Manage your hotel listings and bookings
- **Hotel Management**: Add, edit, and update hotel information
- **Booking Management**: View and manage incoming bookings
- **Review Management**: Monitor and respond to guest reviews

### General Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Instant booking confirmations and status updates
- **Search Functionality**: Advanced search filters for finding perfect accommodations
- **Secure Authentication**: Protected user accounts and data
- **Session Management**: Persistent user sessions for better experience

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS Templates, HTML, CSS, JavaScript
- **Database**: MongoDB
- **Authentication**: Express Session, Cookie Parser
- **Payment Processing**: Stripe
- **Environment Management**: dotenv

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EXPRESS_SESSION_SECRET=your_session_secret
   EMAIL_USER=your_email_id
   EMAIL_PASS=your_email_password
   TWILIO_SID=your_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE=your_number
   ```
4. Set Env Variable:
    ```
    export DEBUG="development:*"
    export NODE_ENV="development"
    ```
5. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
├── config/         # Configuration files
├── controllers/    # Business logic
├── middlewares/    # Custom middleware
├── models/         # Database models
├── public/         # Static assets
├── routes/         # Route definitions
├── utils/          # Utility functions
└── views/          # EJS templates
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 