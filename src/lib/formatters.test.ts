import { describe, it, expect } from 'vitest';
import { formatRupiah, validateWhatsApp } from './formatters';

describe('formatters and validators', () => {
  it('formats number into clean Rupiah string', () => {
    expect(formatRupiah(25000)).toBe('Rp 25.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('validates WhatsApp number format strictly', () => {
    expect(validateWhatsApp('081234567890')).toBe(true);
    expect(validateWhatsApp('08123456789')).toBe(true); // 11 digits
    expect(validateWhatsApp('07123456789')).toBe(false); // must start with 08
    expect(validateWhatsApp('08123')).toBe(false); // too short (< 10)
    expect(validateWhatsApp('0812345678901234')).toBe(false); // too long (> 13)
    expect(validateWhatsApp('08123456abc')).toBe(false); // non-digits
  });
});
