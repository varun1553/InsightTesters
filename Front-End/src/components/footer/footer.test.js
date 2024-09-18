import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  it('renders footer text correctly', () => {
    render(<Footer />);
    const footerText = screen.getByText(/AlmaMingle/i);
    expect(footerText).toBeInTheDocument();
  });

  it('renders current year correctly', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const yearText = screen.getByText(new RegExp(currentYear));
    expect(yearText).toBeInTheDocument();
  });

  it('renders terms of use and privacy links', () => {
    render(<Footer />);
    const termsOfUseLink = screen.getByText(/Terms of Use/i);
    const privacyLink = screen.getByText(/Privacy/i);
    expect(termsOfUseLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
  });
});
