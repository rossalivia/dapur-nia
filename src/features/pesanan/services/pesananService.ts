import {
  collection,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pesanan, PesananStatus } from '@/types';
import { getTodayDateString } from '@/lib/formatters';

export function calculateTotal(harga_satuan: number, jumlah_porsi: number, ongkir: number): number {
  if (ongkir < 0) {
    throw new Error('Ongkir tidak boleh bernilai negatif.');
  }
  return Math.round(harga_satuan * jumlah_porsi + ongkir);
}

export function validatePesananPortion(jumlah_porsi: number, sisa_porsi: number): boolean {
  if (jumlah_porsi < 1 || isNaN(jumlah_porsi)) {
    throw new Error('Jumlah porsi minimal 1.');
  }
  if (jumlah_porsi > sisa_porsi) {
    throw new Error(`Jumlah porsi melebihi sisa porsi menu (tersedia: ${sisa_porsi} porsi).`);
  }
  return true;
}

export function isValidStatusTransition(current: PesananStatus, next: PesananStatus): boolean {
  const allowedMap: Record<PesananStatus, PesananStatus[]> = {
    menunggu_bayar: ['dibayar', 'dibatalkan'],
    dibayar: ['diproses', 'dibatalkan'],
    diproses: ['selesai'],
    selesai: [],
    dibatalkan: [],
  };

  return allowedMap[current]?.includes(next) ?? false;
}

export function getAllowedStatusTransitions(current: PesananStatus): PesananStatus[] {
  const allowedMap: Record<PesananStatus, PesananStatus[]> = {
    menunggu_bayar: ['dibayar', 'dibatalkan'],
    dibayar: ['diproses', 'dibatalkan'],
    diproses: ['selesai'],
    selesai: [],
    dibatalkan: [],
  };

  return allowedMap[current] || [];
}

export interface CreatePesananDTO {
  pelanggan_id: string;
  nama_pelanggan: string;
  alamat_kirim: string;
  menu_id: string;
  nama_menu: string;
  harga_satuan: number;
  jumlah_porsi: number;
  ongkir: number;
  bukti_bayar?: string;
  tanggal?: string;
  email_pelanggan?: string;
  user_id?: string;
}

export const pesananService = {
  async getAllPesanan(): Promise<Pesanan[]> {
    const q = query(collection(db, 'pesanan'), orderBy('dibuat_pada', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Pesanan[];
  },

  async createPesanan(dto: CreatePesananDTO): Promise<string> {
    const calculatedTotal = calculateTotal(dto.harga_satuan, dto.jumlah_porsi, dto.ongkir);
    const orderDate = dto.tanggal || getTodayDateString();

    const menuRef = doc(db, 'menu', dto.menu_id);
    const pesananCol = collection(db, 'pesanan');
    const newPesananRef = doc(pesananCol);

    await runTransaction(db, async (transaction) => {
      const menuDoc = await transaction.get(menuRef);
      if (!menuDoc.exists()) {
        throw new Error('Menu yang dipesan tidak ditemukan.');
      }

      const currentSisa = menuDoc.data().sisa_porsi ?? 0;
      validatePesananPortion(dto.jumlah_porsi, currentSisa);

      const newSisa = currentSisa - dto.jumlah_porsi;
      transaction.update(menuRef, { sisa_porsi: newSisa });

      transaction.set(newPesananRef, {
        pelanggan_id: dto.pelanggan_id,
        nama_pelanggan: dto.nama_pelanggan,
        alamat_kirim: dto.alamat_kirim,
        menu_id: dto.menu_id,
        nama_menu: dto.nama_menu,
        harga_satuan: dto.harga_satuan,
        jumlah_porsi: dto.jumlah_porsi,
        ongkir: dto.ongkir,
        total: calculatedTotal,
        status: 'menunggu_bayar',
        bukti_bayar: dto.bukti_bayar || '',
        tanggal: orderDate,
        email_pelanggan: dto.email_pelanggan || '',
        user_id: dto.user_id || '',
        dibuat_pada: serverTimestamp(),
      });
    });

    return newPesananRef.id;
  },

  async updateStatus(
    id: string,
    currentStatus: PesananStatus,
    nextStatus: PesananStatus,
    menuId?: string,
    jumlahPorsi?: number
  ): Promise<void> {
    if (!isValidStatusTransition(currentStatus, nextStatus)) {
      throw new Error(`Perubahan status tidak sah: dari '${currentStatus}' ke '${nextStatus}'.`);
    }

    const pesananRef = doc(db, 'pesanan', id);

    // Jika pesanan dibatalkan sebelum selesai, kembalikan stok menu
    if (nextStatus === 'dibatalkan' && menuId && typeof jumlahPorsi === 'number' && jumlahPorsi > 0) {
      const menuRef = doc(db, 'menu', menuId);
      await runTransaction(db, async (transaction) => {
        const menuDoc = await transaction.get(menuRef);
        if (menuDoc.exists()) {
          const currentSisa = menuDoc.data().sisa_porsi ?? 0;
          transaction.update(menuRef, { sisa_porsi: currentSisa + jumlahPorsi });
        }
        transaction.update(pesananRef, { status: nextStatus });
      });
    } else {
      await runTransaction(db, async (transaction) => {
        transaction.update(pesananRef, { status: nextStatus });
      });
    }
  },
};
