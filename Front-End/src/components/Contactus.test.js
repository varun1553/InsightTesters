import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ContactUs from './Contactus.js'; // Adjust the import path to match your file structure

// Mock axios to handle the POST request
jest.mock('axios');

describe('ContactUs Component', () => {
  it('displays success message on successful form submission', async () => {
    // Mock the axios post function to resolve to a specific value
    axios.post.mockResolvedValue({ data: 'Message sent successfully' });

    render(<ContactUs />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'johndoe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message:/i), { target: { value: 'Hello, this is a test message.' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Submit/i));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Message sent successfully');
      expect(axios.post).toHaveBeenCalledWith(apiUrl+'contactus-api/send-inquiry', {
        name: 'John Doe',
        email: 'johndoe@example.com',
        subject: 'general', // This is the default value as set in your initial form state
        message: 'Hello, this is a test message.'
      });
    });
  });
});
