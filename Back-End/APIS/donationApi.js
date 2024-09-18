const express = require('express');
const { v4: uuidv4 } = require('uuid'); 
const donationApp = express.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();
donationApp.use(express.json());
donationApp.use(express.urlencoded());
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

donationApp.post('/donation', expressAsyncHandler(async (req, res) => {
  const { payment_method_id, userId, amount, currency} = req.body;
  console.log(req.body);

  try {
    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: payment_method_id,
      amount: amount,
      currency: currency,
      confirmation_method: 'manual',
      confirm: true,
      return_url: 'http://localhost:4000/donation-success',
    });

    // Handle successful payment
    console.log('PaymentIntent created:', paymentIntent.id);

    // Generate unique ticket ID
    const donationId = uuidv4();

    // Store user and ticket information in your database
    // Example: MongoDB
    let Donation = req.app.get("donationCollectionObject");
    await Donation.insertOne({
      donationId: donationId,
      userId: userId,
      amount: amount,
    });

    // Return ticket ID to frontend
    res.status(200).json({ success: true, donationId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// paymentApp.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

module.exports = donationApp;