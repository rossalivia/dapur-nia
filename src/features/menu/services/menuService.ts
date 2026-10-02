import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Menu } from '@/types';

export function validateMenuInput(data: Omit<Menu, 'id' | 'dibuat_pada'>): boolean {
  if (!data.nama || !data.nama.trim()) {
    throw new Error('Nama menu wajib diisi.');
  }

  if (data.nama.trim().length > 60) {
    throw new Error('Nama menu maksimal 60 karakter.');
  }

  if (typeof data.harga !== 'number' || isNaN(data.harga)) {
    throw new Error('Harga harus berupa angka bulat.');
  }

  if (typeof data.sisa_porsi !== 'number' || isNaN(data.sisa_porsi)) {
    throw new Error('Sisa porsi harus berupa angka bulat.');
  }

  // Invariant 1: harga dan sisa_porsi tidak pernah bernilai negatif
  if (data.harga < 0) {
    throw new Error('Harga tidak boleh bernilai negatif.');
  }

  if (data.sisa_porsi < 0) {
    throw new Error('Sisa porsi tidak boleh bernilai negatif.');
  }

  return true;
}

export const menuService = {
  async getAllMenus(): Promise<Menu[]> {
    const q = query(collection(db, 'menu'), orderBy('dibuat_pada', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Menu[];
  },

  async addMenu(data: Omit<Menu, 'id' | 'dibuat_pada'>): Promise<string> {
    validateMenuInput(data);
    const docRef = await addDoc(collection(db, 'menu'), {
      nama: data.nama.trim(),
      harga: Math.round(data.harga),
      sisa_porsi: Math.round(data.sisa_porsi),
      tersedia: Boolean(data.tersedia),
      dibuat_pada: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateMenu(id: string, data: Partial<Omit<Menu, 'id' | 'dibuat_pada'>>): Promise<void> {
    if (data.nama !== undefined && (!data.nama || !data.nama.trim())) {
      throw new Error('Nama menu wajib diisi.');
    }
    if (data.nama && data.nama.trim().length > 60) {
      throw new Error('Nama menu maksimal 60 karakter.');
    }
    if (data.harga !== undefined && (isNaN(data.harga) || data.harga < 0)) {
      throw new Error('Harga tidak boleh bernilai negatif.');
    }
    if (data.sisa_porsi !== undefined && (isNaN(data.sisa_porsi) || data.sisa_porsi < 0)) {
      throw new Error('Sisa porsi tidak boleh bernilai negatif.');
    }

    const docRef = doc(db, 'menu', id);
    const updatePayload: Record<string, any> = {};

    if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
    if (data.harga !== undefined) updatePayload.harga = Math.round(data.harga);
    if (data.sisa_porsi !== undefined) updatePayload.sisa_porsi = Math.round(data.sisa_porsi);
    if (data.tersedia !== undefined) updatePayload.tersedia = Boolean(data.tersedia);

    await updateDoc(docRef, updatePayload);
  },

  async deleteMenu(id: string): Promise<void> {
    const docRef = doc(db, 'menu', id);
    await deleteDoc(docRef);
  },
};
