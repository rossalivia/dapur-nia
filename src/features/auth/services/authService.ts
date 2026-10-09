import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { LoginDTO, RegisterPelangganDTO } from '../types';
import { Pelanggan } from '@/types';

const DEFAULT_ADMIN_EMAILS = ['admin@dapurnia.com', 'dina@dapurnia.com'];

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  const envAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const allAdminEmails = [...DEFAULT_ADMIN_EMAILS, ...envAdminEmails];
  return allAdminEmails.includes(normalized);
}

export function formatAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan sistem yang tidak diketahui.';
  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.';
    case 'auth/weak-password':
      return 'Kata sandi minimal harus terdiri dari 6 karakter.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi beberapa saat lagi.';
    default:
      return error.message || 'Gagal memproses permintaan autentikasi.';
  }
}

export async function loginUser(dto: LoginDTO): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, dto.email.trim(), dto.password);
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }
}

export async function registerPelanggan(
  dto: RegisterPelangganDTO
): Promise<{ userCredential: UserCredential; profile: Pelanggan }> {
  // 1. Validasi awal nomor WhatsApp (08, 10-13 digit)
  const cleanPhone = dto.no_whatsapp.trim();
  if (!/^08\d{8,11}$/.test(cleanPhone)) {
    throw new Error('Nomor WhatsApp harus diawali 08 dan memiliki panjang 10-13 angka.');
  }

  // 2. Buat akun Firebase Authentication
  let userCredential: UserCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(
      auth,
      dto.email.trim(),
      dto.password
    );
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }

  // 3. Simpan/sinkronkan data pelanggan ke Firestore
  const pelangganRef = doc(db, 'pelanggan', cleanPhone);
  const pelangganData: Pelanggan = {
    id: cleanPhone,
    nama: dto.nama.trim(),
    no_whatsapp: cleanPhone,
    alamat: dto.alamat.trim(),
    dibuat_pada: serverTimestamp(),
  };

  try {
    await setDoc(pelangganRef, {
      ...pelangganData,
      email: dto.email.trim().toLowerCase(),
    });
  } catch (err: any) {
    console.error('Failed to sync profile to Firestore:', err);
    // Kita tidak batalkan auth jika Firestore lambat, tapi tetap kembalikan profil lokal
  }

  return { userCredential, profile: pelangganData };
}

export async function fetchPelangganProfile(noWhatsapp: string): Promise<Pelanggan | null> {
  try {
    const snap = await getDoc(doc(db, 'pelanggan', noWhatsapp));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Pelanggan;
    }
  } catch (err) {
    console.warn('Error fetching pelanggan profile:', err);
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
