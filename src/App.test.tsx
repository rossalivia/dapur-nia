import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App with Authentication', () => {
  it('redirects unauthenticated users to login page', async () => {
    render(<App />);
    expect(await screen.findByText(/Masuk ke Dapur Nia/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk ke Akun/i })).toBeInTheDocument();
  });
});
