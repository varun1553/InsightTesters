const express = require('express');
const { v4: uuidv4 } = require('uuid'); 
const paymentApp = express.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();
paymentApp.use(express.json());
paymentApp.use(express.urlencoded());
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




paymentApp.post('/payment', expressAsyncHandler(async (req, res) => {
  const { payment_method_id, amount, currency, eventId, numberOfTickets, userId } = req.body;
  console.log(req.body);

  try {
    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: payment_method_id,
      amount: amount,
      currency: currency,
      confirmation_method: 'manual',
      confirm: true,
      return_url: 'http://localhost:4000/payment-success',
    });

    // Handle successful payment
    console.log('PaymentIntent created:', paymentIntent.id);

    // Generate unique ticket ID
    const ticketId = uuidv4();

    // Store user and ticket information in your database
    // Example: MongoDB
    let Ticket = req.app.get("ticketCollectionObject");
    await Ticket.insertOne({
      userId: userId,
      ticketId: ticketId,
      eventId: eventId,
      numberOfTickets: numberOfTickets,
      amount: amount,
    });

    // Return ticket ID to frontend
    res.status(200).json({ success: true, ticketId });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// paymentApp.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

module.exports = paymentApp;