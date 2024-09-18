import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Admindashboard from './Admindashboard'; // Adjust the import path as needed
import MockAdapter from 'axios-mock-adapter';
const apiUrl = process.env.REACT_APP_URL;

// Initialize axios mock
const mock = new MockAdapter(axios);

describe('Admindashboard', () => {
  it('successfully sends a message', async () => {
    // Mock any POST request to /broadcast-api/send-message
    // args for reply are (status, data, headers)
    mock.onPost(apiUrl+'/broadcast-api/send-message').reply(200, {
      message: "Message sent successfully",
    });

    render(<Admindashboard />);

    // Simulate typing into the message textarea
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test broadcast message' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByText(/send message/i));

    // Wait for the success message to show up
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent("Message sent successfully");
    });
  });

  it('fails to send a message', async () => {
    // Mock a failure response for the POST request
    mock.onPost(apiUrl+'/broadcast-api/send-message').networkError();

    render(<Admindashboard />);

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Test failure message' },
    });

    fireEvent.click(screen.getByText(/send message/i));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent("Failed to send message");
    });
  });
});
