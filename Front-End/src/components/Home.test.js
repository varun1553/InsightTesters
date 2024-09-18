//To test whether the Welcome to AlmaMingle: Connect, Learn, Thrive! is present or not.
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders Home component without crashing', () => {
  render(<Home />);
  expect(screen.getByText("Welcome to AlmaMingle: Connect, Learn, Thrive!")).toBeInTheDocument();
});
