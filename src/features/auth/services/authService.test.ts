import { describe, it, expect, vi } from 'vitest';
import { formatAuthError, isEmailAdmin } from './authService';

describe('authService helpers', () => {
  it('formats invalid-credential error message to friendly Indonesian', () => {
    const err = { code: 'auth/invalid-credential', message: 'invalid' };
    expect(formatAuthError(err)).toBe('Email atau kata sandi yang Anda masukkan salah.');
  });

  it('formats user-not-found error message to friendly Indonesian', () => {
    const err = { code: 'auth/user-not-found', message: 'not found' };
    expect(formatAuthError(err)).toBe('Email atau kata sandi yang Anda masukkan salah.');
  });

  it('formats wrong-password error message to friendly Indonesian', () => {
    const err = { code: 'auth/wrong-password', message: 'wrong' };
    expect(formatAuthError(err)).toBe('Email atau kata sandi yang Anda masukkan salah.');
  });

  it('formats email-already-in-use error message to friendly Indonesian', () => {
    const err = { code: 'auth/email-already-in-use', message: 'in use' };
    expect(formatAuthError(err)).toBe('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.');
  });

  it('formats weak-password error message to friendly Indonesian', () => {
    const err = { code: 'auth/weak-password', message: 'weak' };
    expect(formatAuthError(err)).toBe('Kata sandi minimal harus terdiri dari 6 karakter.');
  });

  it('formats network error to friendly Indonesian', () => {
    const err = { code: 'auth/network-request-failed', message: 'network' };
    expect(formatAuthError(err)).toBe('Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.');
  });

  it('identifies admin email correctly', () => {
    expect(isEmailAdmin('admin@dapurnia.com')).toBe(true);
    expect(isEmailAdmin('ADMIN@DAPURNIA.COM')).toBe(true);
    expect(isEmailAdmin('dina@dapurnia.com')).toBe(true);
    expect(isEmailAdmin('budi@gmail.com')).toBe(false);
    expect(isEmailAdmin('')).toBe(false);
    expect(isEmailAdmin(null)).toBe(false);
  });
});
