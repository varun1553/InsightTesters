import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from './UserProfile'; // Make sure the path is correct
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter for testing
import configureStore from 'redux-mock-store'; // Assuming you're using redux-mock-store

// Create a mock store for your test cases
const mockStore = configureStore();
const initialState = {
  user: {
    userObj: {
      name: 'Test Name',
      email: 'testemail@example.com',
      username: 'testusername',
    },
  },
};
const store = mockStore(initialState);

describe('UserProfile Component Tests', () => {
  it('renders user profile information from the Redux store', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      </Provider>
    );

    // Test if the user profile information is displayed
    expect(screen.getByText(initialState.user.userObj.name)).toBeInTheDocument();
    expect(screen.getByText(initialState.user.userObj.email)).toBeInTheDocument();
    expect(screen.getByText(initialState.user.userObj.username)).toBeInTheDocument();
  });

  // You can add more tests here to simulate user interactions, check for changes in the component, etc.
});
