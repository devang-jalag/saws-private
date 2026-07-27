import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the navigation bar and brand name', () => {
    render(<App />);
    const brandElement = screen.getByText(/SAWS SmartCare/i);
    expect(brandElement).toBeInTheDocument();
  });
});
