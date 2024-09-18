import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Inquiry from './Inquiry'; // Adjust the import path as needed
const apiUrl = process.env.REACT_APP_URL;

// Initialize axios mock
const mock = new MockAdapter(axios);

describe('Inquiry Component', () => {
  it('fetches and displays inquiries', async () => {
    // Mocking the GET request to /contactus-api/get-inquiry
    // Replace the below data with a sample of your expected API response
    const inquiries = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', subject: 'Test Subject', message: 'Test Message' },
      { _id: '2', name: 'Jane Doe', email: 'jane@example.com', subject: 'Another Test Subject', message: 'Another Test Message' },
    ];

    mock.onGet(apiUrl+'/contactus-api/get-inquiry').reply(200, inquiries);

    render(<Inquiry />);

    // Wait for the axios call to resolve and the component to update
    await waitFor(() => {
      inquiries.forEach((inquiry) => {
        expect(screen.getByText(inquiry.name)).toBeInTheDocument();
        expect(screen.getByText(inquiry.email)).toBeInTheDocument();
        expect(screen.getByText(`Subject: ${inquiry.subject}`)).toBeInTheDocument();
        expect(screen.getByText(`Message: ${inquiry.message}`)).toBeInTheDocument();
      });
    });
  });

  // Additional tests can be written here to cover other scenarios, such as error handling
});
