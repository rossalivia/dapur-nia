import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders root layout correctly', () => {
    render(<App />);
    expect(screen.getByText(/Dapur Nia/i)).toBeInTheDocument();
  });
});
