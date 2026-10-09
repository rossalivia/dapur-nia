import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthContext } from '../context/AuthContext';

const mockLogin = vi.fn();
const mockLoginGoogle = vi.fn();

const renderWithContext = () => {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        role: null,
        profile: null,
        loading: false,
        error: null,
        login: mockLogin,
        loginGoogle: mockLoginGoogle,
        register: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('LoginPage Component', () => {
  it('renders email, password inputs, and login button', () => {
    renderWithContext();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk ke Akun/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk dengan Google/i })).toBeInTheDocument();
  });

  it('calls loginGoogle when Google button is clicked', async () => {
    renderWithContext();

    const googleBtn = screen.getByRole('button', { name: /Masuk dengan Google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockLoginGoogle).toHaveBeenCalled();
    });
  });

  it('calls login with email and password on submit', async () => {
    renderWithContext();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Kata Sandi/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Masuk ke Akun/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
      });
    });
  });
});
