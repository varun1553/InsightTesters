import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Signup from './Signup'; // Adjust the import path as needed

// Mock axios and react-router-dom's useNavigate
jest.mock('axios');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Use actual for all non-hook parts
  useNavigate: () => mockedNavigate,
}));

describe('Signup Component', () => {
  // Mock window.alert
  beforeAll(() => {
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('successfully signs up a user and navigates to login', async () => {
    // Mock axios response for success
    axios.post.mockResolvedValueOnce({ data: { message: "New User created" } });

    render(<Signup />);

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText('Enter your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'johndoe@my.unt.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Enter city'), { target: { value: 'Denton' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    // Wait for the post call
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // Assertions
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.any(FormData), expect.any(Object));
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
    expect(window.alert).toHaveBeenCalledWith("New User created");
  });

  it('displays an error message when signup is unsuccessful', async () => {
    // Mock axios response for failure
    axios.post.mockRejectedValueOnce(new Error('Something went wrong in creating user'));

    render(<Signup />);

    // Fill the form with some data
    fireEvent.change(screen.getByPlaceholderText('Enter your Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Username'), { target: { value: 'janedoe' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'janedoe@my.unt.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Enter city'), { target: { value: 'Denton' } });

    // Attempt to submit form
    fireEvent.click(screen.getByRole('button', { name: /signup/i }));

    // Wait for the post call and catch the rejection
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // Since jsdom does not implement window.alert, you wouldn't normally check this in a test.
    // If you were checking for a UI update (like an error message), you would wait for that to appear in the DOM.
    // For the purpose of this example, let's assert `window.alert` was called since we mocked it as part of the setup.
    expect(window.alert).toHaveBeenCalledWith("Something went wrong in creating user");
  });
});