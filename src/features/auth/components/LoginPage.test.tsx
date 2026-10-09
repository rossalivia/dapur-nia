import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthContext } from '../context/AuthContext';

const mockLogin = vi.fn();

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
  });

  it('populates demo credentials when demo buttons are clicked', () => {
    renderWithContext();

    const adminDemoBtn = screen.getByRole('button', { name: /Demo Admin/i });
    fireEvent.click(adminDemoBtn);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('admin@dapurnia.com');
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
