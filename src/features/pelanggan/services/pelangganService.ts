import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pelanggan } from '@/types';
import { validateWhatsApp } from '@/lib/formatters';

export function validatePelangganInput(data: { nama: string; no_whatsapp: string; alamat: string }): boolean {
  if (!data.nama || !data.nama.trim()) {
    throw new Error('Nama pelanggan wajib diisi.');
  }

  if (data.nama.trim().length > 60) {
    throw new Error('Nama pelanggan maksimal 60 karakter.');
  }

  const cleanWA = data.no_whatsapp?.trim() || '';
  if (!cleanWA || !validateWhatsApp(cleanWA)) {
    throw new Error('Nomor WhatsApp tidak sah. Harus diawali 08 dan memiliki panjang 10 sampai 13 angka.');
  }

  if (!data.alamat || !data.alamat.trim()) {
    throw new Error('Alamat wajib diisi.');
  }

  if (data.alamat.trim().length > 200) {
    throw new Error('Alamat pengiriman maksimal 200 karakter.');
  }

  return true;
}

export const pelangganService = {
  async getAllPelanggan(): Promise<Pelanggan[]> {
    const q = query(collection(db, 'pelanggan'), orderBy('dibuat_pada', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Pelanggan[];
  },

  async checkWhatsAppExists(no_whatsapp: string): Promise<boolean> {
    const cleanWA = no_whatsapp.trim();
    const docRef = doc(db, 'pelanggan', cleanWA);
    const snap = await getDoc(docRef);
    return snap.exists();
  },

  async addPelanggan(data: { nama: string; no_whatsapp: string; alamat: string }): Promise<void> {
    validatePelangganInput(data);
    const cleanWA = data.no_whatsapp.trim();

    // Pastikan WhatsApp belum terdaftar (Unik)
    const exists = await this.checkWhatsAppExists(cleanWA);
    if (exists) {
      throw new Error(`Nomor WhatsApp ${cleanWA} sudah terdaftar sebagai pelanggan.`);
    }

    const docRef = doc(db, 'pelanggan', cleanWA);
    await setDoc(docRef, {
      nama: data.nama.trim(),
      no_whatsapp: cleanWA,
      alamat: data.alamat.trim(),
      dibuat_pada: serverTimestamp(),
    });
  },

  async updatePelanggan(no_whatsapp: string, data: { nama: string; alamat: string }): Promise<void> {
    if (!data.nama || !data.nama.trim()) {
      throw new Error('Nama pelanggan wajib diisi.');
    }
    if (data.nama.trim().length > 60) {
      throw new Error('Nama pelanggan maksimal 60 karakter.');
    }
    if (!data.alamat || !data.alamat.trim()) {
      throw new Error('Alamat wajib diisi.');
    }
    if (data.alamat.trim().length > 200) {
      throw new Error('Alamat pengiriman maksimal 200 karakter.');
    }

    const docRef = doc(db, 'pelanggan', no_whatsapp);
    await updateDoc(docRef, {
      nama: data.nama.trim(),
      alamat: data.alamat.trim(),
    });
  },

  async deletePelanggan(no_whatsapp: string): Promise<void> {
    const docRef = doc(db, 'pelanggan', no_whatsapp);
    await deleteDoc(docRef);
  },
};
