import { describe, it, expect } from 'vitest';
import { validateMenuInput } from './menuService';

describe('validateMenuInput (Invariant 1 & Rules)', () => {
  it('validates a correct menu input', () => {
    const valid = validateMenuInput({
      nama: 'Nasi Ayam Bakar',
      harga: 25000,
      sisa_porsi: 30,
      tersedia: true,
    });
    expect(valid).toBe(true);
  });

  it('rejects empty or whitespace-only name', () => {
    expect(() =>
      validateMenuInput({ nama: '', harga: 25000, sisa_porsi: 10, tersedia: true })
    ).toThrow(/nama.*wajib diisi/i);
    expect(() =>
      validateMenuInput({ nama: '   ', harga: 25000, sisa_porsi: 10, tersedia: true })
    ).toThrow(/nama.*wajib diisi/i);
  });

  it('rejects name exceeding 60 characters', () => {
    const longName = 'A'.repeat(61);
    expect(() =>
      validateMenuInput({ nama: longName, harga: 25000, sisa_porsi: 10, tersedia: true })
    ).toThrow(/maksimal 60 karakter/i);
  });

  it('rejects negative price (Invariant 1)', () => {
    expect(() =>
      validateMenuInput({ nama: 'Ayam Goreng', harga: -5000, sisa_porsi: 10, tersedia: true })
    ).toThrow(/tidak boleh bernilai negatif/i);
  });

  it('rejects negative portion (Invariant 1)', () => {
    expect(() =>
      validateMenuInput({ nama: 'Ayam Goreng', harga: 25000, sisa_porsi: -1, tersedia: true })
    ).toThrow(/tidak boleh bernilai negatif/i);
  });

  it('rejects NaN or non-number values', () => {
    expect(() =>
      validateMenuInput({ nama: 'Ayam Goreng', harga: NaN, sisa_porsi: 10, tersedia: true })
    ).toThrow(/angka bulat/i);
    expect(() =>
      validateMenuInput({ nama: 'Ayam Goreng', harga: 25000, sisa_porsi: NaN, tersedia: true })
    ).toThrow(/angka bulat/i);
  });

  it('accepts portion 0 (status Habis)', () => {
    expect(
      validateMenuInput({ nama: 'Ayam Habis', harga: 25000, sisa_porsi: 0, tersedia: true })
    ).toBe(true);
  });
});
