import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_URL;

const DonateNow = () => {
  const [loading, setLoading] = useState(false);
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux
  const [donationAmount, setDonationAmount] = useState(10);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleDonation = async (event) => {
    event.preventDefault();
    console.log("event is " , event);
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

    if (error) {
        console.log('[error]', error);
        setLoading(false);
      } else {
        console.log('[PaymentMethod]', paymentMethod);
        // Send the payment method ID to your server to complete the payment
        try {
            console.log("url is " + apiUrl+'/donation-api/donation');
            const response = await axios.post(apiUrl+'/donation-api/donation', {
            payment_method_id: paymentMethod.id,
            amount: donationAmount*100, 
            userId: userObj._id,
            currency: 'usd'
          });
          console.log("response is" + response.data);
          setLoading(false);
          setDonationSuccess(true);
        } catch (error) {
          setLoading(false);
        }
      }

    // if (result.error) {
    //   console.error(result.error.message);
    //   // Show error to your user (e.g., insufficient funds)
    // } else {
    //   // Payment succeeded
    //   setDonationSuccess(true);
    //   // Send donation information to the backend
    //   sendDonationToBackend(result.paymentIntent.id, donationAmount);
    // }
  };

  const handleAmountChange = (event) => {
    setDonationAmount(event.target.value);
  };

  const sendDonationToBackend = async (paymentIntentId, amount) => {
    try {
      const response = await fetch(apiUrl+'donation-api/donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, amount }),
      });

      if (response.ok) {
        console.log('Donation information sent to backend successfully!');
      } else {
        console.error('Failed to send donation information to backend.');
      }
    } catch (error) {
      console.error('Error sending donation information to backend:', error);
    }
  };

  return (
     <div className="container mt-4 d-flex justify-content-center align-items-center">
  <div className="col-md-6">
    <h3 className="text-center mb-4">Hello, {userObj.name}</h3>
    <p>Thank you for considering a donation to our university. Your generous contribution will help support various programs, initiatives, and resources that benefit our students, faculty, and community.</p>
    {donationSuccess && <p className="text-center">Thank you for your donation!</p>}
    {!donationSuccess && (
      <form onSubmit={handleDonation}>
        <div className="mb-3">
          <label htmlFor="donationAmount" className="form-label">
            Donation Amount ($):
          </label>
          <input
            type="number"
            id="donationAmount"
            min="1"
            value={donationAmount}
            onChange={handleAmountChange}
            className="form-control"
            style={{ maxWidth: '200px' }} 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cardElement" className="form-label">
            Card Information:
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#192059',
                  '::placeholder': {
                    color: '#000000',
                  },
                  border: '1px solid #000000',
                },
                invalid: {
                  color: '#b01946',
                },
              },
            }}
            className="form-control"
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : 'Donate'}
          </button>
        </div>
      </form>
    )}
  </div>
</div>
  );
};

export default DonateNow;
