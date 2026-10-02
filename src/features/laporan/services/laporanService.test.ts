import { describe, it, expect } from 'vitest';
import { aggregateLaporan } from './laporanService';
import { Pesanan } from '@/types';

describe('aggregateLaporan', () => {
  it('aggregates portions and revenue correctly while strictly excluding dibatalkan orders', () => {
    const mockOrders: Partial<Pesanan>[] = [
      {
        nama_menu: 'Nasi Ayam Bakar',
        jumlah_porsi: 2,
        total: 55000,
        status: 'selesai',
        tanggal: '2026-10-02',
      },
      {
        nama_menu: 'Nasi Ayam Bakar',
        jumlah_porsi: 1,
        total: 30000,
        status: 'dibayar',
        tanggal: '2026-10-02',
      },
      {
        nama_menu: 'Nasi Rendang Padang',
        jumlah_porsi: 3,
        total: 101000,
        status: 'menunggu_bayar',
        tanggal: '2026-10-02',
      },
      {
        // Cancelled order — must NOT be included in calculations
        nama_menu: 'Nasi Ayam Bakar',
        jumlah_porsi: 5,
        total: 130000,
        status: 'dibatalkan',
        tanggal: '2026-10-02',
      },
    ];

    const report = aggregateLaporan(mockOrders as Pesanan[], '2026-10-02');

    // Non-cancelled: 2 + 1 + 3 = 6 porsi
    expect(report.totalPorsiTerjual).toBe(6);

    // Non-cancelled total: 55000 + 30000 + 101000 = 186000
    expect(report.totalUangMasuk).toBe(186000);

    // Per menu: Ayam = 2 + 1 = 3, Rendang = 3
    expect(report.porsiPerMenu['Nasi Ayam Bakar']).toBe(3);
    expect(report.porsiPerMenu['Nasi Rendang Padang']).toBe(3);

    // Only non-cancelled orders returned in list
    expect(report.pesananList.length).toBe(3);
  });

  it('handles empty orders or all cancelled orders with zeros and empty map', () => {
    const allCancelled: Partial<Pesanan>[] = [
      {
        nama_menu: 'Nasi Ayam Bakar',
        jumlah_porsi: 2,
        total: 55000,
        status: 'dibatalkan',
        tanggal: '2026-10-02',
      },
    ];

    const report = aggregateLaporan(allCancelled as Pesanan[], '2026-10-02');
    expect(report.totalPorsiTerjual).toBe(0);
    expect(report.totalUangMasuk).toBe(0);
    expect(Object.keys(report.porsiPerMenu).length).toBe(0);
    expect(report.pesananList.length).toBe(0);
  });
});
