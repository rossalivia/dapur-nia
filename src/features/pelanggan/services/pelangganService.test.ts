import { describe, it, expect } from 'vitest';
import { validatePelangganInput } from './pelangganService';

describe('validatePelangganInput', () => {
  it('validates a correct customer input', () => {
    const valid = validatePelangganInput({
      nama: 'Budi Santoso',
      no_whatsapp: '081234567890',
      alamat: 'Jl. Melati No. 12, RT 03/RW 05',
    });
    expect(valid).toBe(true);
  });

  it('rejects empty name or name exceeding 60 characters', () => {
    expect(() =>
      validatePelangganInput({ nama: '', no_whatsapp: '081234567890', alamat: 'Jl Melati' })
    ).toThrow(/nama pelanggan wajib diisi/i);

    expect(() =>
      validatePelangganInput({ nama: 'A'.repeat(61), no_whatsapp: '081234567890', alamat: 'Jl Melati' })
    ).toThrow(/maksimal 60 karakter/i);
  });

  it('rejects invalid WhatsApp numbers', () => {
    // Not starting with 08
    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '07123456789', alamat: 'Jl Melati' })
    ).toThrow(/nomor whatsapp tidak sah/i);

    // Too short (< 10 digits)
    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '08123', alamat: 'Jl Melati' })
    ).toThrow(/nomor whatsapp tidak sah/i);

    // Too long (> 13 digits)
    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '0812345678901234', alamat: 'Jl Melati' })
    ).toThrow(/nomor whatsapp tidak sah/i);

    // Contains non-digit
    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '081234abcd', alamat: 'Jl Melati' })
    ).toThrow(/nomor whatsapp tidak sah/i);
  });

  it('rejects empty address or address exceeding 200 characters', () => {
    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '081234567890', alamat: '' })
    ).toThrow(/alamat wajib diisi/i);

    expect(() =>
      validatePelangganInput({ nama: 'Budi', no_whatsapp: '081234567890', alamat: 'A'.repeat(201) })
    ).toThrow(/maksimal 200 karakter/i);
  });
});
