import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './new_event.css';
import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);
const apiUrl = process.env.REACT_APP_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null); // State for edited event
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux

  const openPaymentDialog = (event) => {
    setSelectedEvent(event); 
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false);
  };

  const openEditDialog = (event) => {
    setEditedEvent(event);
  };

  const closeEditDialog = () => {
    setEditedEvent(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(apiUrl+`/event-api/events/${eventId}`);
      // Update the events list after deletion
      const updatedEvents = events.filter(event => event._id !== eventId);
      setEvents(updatedEvents);
      alert("Event is deleted")
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const buttonStyle = {
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  const handleSaveChanges = async () => {
    try {
      const eventId = editedEvent._id;
      await axios.put(apiUrl+`/event-api/update-events/${eventId}`, editedEvent);
      // Update the events list after editing
      const updatedEvents = events.map(event =>
        event._id === editedEvent._id ? editedEvent : event
      );
      setEvents(updatedEvents);
      closeEditDialog();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(apiUrl+`/event-api/events?visibility=public&page=${currentPage}`);
        setEvents(response.data.payload.events);
        setTotalPages(response.data.payload.totalPages);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <div className="container mt-5">
        <h1 className="mb-4">Events</h1>
        <div className='container mt-3' style={{ textDecoration: 'none', marginBottom: 20 }}>
          <div className='col-12'>
            <div >
              <Link to="/new-event" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
                <button style={buttonStyle}>
                  <span>Add new Event</span>
                  <span style={{ marginLeft: '5px' }}>+</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        <ul className="list-group">
          {events.map(event => (
            <li key={event._id} className="list-group-item mb-3 mt-3">
              <div className="event-details">
                <h3>{event.event_name}</h3>
                <p>Location:{event.location}</p>
                <p>Time: {event.dateTime}</p>
              </div>
              <div className="event-image">
                <img src={event.image_url} alt="Event" style={{ height: 150, width: 200 }} />
              </div>
              <div className="buttons" style={{ marginTop: '10px' }}>
                <button className="btn btn-primary mr-6" onClick={() => openPaymentDialog(event)}>
                  <span>Book Tickets</span>
                </button>
                <Modal show={showPaymentDialog} onHide={closePaymentDialog}>
                  <Modal.Header closeButton>
                    <Modal.Title>Booking Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Elements stripe={stripePromise}>
                      <CheckoutForm onSuccess={closePaymentDialog} event={selectedEvent} />
                    </Elements>
                  </Modal.Body>
                </Modal>
                {userObj._id === event.userId && (
                  <>
                    <button className="btn btn-primary mr-6" onClick={() => openEditDialog(event)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <nav className="mt-4">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pageNumber)}>{pageNumber}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Edit Event Modal */}
      <Modal show={!!editedEvent} onHide={closeEditDialog}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="event_name">Event Name</label>
              <input type="text" className="form-control" id="event_name" name="event_name" value={editedEvent?.event_name || ''} onChange={handleEditInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input type="text" className="form-control" id="location" name="location" value={editedEvent?.location || ''} onChange={handleEditInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="dateTime">Date & Time</label>
              <input type="date" className="form-control" id="dateTime" name="dateTime" value={editedEvent?.dateTime || ''} onChange={handleEditInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="ticketPrice">Ticket Price</label>
              <input type="text" className="form-control" id="ticketPrice" name="ticketPrice" value={editedEvent?.ticketPrice || ''} onChange={handleEditInputChange} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeEditDialog}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Events;
