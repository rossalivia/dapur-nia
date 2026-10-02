import { describe, it, expect } from 'vitest';
import {
  calculateTotal,
  validatePesananPortion,
  isValidStatusTransition,
  getAllowedStatusTransitions,
} from './pesananService';

describe('Pesanan Invariants & State Machine', () => {
  describe('Invariant 3: Perhitungan Total Tagihan', () => {
    it('calculates total correctly as (harga_satuan * jumlah_porsi) + ongkir', () => {
      expect(calculateTotal(25000, 2, 5000)).toBe(55000);
      expect(calculateTotal(30000, 1, 0)).toBe(30000);
      expect(calculateTotal(15000, 3, 10000)).toBe(55000);
    });

    it('rejects negative ongkir', () => {
      expect(() => calculateTotal(25000, 2, -5000)).toThrow(/ongkir tidak boleh bernilai negatif/i);
    });
  });

  describe('Invariant 2: Validasi Batas Porsi Pesanan', () => {
    it('accepts valid portion within available stock', () => {
      expect(validatePesananPortion(1, 10)).toBe(true);
      expect(validatePesananPortion(10, 10)).toBe(true);
      expect(validatePesananPortion(5, 20)).toBe(true);
    });

    it('rejects portion less than 1 (0 or negative)', () => {
      expect(() => validatePesananPortion(0, 10)).toThrow(/jumlah porsi minimal 1/i);
      expect(() => validatePesananPortion(-2, 10)).toThrow(/jumlah porsi minimal 1/i);
    });

    it('rejects portion exceeding available stock', () => {
      expect(() => validatePesananPortion(11, 10)).toThrow(/melebihi sisa porsi/i);
      expect(() => validatePesananPortion(1, 0)).toThrow(/melebihi sisa porsi/i);
    });
  });

  describe('State Machine: Transisi Status Pesanan', () => {
    it('allows valid transitions from menunggu_bayar', () => {
      expect(isValidStatusTransition('menunggu_bayar', 'dibayar')).toBe(true);
      expect(isValidStatusTransition('menunggu_bayar', 'dibatalkan')).toBe(true);
    });

    it('allows valid transitions from dibayar', () => {
      expect(isValidStatusTransition('dibayar', 'diproses')).toBe(true);
      expect(isValidStatusTransition('dibayar', 'dibatalkan')).toBe(true);
    });

    it('allows valid transitions from diproses', () => {
      expect(isValidStatusTransition('diproses', 'selesai')).toBe(true);
    });

    it('prevents illegal status skips', () => {
      expect(isValidStatusTransition('menunggu_bayar', 'diproses')).toBe(false);
      expect(isValidStatusTransition('menunggu_bayar', 'selesai')).toBe(false);
      expect(isValidStatusTransition('dibayar', 'selesai')).toBe(false);
    });

    it('prevents illegal status rollbacks (mundur)', () => {
      expect(isValidStatusTransition('dibayar', 'menunggu_bayar')).toBe(false);
      expect(isValidStatusTransition('diproses', 'dibayar')).toBe(false);
      expect(isValidStatusTransition('diproses', 'menunggu_bayar')).toBe(false);
    });

    it('locks terminal statuses (selesai & dibatalkan)', () => {
      expect(isValidStatusTransition('selesai', 'dibatalkan')).toBe(false);
      expect(isValidStatusTransition('selesai', 'diproses')).toBe(false);
      expect(isValidStatusTransition('dibatalkan', 'menunggu_bayar')).toBe(false);
      expect(isValidStatusTransition('dibatalkan', 'dibayar')).toBe(false);
    });

    it('returns correct allowed next statuses list', () => {
      expect(getAllowedStatusTransitions('menunggu_bayar')).toEqual(['dibayar', 'dibatalkan']);
      expect(getAllowedStatusTransitions('dibayar')).toEqual(['diproses', 'dibatalkan']);
      expect(getAllowedStatusTransitions('diproses')).toEqual(['selesai']);
      expect(getAllowedStatusTransitions('selesai')).toEqual([]);
      expect(getAllowedStatusTransitions('dibatalkan')).toEqual([]);
    });
  });
});
