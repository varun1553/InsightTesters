import React, { useState } from 'react';
import axios from 'axios';
import './new_event.css';
import { useForm } from "react-hook-form";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
const apiUrl = process.env.REACT_APP_URL;

function NewEvent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux

  const onFormSubmit = async (eventObj) => {
    try {
      eventObj.userId = userObj._id;
      const formData = new FormData();

      console.log(eventObj);
      formData.append("eventObj", JSON.stringify(eventObj));
      console.log(formData);
      const response = await axios.post(apiUrl+"/event-api/new-event", formData, {
        headers: {
          "Content-Type": 'application/json',
        },
      });

      console.log("New Event Added:", response.data);
      alert(response.data.message);
      if (response.data.message == "New Event Created") {
        navigate('/events')
      }
    } catch (error) {
      console.error("Error adding new event:", error);
      alert(error)
    }
  };

  return (
    <>
      <div className="new-post-card" style={{ marginTop: '40px' }}>
        <h2>Create New Event</h2>
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Event Name: </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Event Name.."
              {...register("event_name", { required: true })}
            />
            {errors.name && (
              <p className="text-danger">* Name is required</p>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="url">
            <Form.Label>Image Url: </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Image Url.."
              {...register("image_url", { required: true })}
            />
            {errors.url && (
              <p className="text-danger">* URL is required</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="location">
            <Form.Label>Location: </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Location.."
              {...register("location", { required: true })}
            />
            {errors.location && (
              <p className="text-danger">* Location is required</p>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="dateTime">
            <Form.Label>Date & Time: </Form.Label>
            <Form.Control
              type="datetime-local"
              placeholder="Enter Date & Time.."
              {...register("dateTime", { required: true })}
            />
            {errors.dateTime && (
              <p className="text-danger">* Date & Time is required</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="ticketPrice">
          <Form.Label>Ticket Price ($): </Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter Ticket Price.."
            {...register("ticketPrice", { required: true, min: 1, max: 1000 })}
          />
          {errors.ticketPrice && errors.ticketPrice.type === "required" && (
            <p className="text-danger">* Ticket Price is required</p>
          )}
          {errors.ticketPrice && errors.ticketPrice.type === "min" && (
            <p className="text-danger">* Ticket Price must be at least $1</p>
          )}
          {errors.ticketPrice && errors.ticketPrice.type === "max" && (
            <p className="text-danger">* Ticket Price must not exceed $1000</p>
          )}
        </Form.Group>


          <Button variant="primary" type="submit">
            Create Event
          </Button>
        </Form>

      </div>
    </>
  );
}

export default NewEvent;
