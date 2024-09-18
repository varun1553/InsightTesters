import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
const apiUrl = process.env.REACT_APP_URL;

function Inquiry() {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await axios.get(apiUrl+'/contactus-api/get-inquiry');
        setInquiries(response.data);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      }
    };

    fetchInquiries();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Inquiries</h2>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry._id} className="col">
            <Card>
              <Card.Body>
                <Card.Title>{inquiry.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{inquiry.email}</Card.Subtitle>
                <Card.Text>Subject: {inquiry.subject}</Card.Text>
                <Card.Text>Message: {inquiry.message}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inquiry;
