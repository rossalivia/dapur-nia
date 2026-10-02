import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pesanan, LaporanHarian } from '@/types';

export function aggregateLaporan(orders: Pesanan[], tanggal: string): LaporanHarian {
  // Hanya hitung pesanan yang tidak dibatalkan
  const validOrders = orders.filter((order) => order.status !== 'dibatalkan');

  let totalPorsiTerjual = 0;
  let totalUangMasuk = 0;
  const porsiPerMenu: Record<string, number> = {};

  for (const order of validOrders) {
    const porsi = Number(order.jumlah_porsi) || 0;
    const total = Number(order.total) || 0;

    totalPorsiTerjual += porsi;
    totalUangMasuk += total;

    const menuName = order.nama_menu || 'Menu Tanpa Nama';
    porsiPerMenu[menuName] = (porsiPerMenu[menuName] || 0) + porsi;
  }

  return {
    tanggal,
    totalPorsiTerjual,
    totalUangMasuk,
    porsiPerMenu,
    pesananList: validOrders,
  };
}

export const laporanService = {
  async getLaporanByDate(tanggal: string): Promise<LaporanHarian> {
    const q = query(collection(db, 'pesanan'), where('tanggal', '==', tanggal));
    const snapshot = await getDocs(q);

    const orders = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Pesanan[];

    return aggregateLaporan(orders, tanggal);
  },
};
