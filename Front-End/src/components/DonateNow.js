import React, { useState, useEffect } from 'react';
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
  const [donations, setDonations] = useState([]);
  const stripe = useStripe();
  const elements = useElements();

  // Function to fetch donations
  const fetchDonations = async () => {
    try {
      const response = await axios.get(apiUrl + '/donation-api/donations');
      if (response.data.success) {
        setDonations(response.data.donations);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  // Fetch donations when the component mounts
  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDonation = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
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
      try {
        const response = await axios.post(apiUrl + '/donation-api/donation', {
          payment_method_id: paymentMethod.id,
          amount: donationAmount * 100,
          userId: userObj._id,
          currency: 'usd'
        });
        setLoading(false);
        if (response.data.success) {
          setDonationSuccess(true);
          // Fetch donations again to update the list after a successful donation
          fetchDonations();
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const handleAmountChange = (event) => {
    setDonationAmount(event.target.value);
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center">
      <h3 className="text-center mb-4">Hello, {userObj.name}</h3>
      <p className="text-center mb-4">Thank you for considering a donation to our university. Your generous contribution will help support various programs, initiatives, and resources that benefit our students, faculty, and community.</p>
      {donationSuccess && <p className="text-success text-center">Thank you for your donation!</p>}
      
      <form onSubmit={handleDonation} className="mb-4 w-50"> {/* Set width of the form */}
        <div className="mb-3">
          <label htmlFor="donationAmount" className="form-label">Donation Amount ($):</label>
          <input
            type="number"
            id="donationAmount"
            min="1"
            value={donationAmount}
            onChange={handleAmountChange}
            className="form-control"
            style={{ maxWidth: '200px' }} // Adjust max width if needed
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cardElement" className="form-label">Card Information:</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#192059',
                  '::placeholder': { color: '#000000' },
                },
                invalid: {
                  color: '#b01946',
                },
              },
            }}
            className="form-control w-100" // Make CardElement full width
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn btn-primary w-100" // Make button full width
          >
            {loading ? 'Processing...' : 'Donate'}
          </button>
        </div>
      </form>

      <h4 className="text-center">Donation Summary</h4>
      <div className="list-group w-50"> {/* Set width of the donation summary */}
        {donations.map((donation, index) => (
          <div key={index} className="list-group-item">
            Amount: ${(donation.amount / 100).toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonateNow;
