import { describe, it, expect } from 'vitest';
import { validateMenuInput } from '@/features/menu/services/menuService';
import { validatePelangganInput } from '@/features/pelanggan/services/pelangganService';
import {
  calculateTotal,
  validatePesananPortion,
  isValidStatusTransition,
} from '@/features/pesanan/services/pesananService';

describe('Uji Tembus 6 Masukan Tidak Sah (PRD Poin 8 & Skema Firestore)', () => {
  describe('1. Field Kosong (Empty Fields)', () => {
    it('menolak simpan menu jika nama kosong atau hanya spasi', () => {
      expect(() =>
        validateMenuInput({ nama: '', harga: 25000, sisa_porsi: 10, tersedia: true })
      ).toThrow(/nama.*wajib diisi/i);
      expect(() =>
        validateMenuInput({ nama: '   ', harga: 25000, sisa_porsi: 10, tersedia: true })
      ).toThrow(/nama.*wajib diisi/i);
    });

    it('menolak simpan pelanggan jika nama atau alamat kosong', () => {
      expect(() =>
        validatePelangganInput({ nama: '', no_whatsapp: '081234567890', alamat: 'Jl Melati' })
      ).toThrow(/nama pelanggan wajib diisi/i);
      expect(() =>
        validatePelangganInput({ nama: 'Budi', no_whatsapp: '081234567890', alamat: '   ' })
      ).toThrow(/alamat wajib diisi/i);
    });
  });

  describe('2. Tipe Salah (Invalid Types)', () => {
    it('menolak harga atau porsi menu bertipe non-angka atau NaN', () => {
      expect(() =>
        validateMenuInput({ nama: 'Ayam', harga: NaN, sisa_porsi: 10, tersedia: true })
      ).toThrow(/angka bulat/i);
      expect(() =>
        validateMenuInput({ nama: 'Ayam', harga: 25000, sisa_porsi: NaN, tersedia: true })
      ).toThrow(/angka bulat/i);
    });

    it('menolak porsi pesanan bertipe NaN', () => {
      expect(() => validatePesananPortion(NaN, 10)).toThrow(/jumlah porsi minimal 1/i);
    });
  });

  describe('3. Teks Terlalu Panjang (Length Exceeded)', () => {
    it('menolak nama menu lebih dari 60 karakter', () => {
      const longName = 'A'.repeat(61);
      expect(() =>
        validateMenuInput({ nama: longName, harga: 25000, sisa_porsi: 10, tersedia: true })
      ).toThrow(/maksimal 60 karakter/i);
    });

    it('menolak nama pelanggan lebih dari 60 karakter', () => {
      const longCustomer = 'B'.repeat(61);
      expect(() =>
        validatePelangganInput({ nama: longCustomer, no_whatsapp: '081234567890', alamat: 'Jl Melati' })
      ).toThrow(/maksimal 60 karakter/i);
    });

    it('menolak alamat pengiriman lebih dari 200 karakter', () => {
      const longAddress = 'C'.repeat(201);
      expect(() =>
        validatePelangganInput({ nama: 'Budi', no_whatsapp: '081234567890', alamat: longAddress })
      ).toThrow(/maksimal 200 karakter/i);
    });

    it('menolak nomor WhatsApp lebih dari 13 angka', () => {
      expect(() =>
        validatePelangganInput({ nama: 'Budi', no_whatsapp: '0812345678901234', alamat: 'Jl Melati' })
      ).toThrow(/nomor whatsapp tidak sah/i);
    });
  });

  describe('4. Nilai Negatif (Invariant 1: harga & porsi >= 0)', () => {
    it('menolak harga menu bernilai negatif', () => {
      expect(() =>
        validateMenuInput({ nama: 'Ayam', harga: -1000, sisa_porsi: 10, tersedia: true })
      ).toThrow(/tidak boleh bernilai negatif/i);
    });

    it('menolak sisa porsi menu bernilai negatif', () => {
      expect(() =>
        validateMenuInput({ nama: 'Ayam', harga: 20000, sisa_porsi: -5, tersedia: true })
      ).toThrow(/tidak boleh bernilai negatif/i);
    });

    it('menolak ongkos kirim pesanan bernilai negatif (Invariant 3)', () => {
      expect(() => calculateTotal(25000, 2, -1000)).toThrow(/ongkir tidak boleh bernilai negatif/i);
    });
  });

  describe('5. Nilai di Luar Batas (Invariant 2: 1 <= porsi <= sisa_porsi & WA bounds)', () => {
    it('menolak jumlah porsi pesanan bernilai 0 atau minus', () => {
      expect(() => validatePesananPortion(0, 10)).toThrow(/jumlah porsi minimal 1/i);
      expect(() => validatePesananPortion(-1, 10)).toThrow(/jumlah porsi minimal 1/i);
    });

    it('menolak jumlah porsi pesanan yang melebihi sisa stok menu', () => {
      expect(() => validatePesananPortion(15, 10)).toThrow(/melebihi sisa porsi/i);
      expect(() => validatePesananPortion(1, 0)).toThrow(/melebihi sisa porsi/i);
    });

    it('menolak nomor WhatsApp yang kurang dari 10 angka atau bukan awalan 08', () => {
      expect(() =>
        validatePelangganInput({ nama: 'Budi', no_whatsapp: '08123', alamat: 'Jl Melati' })
      ).toThrow(/nomor whatsapp tidak sah/i);
      expect(() =>
        validatePelangganInput({ nama: 'Budi', no_whatsapp: '07123456789', alamat: 'Jl Melati' })
      ).toThrow(/nomor whatsapp tidak sah/i);
    });
  });

  describe('6. Perubahan Status Tidak Sah (State Machine Integrity)', () => {
    it('menolak loncatan status (misal menunggu_bayar langsung selesai)', () => {
      expect(isValidStatusTransition('menunggu_bayar', 'selesai')).toBe(false);
      expect(isValidStatusTransition('menunggu_bayar', 'diproses')).toBe(false);
      expect(isValidStatusTransition('dibayar', 'selesai')).toBe(false);
    });

    it('menolak status mundur (rollback)', () => {
      expect(isValidStatusTransition('dibayar', 'menunggu_bayar')).toBe(false);
      expect(isValidStatusTransition('diproses', 'dibayar')).toBe(false);
      expect(isValidStatusTransition('diproses', 'menunggu_bayar')).toBe(false);
    });

    it('menolak perubahan apapun pada status akhir/terminal (selesai & dibatalkan)', () => {
      expect(isValidStatusTransition('selesai', 'dibatalkan')).toBe(false);
      expect(isValidStatusTransition('selesai', 'diproses')).toBe(false);
      expect(isValidStatusTransition('dibatalkan', 'menunggu_bayar')).toBe(false);
      expect(isValidStatusTransition('dibatalkan', 'dibayar')).toBe(false);
    });
  });
});
