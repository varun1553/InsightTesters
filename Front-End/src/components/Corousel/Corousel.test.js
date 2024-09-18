import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Carousel from './Corousel'; // Update the import path according to your file structure

// Mocking the useEffect to control the setInterval and clearInterval
jest.useFakeTimers();

describe('Carousel Component', () => {
  beforeEach(() => {
    // Render the Carousel component before each test
    render(<Carousel />);
  });

  it('automatically moves to the next slide', () => {
    // Initial slide
    expect(screen.getByAltText('Slide 0')).toBeInTheDocument();

    // Fast-forward time by 3 seconds to simulate automatic slide change
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Expect the second slide to be displayed
    expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
  });

  it('moves to the next slide on next button click', () => {
    // Click the "next" button
    fireEvent.click(screen.getByText('>'));
    
    // Expect the second slide to be displayed
    expect(screen.getByAltText('Slide 1')).toBeInTheDocument();
  });

  it('moves to the previous slide on prev button click', () => {
    // First, move to the next slide to ensure the carousel isn't on the first slide
    fireEvent.click(screen.getByText('>'));

    // Then, click the "prev" button
    fireEvent.click(screen.getByText('<'));
    
    // Expect the first slide to be displayed again
    expect(screen.getByAltText('Slide 0')).toBeInTheDocument();
  });

  // Clean up timers
  afterEach(() => {
    jest.clearAllTimers();
  });
});
