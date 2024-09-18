import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
const apiUrl = process.env.REACT_APP_URL;

const CheckoutForm = ({ onSuccess, event}) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [totalAmount, setTotalAmount] = useState(100);
  const [ticketId, setTicketId] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect( () => {
     setTotalAmount(event.ticketPrice);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
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
        const response = await axios.post(apiUrl+'/payment-api/payment', {
          payment_method_id: paymentMethod.id,
          amount: Math.round(totalAmount * 100), 
          event_id: event._id,
          userId: userObj._id,
          no_of_tickets: numberOfTickets,
          currency: 'usd'
        });
        console.log(response.data);
        setLoading(false);
        setTicketId(response.data.ticketId);
        setShowTicketModal(true);
        // onSuccess(); // Call onSuccess callback to close the dialog

      } catch (error) {
        console.error('Error processing payment:', error);
        setLoading(false);
      }
    }
  };

  const handleTicketChange = (e) => {
    const newNumberOfTickets = parseInt(e.target.value);
    if (!isNaN(newNumberOfTickets) && newNumberOfTickets > 0 && newNumberOfTickets <= 5) {
      setNumberOfTickets(newNumberOfTickets);
      setTotalAmount(totalAmount * newNumberOfTickets);
    }
  };

  return (

    <div className="container mt-4">
    <h3>Hello, {userObj.name}</h3>
    {ticketId === null ? (
      <>
        <p>Booking Amount: ${totalAmount}</p>
        <div className="mb-3">
          <label htmlFor="numberOfTickets" className="form-label">Number of Tickets:</label>
          <input
            type="number"
            id="numberOfTickets"
            min="1"
            max="5"
            value={numberOfTickets}
            onChange={handleTicketChange}
            className="form-control"
          />
        </div>
        <form onSubmit={handleSubmit}>
          <p>Enter your payment details:</p>
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
          <p>Total Amount: ${totalAmount}</p>
          <button
            type="submit"
            disabled={!stripe || loading || (ticketId != null)}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : 'Pay'}
          </button>
        </form>
      </>
    ) : (
      <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your ticket ID is: {ticketId}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowTicketModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    )}
  </div>
  );
};

export default CheckoutForm;
