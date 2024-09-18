import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';

import Userdashboard from './Userdashboard'; // Adjust the path to your Userdashboard component

// Setting up the initial state and mock store
const mockStore = configureStore();
const initialState = {
  user: {
    userObj: {
      name: 'John Doe',
    },
  },
};

describe('Userdashboard Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders and displays the user name', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Userdashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Hello, John Doe!/i)).toBeInTheDocument();
  });

  it('navigates to the profile when View Profile is clicked', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Userdashboard />} />
            {/* Assuming UserProfile is a simple component that just renders "Profile Page" */}
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Assuming the link to the user's profile has text "View Profile"
    await userEvent.click(screen.getByText(/View Profile/i));

    // Check if navigation to profile page occurred
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
  });

  // Add more tests as needed
});
