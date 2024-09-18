import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
const apiUrl = process.env.REACT_APP_URL;

function Admindashboard() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl+'/broadcast-api/send-message', { message });
      setSuccess(response.data.message);
      setError("");
      setMessage("");
    } catch (error) {
      setError("Failed to send message");
      setSuccess("");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mb-4">
        <h2 className="mb-4">Compose Message</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="content">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Send Message
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Admindashboard;
