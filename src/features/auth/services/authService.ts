import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
import { LoginDTO, RegisterDTO, UserRole } from '../types';
import { Pelanggan } from '@/types';

const DEFAULT_ADMIN_EMAILS = [
  'admin@dapurnia.com',
  'dina@dapurnia.com',
];

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
    case 'INVALID_LOGIN_CREDENTIALS':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.';
    case 'auth/weak-password':
      return 'Kata sandi minimal harus terdiri dari 6 karakter.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.';
    case 'auth/popup-closed-by-user':
      return 'Proses masuk dibatalkan.';
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

export async function loginWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }
}

export async function registerPelanggan(
  dto: RegisterDTO
): Promise<{ userCredential: UserCredential; profile: Pelanggan & { role?: UserRole } }> {
  const cleanPhone = dto.no_whatsapp.trim();
  if (!/^08\d{8,11}$/.test(cleanPhone)) {
    throw new Error('Nomor WhatsApp harus diawali 08 dan memiliki panjang 10-13 angka.');
  }

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

  const role = dto.role || 'pelanggan';
  const pelangganRef = doc(db, 'pelanggan', cleanPhone);
  const pelangganData: Pelanggan & { role: UserRole } = {
    id: cleanPhone,
    nama: dto.nama.trim(),
    no_whatsapp: cleanPhone,
    alamat: dto.alamat.trim(),
    role: role,
    dibuat_pada: serverTimestamp(),
  };

  try {
    await setDoc(pelangganRef, {
      ...pelangganData,
      email: dto.email.trim().toLowerCase(),
    });
  } catch (err: any) {
    console.warn('Gagal menyimpan profil ke Firestore pelanggan:', err);
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
