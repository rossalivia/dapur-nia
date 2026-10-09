import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { AuthContext } from '../context/AuthContext';

const mockRegister = vi.fn();

const renderWithContext = () => {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        role: null,
        profile: null,
        loading: false,
        error: null,
        login: vi.fn(),
        loginGoogle: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
      }}
    >
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('RegisterPage Component', () => {
  it('renders all registration fields', () => {
    renderWithContext();
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nomor WhatsApp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Pengiriman/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Kata Sandi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Konfirmasi Kata Sandi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar Akun/i })).toBeInTheDocument();
  });

  it('validates WhatsApp number format and passwords mismatch', async () => {
    renderWithContext();

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: 'Budi' } });
    fireEvent.change(screen.getByLabelText(/Nomor WhatsApp/i), { target: { value: '09123456789' } });
    fireEvent.change(screen.getByLabelText(/Alamat Pengiriman/i), { target: { value: 'Jl. Mawar' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'budi@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Kata Sandi/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/Konfirmasi Kata Sandi/i), { target: { value: 'different' } });

    fireEvent.click(screen.getByRole('button', { name: /Daftar Akun/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nomor WhatsApp harus diawali 08/i)).toBeInTheDocument();
      expect(screen.getByText(/Konfirmasi kata sandi tidak cocok/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });
});
